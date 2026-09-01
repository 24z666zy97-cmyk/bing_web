'use client';

import { useEffect, useRef, useState } from 'react';
import { acquireWebGL, hasWebGL } from '@/lib/webgl-owner';
import styles from './Face.module.css';

interface StickerTearFlapProps {
  enabled: boolean;
  progress: number;
  onPrepared: () => void;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uExitX;
  uniform float uExitY;
  varying vec2 vUv;
  varying float vShade;

  float easeInOut(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vUv = uv;
    vec3 p = position;
    float front = -1.0 + clamp(uProgress * 1.08, 0.0, 1.08) * 2.0;
    float distanceBehindFront = front - p.x;
    float curlMask = step(0.0, distanceBehindFront);
    float radius = 0.235;
    float arcLength = radius * 3.14159265;
    float angle = min(max(distanceBehindFront, 0.0) / radius, 3.14159265);
    float straightTail = max(distanceBehindFront - arcLength, 0.0);

    // The first part follows a half cylinder. Once it has passed 180 degrees,
    // the remaining sheet continues as a flat back-facing tail instead of
    // collapsing all vertices onto the same line.
    float curledX = front - sin(angle) * radius + straightTail;
    float curledZ = radius * (1.0 - cos(angle));
    p.x = mix(p.x, curledX, curlMask);
    p.z += curledZ * curlMask;
    p.y -= curlMask * sin(uv.x * 3.14159265) * 0.018 * uProgress;

    float exitProgress = easeInOut(clamp((uProgress - 0.84) / 0.16, 0.0, 1.0));
    float exitAngle = exitProgress * -0.24;
    mat2 exitRotation = mat2(
      cos(exitAngle), -sin(exitAngle),
      sin(exitAngle),  cos(exitAngle)
    );
    p.xy = exitRotation * p.xy;
    p.x += exitProgress * uExitX;
    p.y -= exitProgress * uExitY;
    p.z += exitProgress * 0.18;

    vShade = clamp(curledZ * 2.4 + sin(angle) * 0.28, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uArtwork;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    vec4 artwork = texture2D(uArtwork, vUv);
    if (artwork.a < 0.08) discard;

    vec3 paperBack = vec3(0.996, 0.990, 0.972);
    vec3 front = artwork.rgb * (1.0 - vShade * 0.18);
    vec3 back = paperBack * (1.0 - vShade * 0.055);
    vec3 color = gl_FrontFacing ? front : back;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function StickerTearFlap({
  enabled,
  progress,
  onPrepared,
}: StickerTearFlapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const uniformRef = useRef<{ value: number } | null>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const frozenRef = useRef(false);
  const [mode, setMode] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  progressRef.current = progress;

  useEffect(() => {
    if (!enabled || !hostRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasWebGL() || reduced) {
      setMode('fallback');
      onPrepared();
      return;
    }

    let cancelled = false;
    let release: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let disposeScene: (() => void) | null = null;

    void (async () => {
      try {
        release = await acquireWebGL('home-local-tear', () => disposeScene?.());
        if (cancelled || !hostRef.current) {
          release();
          return;
        }

        const THREE = await import('three');
        const host = hostRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        host.appendChild(renderer.domElement);

        const texture = await new THREE.TextureLoader().loadAsync(
          '/profile/avatar/hero-face-tear-flap-1.webp?v=20260804-7',
        );
        if (cancelled) {
          texture.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          release();
          return;
        }
        texture.colorSpace = THREE.NoColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const progressUniform = { value: progressRef.current };
        const exitXUniform = { value: 1.3 };
        const exitYUniform = { value: 0.74 };
        uniformRef.current = progressUniform;
        const geometry = new THREE.PlaneGeometry(2, 2, 112, 128);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uArtwork: { value: texture },
            uProgress: progressUniform,
            uExitX: exitXUniform,
            uExitY: exitYUniform,
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: false,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: true,
          toneMapped: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const resize = () => {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          const stage = host.parentElement;
          const stageWidth = Math.max(1, stage?.clientWidth ?? width);
          const stageHeight = Math.max(1, stage?.clientHeight ?? height);
          const stageAspect = stageWidth / stageHeight;
          const worldPerPixel = 2 / stageHeight;
          const halfViewWidth = (width * worldPerPixel) / 2;
          const halfViewHeight = (height * worldPerPixel) / 2;
          camera.left = -halfViewWidth;
          camera.right = halfViewWidth;
          camera.top = halfViewHeight;
          camera.bottom = -halfViewHeight;
          camera.updateProjectionMatrix();
          mesh.scale.x = stageAspect;
          exitXUniform.value = halfViewWidth / stageAspect + 1.8;
          exitYUniform.value = Math.max(0.74, halfViewHeight * 0.45);
          renderer.setSize(width, height, false);
          renderer.render(scene, camera);
        };
        const render = () => renderer.render(scene, camera);
        renderRef.current = render;
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        disposeScene = () => {
          resizeObserver?.disconnect();
          geometry.dispose();
          material.dispose();
          texture.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
          uniformRef.current = null;
          renderRef.current = null;
        };

        setMode('webgl');
        onPrepared();
      } catch (error) {
        console.warn('[hero] Three.js tear flap unavailable; using CSS fallback.', error);
        setMode('fallback');
        release?.();
        onPrepared();
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      release?.();
    };
  }, [enabled, onPrepared]);

  useEffect(() => {
    if (progress < 0.96) frozenRef.current = false;
    if (frozenRef.current) return;
    if (uniformRef.current) uniformRef.current.value = progress;
    renderRef.current?.();
    // Keep the last visible frame while the flap finishes leaving the viewport.
    // Releasing the WebGL canvas here would create a blank compositing frame.
    if (progress >= 0.96) frozenRef.current = true;
  }, [progress]);

  return (
    <div
      className={styles.flap}
      data-render-mode={mode}
      style={{ '--open': progress } as React.CSSProperties}
      aria-hidden="true"
    >
      <picture className={styles.flapFallback}>
        <img
          src="/profile/avatar/hero-face-tear-flap-1.webp?v=20260804-7"
          alt=""
          width={1068}
          height={1213}
          decoding="async"
        />
      </picture>
      <div ref={hostRef} className={styles.webglFlapHost} />
    </div>
  );
}









