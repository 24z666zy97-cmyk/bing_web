'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { acquireWebGL, hasWebGL } from '@/lib/webgl-owner';
import { createAnalyticsClipboardModel, type AnalyticsClipboardMaterials } from './analyticsClipboardModel';

function physical(color: number, roughness = 0.45, metalness = 0, extra: Record<string, unknown> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28,
    envMapIntensity: 0.82,
    ...extra,
  });
}

function createMaterials(): AnalyticsClipboardMaterials & { dispose(): void } {
  const materials = {
    board: physical(0xffdda3, 0.44, 0, { clearcoat: 0.22 }),
    paper: physical(0xfff8ec, 0.74),
    paperEdge: physical(0xe7dac8, 0.82),
    chartRed: physical(0xff261d, 0.22, 0, { clearcoat: 0.66, clearcoatRoughness: 0.2 }),
    chartRedSide: physical(0xc91712, 0.3, 0, { clearcoat: 0.42 }),
    cursorYellow: physical(0xffc52a, 0.18, 0, { clearcoat: 0.78, clearcoatRoughness: 0.16 }),
    cursorYellowSide: physical(0xd98a00, 0.28, 0, { clearcoat: 0.46, clearcoatRoughness: 0.24 }),
    tabBlue: physical(0x087ddd, 0.27, 0, { clearcoat: 0.42 }),
    tabBlueSide: physical(0x0864b2, 0.34, 0, { clearcoat: 0.28 }),
    tabPink: physical(0xef6695, 0.31, 0, { clearcoat: 0.38 }),
    tabPinkSide: physical(0xc94e7b, 0.36, 0, { clearcoat: 0.26 }),
    steel: physical(0xd3d5d8, 0.15, 1, { clearcoat: 0.34, envMapIntensity: 1.7 }),
    printInk: physical(0xaaa39b, 0.86),
  };
  return {
    ...materials,
    dispose() {
      Object.values(materials).forEach((material) => material.dispose());
    },
  };
}

export default function AnalyticsClipboardScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) return;

    let cancelled = false;
    let release: (() => void) | null = null;
    let disposeScene: (() => void) | null = null;

    void (async () => {
      try {
        release = await acquireWebGL('sense-hero-analytics-clipboard', () => disposeScene?.());
        if (cancelled || !canvasRef.current) return release();

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 1.02;
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const scene = new THREE.Scene();
        /* 原模型是在明亮的中性界面中校准的。网页改为黑底后仍保持画布透明，
           仅向物理材质提供不可见的摄影棚反射，避免金属和清漆暗面发黑。 */
        const environmentRoom = new RoomEnvironment();
        const environmentGenerator = new THREE.PMREMGenerator(renderer);
        const environmentTarget = environmentGenerator.fromScene(environmentRoom, 0.04);
        scene.environment = environmentTarget.texture;
        scene.environmentIntensity = 0.78;
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(18.58411768952687, 2.8499212358372255, 14.893300444195463);
        camera.lookAt(0, -0.1498800159991467, 0.005998400127995124);
        const screenRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
        const basePosition = new THREE.Vector3(0.5, 1.35, 0);
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
        keyLight.position.set(-6, 10, 9);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(2048, 2048);
        keyLight.shadow.radius = 7;
        keyLight.shadow.bias = -0.0004;
        keyLight.shadow.normalBias = 0.018;

        const rimLight = new THREE.DirectionalLight(0xffead6, 0.18);
        rimLight.position.set(7, 3, -6);

        const softbox = new THREE.RectAreaLight(0xffffff, 3.2, 6, 6);
        softbox.position.set(-5, 8, 10);
        softbox.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cdbd, 0.3), keyLight, rimLight, softbox);

        const materials = createMaterials();
        const model = createAnalyticsClipboardModel(materials);
        const root = model.root;
        root.scale.setScalar(0.943);
        root.rotation.set(-0.04, 0.04, 0);
        scene.add(root);

        const baseQuaternion = root.quaternion.clone();
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobileQuery = matchMedia('(max-width: 767px)');
        let frame = 0;
        let visible = true;
        let dragging = false;
        let pointerInside = false;
        let lastX = 0;
        let pointerX = 0;
        let pointerY = 0;
        let hoverX = 0;
        let hoverY = 0;
        let spin = 0;
        let spinVelocity = 0;
        let lastTime = performance.now();
        const startedAt = lastTime;
        const rotationLimit = Math.PI / 4;

        const resize = () => {
          const width = Math.max(1, canvas.clientWidth);
          const height = Math.max(1, canvas.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        const render = () => {
          if (!visible) return;
          const now = performance.now();
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;
          const time = (now - startedAt) / 1000;
          const positionResponse = pointerInside || dragging ? 6 : 1.8;
          const positionLerp = 1 - Math.exp(-positionResponse * dt);
          hoverX += (pointerX - hoverX) * positionLerp;
          hoverY += (pointerY - hoverY) * positionLerp;
          if (!dragging) {
            spinVelocity += (-105 * spin - 12 * spinVelocity) * dt;
            spin += spinVelocity * dt;
            if (spin < -rotationLimit || spin > rotationLimit) {
              spin = THREE.MathUtils.clamp(spin, -rotationLimit, rotationLimit);
              spinVelocity = 0;
            }
          }

          const idle = reduceMotion ? 0 : Math.sin(time * 0.55) * 0.035;
          const boundedRotation = THREE.MathUtils.clamp(
            hoverX * 0.18 + spin + idle,
            -rotationLimit,
            rotationLimit,
          );
          const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(hoverY * 0.08, boundedRotation, hoverX * 0.035));
          root.quaternion.copy(baseQuaternion).multiply(tilt);
          const horizontalShift = mobileQuery.matches ? 2.4 : 4.5;
          const verticalShift = hoverY < 0 ? -hoverY * 0.18 : -hoverY * 0.32;
          root.position
            .copy(basePosition)
            .addScaledVector(screenRight, hoverX * horizontalShift)
            .addScaledVector(
              screenUp,
              verticalShift + (reduceMotion ? 0 : Math.sin(time * 1.45) * 0.08),
            );
          root.scale.setScalar((mobileQuery.matches ? 0.46 : 0.943) * (1 + (reduceMotion ? 0 : Math.sin(time * 1.45) * 0.012)));
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };

        const pointerMove = (event: PointerEvent) => {
          pointerInside = true;
          const bounds = canvas.getBoundingClientRect();
          pointerX = THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -0.9, 0.9);
          pointerY = THREE.MathUtils.clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1);
          if (dragging) {
            spin = THREE.MathUtils.clamp(
              spin + (event.clientX - lastX) * 0.008,
              -rotationLimit,
              rotationLimit,
            );
            lastX = event.clientX;
          }
        };
        const pointerDown = (event: PointerEvent) => {
          if (event.button !== 0) return;
          pointerInside = true;
          dragging = true;
          spinVelocity = 0;
          lastX = event.clientX;
          canvas.setPointerCapture(event.pointerId);
        };
        const pointerUp = (event: PointerEvent) => {
          dragging = false;
          const bounds = canvas.getBoundingClientRect();
          pointerInside = event.clientX >= bounds.left && event.clientX <= bounds.right
            && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
          if (mobileQuery.matches || !pointerInside) pointerX = pointerY = 0;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        };
        const pointerLeave = () => {
          pointerInside = false;
          if (!dragging) pointerX = pointerY = 0;
        };

        const resizeObserver = new ResizeObserver(resize);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          if (visible) render();
          else cancelAnimationFrame(frame);
        }, { rootMargin: '20% 0px' });
        resizeObserver.observe(canvas);
        visibilityObserver.observe(canvas);
        canvas.addEventListener('pointermove', pointerMove);
        canvas.addEventListener('pointerdown', pointerDown);
        canvas.addEventListener('pointerup', pointerUp);
        canvas.addEventListener('pointercancel', pointerUp);
        canvas.addEventListener('pointerleave', pointerLeave);
        resize();
        render();

        disposeScene = () => {
          cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          canvas.removeEventListener('pointermove', pointerMove);
          canvas.removeEventListener('pointerdown', pointerDown);
          canvas.removeEventListener('pointerup', pointerUp);
          canvas.removeEventListener('pointercancel', pointerUp);
          canvas.removeEventListener('pointerleave', pointerLeave);
          model.dispose();
          materials.dispose();
          scene.environment = null;
          environmentTarget.dispose();
          environmentGenerator.dispose();
          environmentRoom.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          disposeScene = null;
        };
      } catch (error) {
        console.warn('[sense] Analytics clipboard hero failed to initialize.', error);
        release?.();
      }
    })();

    return () => {
      cancelled = true;
      release?.();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-label="数据分析夹板三维模型" />;
}
