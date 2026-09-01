'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { acquireWebGL, hasWebGL } from '@/lib/webgl-owner';
import { createModel } from './glassesModel';
import { glassesConfig } from './glassesConfig';

function physical(color: number, roughness: number, extra: Record<string, unknown>) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.28,
    envMapIntensity: 0.82, ...extra,
  });
}

function createMaterials() {
  const materials = {
    translucentFramePlastic: physical(0xf2f1ed, 0.24, {
      transparent: false, opacity: 1, transmission: 0, thickness: 0.32, ior: 1.46,
      clearcoat: 0.52, clearcoatRoughness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.92,
    }),
    amberOpticalLens: physical(0xffc21a, 0.14, {
      transparent: true, opacity: 0.68, transmission: 0.18, thickness: 0.16, ior: 1.49,
      clearcoat: 0.74, clearcoatRoughness: 0.1, emissive: 0x2a1700,
      emissiveIntensity: 0.1, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.05,
    }),
  };
  return { ...materials, dispose: () => Object.values(materials).forEach((material) => material.dispose()) };
}

export default function GlassesScene({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rearRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !hasWebGL()) return;
    const hero = host.closest('section');
    if (!hero) return;
    const rearCanvas = document.createElement('canvas');
    const frontCanvas = document.createElement('canvas');
    rearCanvas.className = 'signalsGlassesScene signalsGlassesRear';
    frontCanvas.className = 'signalsGlassesScene signalsGlassesFront';
    rearCanvas.setAttribute('aria-hidden', 'true');
    frontCanvas.setAttribute('aria-hidden', 'true');
    rearRef.current = rearCanvas;
    frontRef.current = frontCanvas;
    hero.append(rearCanvas, frontCanvas);
    let cancelled = false;
    let release: (() => void) | null = null;
    let disposeScene: (() => void) | null = null;

    void (async () => {
      try {
        release = await acquireWebGL('signals-hero-glasses', () => disposeScene?.());
        if (cancelled || !rearRef.current || !frontRef.current) return release();

        const createLayer = (canvas: HTMLCanvasElement) => {
          const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
          renderer.setClearColor(0x000000, 0);
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.NeutralToneMapping;
          renderer.toneMappingExposure = 1.02;
          renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
          const scene = new THREE.Scene();
          const environmentRoom = new RoomEnvironment();
          const environmentGenerator = new THREE.PMREMGenerator(renderer);
          const environmentTarget = environmentGenerator.fromScene(environmentRoom, 0.04);
          scene.environment = environmentTarget.texture;
          scene.environmentIntensity = 0.78;
          return { renderer, scene, environmentRoom, environmentGenerator, environmentTarget };
        };
        const rearLayer = createLayer(rearCanvas);
        const frontLayer = createLayer(frontCanvas);

        const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100);
        camera.position.set(4.557771312866902, 6.021501054870097, 12.14134607613082);
        camera.lookAt(0, 0, -2.4);
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
        keyLight.position.set(-6, 10, 9);
        const rimLight = new THREE.DirectionalLight(0xffead6, 0.18);
        rimLight.position.set(7, 3, -6);
        const softbox = new THREE.RectAreaLight(0xffffff, 3.2, 6, 6);
        softbox.position.set(-5, 8, 10);
        softbox.lookAt(0, 0, 0);
        const addLights = (scene: THREE.Scene) => {
          scene.add(
            new THREE.HemisphereLight(0xffffff, 0xd8cdbd, 0.3),
            keyLight.clone(), rimLight.clone(), softbox.clone(),
          );
        };
        addLights(rearLayer.scene);
        addLights(frontLayer.scene);

        const rearMaterials = createMaterials();
        const frontMaterials = createMaterials();
        const rearModel = createModel({ materials: rearMaterials, config: glassesConfig });
        const frontModel = createModel({ materials: frontMaterials, config: glassesConfig });
        const rearHiddenParts = [
          ...(rearModel.groups.frame as THREE.Object3D[]),
          ...(rearModel.groups.optics as THREE.Object3D[]),
          ...(rearModel.groups.hardware as THREE.Object3D[]),
        ];
        rearHiddenParts.forEach((part) => { part.visible = false; });
        (frontModel.groups.temples as THREE.Object3D[]).forEach((part) => { part.visible = false; });
        const alignmentBounds = new THREE.Box3();
        [
          ...(frontModel.groups.frame as THREE.Object3D[]),
          ...(frontModel.groups.optics as THREE.Object3D[]),
        ].forEach((part) => alignmentBounds.expandByObject(part));
        const alignmentCenter = alignmentBounds.getCenter(new THREE.Vector3());
        const roots = [rearModel.root, frontModel.root];
        roots.forEach((root) => {
          root.position.set(0, 0, 0);
          root.rotation.set(0, 0, 0);
        });
        rearLayer.scene.add(rearModel.root);
        frontLayer.scene.add(frontModel.root);

        const baseQuaternions = roots.map((root) => root.quaternion.clone());
        const basePositions = roots.map((root) => root.position.clone());
        const pivotAtRest = new THREE.Vector3();
        const pivotAfterRotation = new THREE.Vector3();
        const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let frame = 0;
        let visible = true;
        let responsiveScale = 0.93;
        let verticalShiftFactor = 2.4;
        let interactionBounds: { left: number; right: number; top: number; bottom: number } | null = null;
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        let lastTime = performance.now();
        const startedAt = lastTime;
        const titleWord = document.querySelector<HTMLElement>('[data-signals-word]');
        const resize = () => {
          const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
          const hostRect = host.getBoundingClientRect();
          const heroRect = hero.getBoundingClientRect();
          for (const canvas of [rearCanvas, frontCanvas]) {
            canvas.style.left = `${hostRect.left - heroRect.left}px`;
            canvas.style.top = `${hostRect.top - heroRect.top}px`;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
          }
          rearLayer.renderer.setSize(width, height, false);
          frontLayer.renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          let titleWidth = width * 0.72;
          let titleRect: DOMRect | null = null;
          if (titleWord) {
            const textRange = document.createRange();
            textRange.selectNodeContents(titleWord);
            titleRect = textRange.getBoundingClientRect();
            titleWidth = titleRect.width || titleWidth;
            textRange.detach();
          }
          responsiveScale = THREE.MathUtils.clamp(0.58 * titleWidth / height, 0.27, 0.93);
          if (titleRect) {
            interactionBounds = {
              left: titleRect.left - titleRect.width * 0.12,
              right: titleRect.right + titleRect.width * 0.12,
              top: titleRect.top - titleRect.height * 0.5,
              bottom: titleRect.bottom + titleRect.height,
            };
            roots.forEach((root, index) => {
              root.position.copy(basePositions[index]);
              root.quaternion.copy(baseQuaternions[index]);
              root.scale.setScalar(responsiveScale);
              root.updateMatrixWorld(true);
            });
            camera.updateMatrixWorld(true);
            const projectedCenter = alignmentCenter.clone()
              .applyMatrix4(rearModel.root.matrixWorld)
              .project(camera);
            const modelCenterX = (projectedCenter.x * 0.5 + 0.5) * width;
            const modelCenterY = (-projectedCenter.y * 0.5 + 0.5) * height;
            const offsetX = titleRect.left + titleRect.width / 2 - (hostRect.left + modelCenterX);
            const offsetY = titleRect.top + titleRect.height * 0.65 - (hostRect.top + modelCenterY);
            const projectedOrigin = new THREE.Vector3().project(camera);
            const projectedUnitUp = screenUp.clone().project(camera);
            const pixelsPerWorldUnit = Math.max(1, Math.abs(projectedUnitUp.y - projectedOrigin.y) * height * 0.5);
            verticalShiftFactor = titleRect.height * 0.35 / pixelsPerWorldUnit / 0.4;
            const transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            rearCanvas.style.transform = transform;
            frontCanvas.style.transform = transform;
          }
        };
        const render = () => {
          if (!visible) return;
          const now = performance.now(), dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;
          const response = 1 - Math.exp(-3.2 * dt);
          currentX += (targetX - currentX) * response;
          currentY += (targetY - currentY) * response;
          const idle = reduceMotion ? 0 : Math.sin((now - startedAt) / 2400) * 0.035;
          const interactionRotation = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(currentY * 0.06, currentX * 0.16 + idle, currentX * 0.025),
          );
          roots.forEach((root, index) => {
            const animatedScale = responsiveScale * (1 + (reduceMotion ? 0 : Math.sin((now - startedAt) / 1300) * 0.01));
            root.quaternion.copy(baseQuaternions[index]).multiply(interactionRotation);
            root.scale.setScalar(animatedScale);
            pivotAtRest.copy(alignmentCenter).multiplyScalar(animatedScale).applyQuaternion(baseQuaternions[index]);
            pivotAfterRotation.copy(alignmentCenter).multiplyScalar(animatedScale).applyQuaternion(root.quaternion);
            root.position.copy(basePositions[index])
              .add(pivotAtRest)
              .sub(pivotAfterRotation)
              .addScaledVector(screenUp, -currentY * verticalShiftFactor);
          });
          rearModel.update(dt);
          frontModel.update(dt);
          rearLayer.renderer.render(rearLayer.scene, camera);
          frontLayer.renderer.render(frontLayer.scene, camera);
          frame = requestAnimationFrame(render);
        };
        const pointerMove = (event: PointerEvent) => {
          const bounds = interactionBounds;
          if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            targetX = 0;
            targetY = 0;
            return;
          }
          targetX = THREE.MathUtils.clamp(((event.clientX - bounds.left) / (bounds.right - bounds.left) - 0.5) * 1.1, -0.55, 0.55);
          targetY = THREE.MathUtils.clamp(((event.clientY - bounds.top) / (bounds.bottom - bounds.top) - 0.5) * 0.8, -0.4, 0.4);
        };
        const pointerLeave = () => { targetX = 0; targetY = 0; };
        const resizeObserver = new ResizeObserver(resize);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          if (visible) render(); else cancelAnimationFrame(frame);
        }, { rootMargin: '20% 0px' });
        resizeObserver.observe(host);
        if (titleWord) resizeObserver.observe(titleWord);
        window.addEventListener('resize', resize);
        visibilityObserver.observe(host);
        window.addEventListener('pointermove', pointerMove);
        window.addEventListener('pointerleave', pointerLeave);
        resize();
        const settleFrame = requestAnimationFrame(() => requestAnimationFrame(resize));
        void document.fonts.ready.then(() => { if (!cancelled) resize(); });
        render();

        disposeScene = () => {
          cancelAnimationFrame(frame);
          cancelAnimationFrame(settleFrame);
          resizeObserver.disconnect(); visibilityObserver.disconnect();
          window.removeEventListener('resize', resize);
          window.removeEventListener('pointermove', pointerMove);
          window.removeEventListener('pointerleave', pointerLeave);
          rearModel.dispose(); frontModel.dispose(); rearMaterials.dispose(); frontMaterials.dispose();
          for (const layer of [rearLayer, frontLayer]) {
            layer.scene.environment = null;
            layer.environmentTarget.dispose(); layer.environmentGenerator.dispose(); layer.environmentRoom.dispose();
            layer.renderer.dispose(); layer.renderer.forceContextLoss();
          }
          disposeScene = null;
        };
      } catch (error) {
        console.warn('[signals] Glasses hero failed to initialize.', error);
        release?.();
      }
    })();
    return () => {
      cancelled = true;
      release?.();
      rearRef.current = null;
      frontRef.current = null;
      rearCanvas.remove();
      frontCanvas.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className={className} aria-label="眼镜三维模型" />
  );
}
