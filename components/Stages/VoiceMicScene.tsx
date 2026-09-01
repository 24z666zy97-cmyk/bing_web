'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { acquireWebGL, hasWebGL } from '@/lib/webgl-owner';

function roundedPlate(width: number, height: number, depth: number, radius: number, material: THREE.Material) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: radius * .28, bevelThickness: depth * .24, bevelSegments: 3, curveSegments: 10 });
  geometry.center();
  return new THREE.Mesh(geometry, material);
}

function createMicrophone() {
  const root = new THREE.Group();
  const black = new THREE.MeshPhysicalMaterial({ color: 0x090909, roughness: .48, metalness: .02, clearcoat: .18, clearcoatRoughness: .42 });
  const foam = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .98 });
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xc5c5c1, roughness: .3, metalness: .68, clearcoat: .16 });
  const accent = new THREE.MeshPhysicalMaterial({ color: 0x202124, roughness: .58, metalness: .01, clearcoat: .12 });
  const geometries: THREE.BufferGeometry[] = [];
  const add = (mesh: THREE.Mesh, position: THREE.Vector3) => { mesh.position.copy(position); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); geometries.push(mesh.geometry); return mesh; };
  const radius = 2.05, centerY = 2.25;
  add(new THREE.Mesh(new THREE.SphereGeometry(radius * .91, 40, 28), foam), new THREE.Vector3(0, centerY, 0));
  const latitude = new THREE.Group();
  for (let i = -6; i <= 6; i += 1) {
    const angle = i * Math.PI / 27;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * Math.cos(angle), .045, 6, 56), metal);
    ring.rotation.x = Math.PI / 2; ring.position.y = radius * Math.sin(angle); latitude.add(ring); geometries.push(ring.geometry);
  }
  latitude.position.y = centerY; root.add(latitude);
  const meridians = new THREE.Group();
  const points = Array.from({ length: 49 }, (_, i) => { const angle = i / 48 * Math.PI * 2; return new THREE.Vector3(radius * Math.sin(angle), radius * Math.cos(angle), 0); });
  for (let i = 0; i < 18; i += 1) {
    const rib = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true, 'centripetal'), 80, .043, 6, true), metal);
    rib.rotation.y = i / 18 * Math.PI; meridians.add(rib); geometries.push(rib.geometry);
  }
  meridians.position.y = centerY; root.add(meridians);
  const equator = add(new THREE.Mesh(new THREE.TorusGeometry(radius * .99, .17, 12, 64), metal), new THREE.Vector3(0, centerY + .05, 0)); equator.rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.48, .38, 48), metal), new THREE.Vector3(0, centerY - 1.67, 0));
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.22, 1.12, 48), black), new THREE.Vector3(0, -.01, 0));
  add(new THREE.Mesh(new THREE.CylinderGeometry(.98, .76, 8, 48), black), new THREE.Vector3(0, -4.62, 0));
  const cap = add(new THREE.Mesh(new THREE.SphereGeometry(.76, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), black), new THREE.Vector3(0, -8.63, 0)); cap.scale.y = .25;
  add(roundedPlate(.76, 1.82, .15, .28, metal), new THREE.Vector3(0, -1.9, .94));
  add(roundedPlate(.46, .87, .11, .15, black), new THREE.Vector3(0, -1.95, 1.06));
  add(roundedPlate(.41, .51, .12, .14, accent), new THREE.Vector3(0, -1.77, 1.15));
  root.rotation.set(0, 0, -.22);
  root.position.set(.4, 1.2, 0);
  return { root, dispose: () => { geometries.forEach((geometry) => geometry.dispose()); black.dispose(); foam.dispose(); metal.dispose(); accent.dispose(); } };
}

export default function VoiceMicScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) return;
    let cancelled = false;
    let release: (() => void) | null = null;
    let cleanup: (() => void) | null = null;
    void (async () => {
      try {
        release = await acquireWebGL('stages-hero-microphone', () => cleanup?.());
        if (cancelled) return release();
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.08;
        const scene = new THREE.Scene();
        const room = new RoomEnvironment(); const pmrem = new THREE.PMREMGenerator(renderer); const env = pmrem.fromScene(room, .04); scene.environment = env.texture; scene.environmentIntensity = .95;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x181818, .68));
        const key = new THREE.DirectionalLight(0xfffdf8, 4.1); key.position.set(-7, 10, 9); scene.add(key);
        const rim = new THREE.DirectionalLight(0xfff8eb, .45); rim.position.set(8, 4, -7); scene.add(rim);
        const model = createMicrophone(); scene.add(model.root);
        const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
        camera.position.set(10.97820321628991, -0.5847770024375767, 21.317552414947087);
        camera.quaternion.set(-0.00010788637830328242, 0.2363986316566398, 0.000026248166282507834, 0.9716561504063214);
        let frame = 0, pointerX = 0, pointerY = 0, hoverX = 0, hoverY = 0;
        let spin = 0, spinVelocity = 0, lastPointerX = 0, isDragging = false, visible = true;
        let last = performance.now(), responsiveScale = .814;
        const startedAt = performance.now();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobileQuery = window.matchMedia('(max-width: 767px)');
        const baseQuaternion = model.root.quaternion.clone();
        const tiltQuaternion = new THREE.Quaternion();
        const spinQuaternion = new THREE.Quaternion();
        const tiltEuler = new THREE.Euler();
        const longAxis = new THREE.Vector3(0, 1, 0);
        const HOVER_SHIFT_X_LEFT = 4;
        const HOVER_SHIFT_X_RIGHT = 2;
        const HOVER_SHIFT_Y_UP = .06;
        const HOVER_SHIFT_Y_DOWN = .16;
        const HOVER_TILT_X = .045;
        const HOVER_TILT_Y = .12;
        const HOVER_ROLL = .035;
        const DRAG_SENSITIVITY = .022;
        const SPRING_STIFFNESS = 110;
        const SPRING_DAMPING = 13;
        const resize = () => {
          const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight);
          renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
          const viewportScale = THREE.MathUtils.clamp(width / 1050, .65, 1);
          responsiveScale = .814 * viewportScale * (mobileQuery.matches ? .62 : 1);
        };
        const render = () => {
          if (!visible) return;
          const now = performance.now(), dt = Math.min((now - last) / 1000, .1); last = now;
          const time = (now - startedAt) / 1000;
          const response = 1 - Math.exp(-4 * dt);
          hoverX += (pointerX - hoverX) * response;
          hoverY += (pointerY - hoverY) * response;

          if (!isDragging) {
            spinVelocity += (-SPRING_STIFFNESS * spin - SPRING_DAMPING * spinVelocity) * dt;
            spin += spinVelocity * dt;
            if (Math.abs(spin) < .001 && Math.abs(spinVelocity) < .001) { spin = 0; spinVelocity = 0; }
          }

          const idleYaw = reduceMotion ? 0 : Math.sin(time * .32) * .015;
          const idleBob = reduceMotion ? 0 : -Math.sin(time * 1.745) * .05;
          const breath = reduceMotion ? 1 : 1 - Math.sin(time * 1.745) * .012;
          tiltQuaternion.setFromEuler(tiltEuler.set(
            hoverY * HOVER_TILT_X,
            hoverX * HOVER_TILT_Y + idleYaw,
            hoverX * HOVER_ROLL,
          ));
          spinQuaternion.setFromAxisAngle(longAxis, spin);
          model.root.quaternion.copy(baseQuaternion).multiply(tiltQuaternion).multiply(spinQuaternion);
          const mobileShiftScale = mobileQuery.matches ? .5 : 1;
          const horizontalShift = (hoverX < 0 ? HOVER_SHIFT_X_LEFT : HOVER_SHIFT_X_RIGHT) * mobileShiftScale;
          model.root.position.x = .4 + hoverX * horizontalShift;
          const verticalShift = hoverY < 0 ? HOVER_SHIFT_Y_UP : HOVER_SHIFT_Y_DOWN;
          model.root.position.y = 1.2 - hoverY * verticalShift + idleBob;
          model.root.scale.setScalar(responsiveScale * breath);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        const onPointerMove = (event: PointerEvent) => {
          const rect = canvas.getBoundingClientRect();
          const horizontalLimit = mobileQuery.matches ? .35 : 1;
          pointerX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - .5) * 2, -horizontalLimit, horizontalLimit);
          pointerY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - .5) * 2, -1, 1);
          if (isDragging) {
            spin += (event.clientX - lastPointerX) * DRAG_SENSITIVITY;
            lastPointerX = event.clientX;
          }
        };
        const onPointerDown = (event: PointerEvent) => {
          if (event.button !== 0) return;
          isDragging = true; spinVelocity = 0; lastPointerX = event.clientX;
          canvas.setPointerCapture(event.pointerId);
        };
        const onPointerUp = (event: PointerEvent) => {
          if (!isDragging) return;
          isDragging = false;
          if (reduceMotion) { spin = 0; spinVelocity = 0; }
          if (mobileQuery.matches) { pointerX = 0; pointerY = 0; }
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        };
        const onPointerLeave = () => { if (!isDragging) { pointerX = 0; pointerY = 0; } };
        const observer = new ResizeObserver(resize);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          const nextVisible = Boolean(entry?.isIntersecting);
          if (nextVisible === visible) return;
          visible = nextVisible;
          if (visible) { last = performance.now(); render(); } else cancelAnimationFrame(frame);
        }, { rootMargin: '20% 0px' });
        observer.observe(canvas); visibilityObserver.observe(canvas);
        canvas.addEventListener('pointermove', onPointerMove); canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp); canvas.addEventListener('pointercancel', onPointerUp); canvas.addEventListener('pointerleave', onPointerLeave);
        resize(); render();
        cleanup = () => { cancelAnimationFrame(frame); observer.disconnect(); visibilityObserver.disconnect(); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('pointercancel', onPointerUp); canvas.removeEventListener('pointerleave', onPointerLeave); model.dispose(); env.dispose(); pmrem.dispose(); room.dispose(); renderer.dispose(); renderer.forceContextLoss(); cleanup = null; };
      } catch (error) { console.warn('[stages] Microphone scene failed to initialize.', error); release?.(); }
    })();
    return () => { cancelled = true; release?.(); };
  }, []);
  return <canvas ref={canvasRef} className={className} aria-label="麦克风三维模型" />;
}
