'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { acquireWebGL, hasWebGL } from '@/lib/webgl-owner';
import styles from './SystemPage.module.css';

type Atom = {
  type: 'carbon' | 'oxygen' | 'hydrogen';
  position: [number, number, number];
};

const ATOMS: Atom[] = [
  { type: 'carbon', position: [0, 0, 0] },
  { type: 'oxygen', position: [3.6235, 0, 0] },
  { type: 'hydrogen', position: [-1.9219, 0, -2.2905] },
  { type: 'hydrogen', position: [-1.9219, 1.9836, 1.1452] },
  { type: 'hydrogen', position: [-1.9219, -1.9836, 1.1452] },
  { type: 'hydrogen', position: [5.3945, -1.8278, -1.0553] },
];

const BONDS: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5]];
const RADII = { carbon: 1, oxygen: 0.95, hydrogen: 0.8 } as const;
const HERO_VIEW = {
  cameraPosition: [6.962319104113483, 10.041359458190267, 12.454205868983722],
  cameraTarget: [-0.5616808958865173, 0.061609458190267447, 0.7502058689837221],
  modelRotation: [-0.42, -2.24, 0.98],
  // The exported framing was authored in a larger viewer. Pulled the camera
  // back ~4.5% and widened the FOV (31→35°) to fit the molecule's spin sweep;
  // at the very top of the swing the top hydrogen may graze the frame edge.
  modelScale: 0.8,
} as const;

function physical(color: number, roughness: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    clearcoat: 0.62,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.9,
  });
}

function createMolecule() {
  const root = new THREE.Group();
  const materials = {
    carbon: physical(0x2f8cff, 0.24),
    oxygen: physical(0xfc3470, 0.24),
    hydrogen: physical(0xffc52a, 0.25),
    bond: physical(0xf2f0ea, 0.36),
  };

  BONDS.forEach(([startIndex, endIndex]) => {
    const startAtom = ATOMS[startIndex];
    const endAtom = ATOMS[endIndex];
    const start = new THREE.Vector3(...startAtom.position);
    const end = new THREE.Vector3(...endAtom.position);
    const direction = end.clone().sub(start);
    const unit = direction.clone().normalize();
    const visibleStart = start.clone().addScaledVector(unit, RADII[startAtom.type] - 0.18);
    const visibleEnd = end.clone().addScaledVector(unit, -(RADII[endAtom.type] - 0.18));
    const length = visibleStart.distanceTo(visibleEnd);
    const bond = new THREE.Mesh(
      new THREE.CylinderGeometry(0.175, 0.175, length, 24),
      materials.bond,
    );
    bond.position.copy(visibleStart).add(visibleEnd).multiplyScalar(0.5);
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), unit);
    root.add(bond);
  });

  ATOMS.forEach((atom) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADII[atom.type], 48, 32),
      materials[atom.type],
    );
    sphere.position.set(...atom.position);
    root.add(sphere);
  });

  root.rotation.set(...HERO_VIEW.modelRotation);
  root.scale.setScalar(HERO_VIEW.modelScale);
  return { root, materials };
}

export default function MolecularFormulaScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* WebGL 上下文走单例（webgl-owner.ts）。首页翻片也占一个上下文，
     * 两个页面都开 WebGL 时若不排队，路由切换的瞬间新旧上下文并存，
     * 超限会被浏览器强制丢弃——单独测某一页永远正常，只在跳转时
     * 概率性出现。所以这里和 StickerTearFlap 一样先申请许可再创建。 */
    if (!hasWebGL()) {
      console.warn('[system] WebGL unavailable; molecular hero left blank.');
      return;
    }

    let cancelled = false;
    let release: (() => void) | null = null;
    let disposeScene: (() => void) | null = null;
    let frame = 0;

    void (async () => {
      try {
        release = await acquireWebGL('system-hero-molecule', () => disposeScene?.());
        if (cancelled || !canvasRef.current) {
          release();
          return;
        }

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 1.04;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(...HERO_VIEW.cameraPosition);
        camera.lookAt(...HERO_VIEW.cameraTarget);

        const hemisphere = new THREE.HemisphereLight(0xffffff, 0x181310, 2.25);
        const key = new THREE.DirectionalLight(0xffffff, 5.2);
        key.position.set(5, 8, 8);
        const rim = new THREE.DirectionalLight(0xff8eb0, 3.4);
        rim.position.set(-7, 2, -5);
        scene.add(hemisphere, key, rim);

        const { root, materials } = createMolecule();
        root.position.set(-0.6, -0.34, 0);
        scene.add(root);

        let visible = true;
        let isDragging = false;
        let lastX = 0;
        let pointerX = 0;
        let pointerY = 0;
        let hoverX = 0;
        let hoverY = 0;
        let spin = 0;
        let spinVel = 0;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobileScaleQuery = window.matchMedia('(max-width: 767px)');
        const startedAt = performance.now();
        let lastRenderAt = performance.now();

        /* 交互手感参数：
         * hover：对象跟随鼠标轻微平移 + 微旋转；左键拖拽：绕 C=O 键轴快速旋转，
         * 松手后像弹簧一样回弹归位（带回弹过冲，再晃一两下停住）。 */
        const HOVER_LERP = 0.06; // 平滑收敛速度
        const HOVER_SHIFT = 1.6; // hover 时沿 x 轴的最大平移（世界单位）
        const HOVER_SHIFT_Y_DOWN = 0.16; // hover 时沿 y 轴向下平移（正常）
        const HOVER_SHIFT_Y_UP = 0.04; // hover 时沿 y 轴向上平移（压得很小，避免顶部黄球被裁）
        const HOVER_TILT_X = 0.08; // hover 时绕 x 轴微旋转幅度（垂直鼠标）
        const HOVER_TILT_Y = 0.2; // hover 时绕 y 轴微旋转幅度（水平鼠标）
        const HOVER_ROLL = 0.06; // hover 时绕 z 轴轻微侧倾
        const DRAG_SENSITIVITY = 0.009; // 拖拽灵敏度（rad / px）
        const MOBILE_POINTER_X_LIMIT = 0.32; // 手机端限制横向跟随，避免拖出画布后模型中心继续偏移
        const SPRING_STIFFNESS = 120; // 弹簧刚度：越大回弹越快
        const SPRING_DAMPING = 11; // 阻尼：越大越“肉”停得快，越小越“弹”晃得久

        /* 用四元数管理姿态，让拖拽能绕「C=O 键轴」自旋，而不是 Euler 三轴乱转。
         * 红球(氧)在 [3.6235, 0, 0]，篮球(碳)在原点，键轴即分子本地 x 轴。 */
        const X_AXIS = new THREE.Vector3(1, 0, 0);
        const baseQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(HERO_VIEW.modelRotation[0], HERO_VIEW.modelRotation[1], HERO_VIEW.modelRotation[2]),
        );
        const spinQuat = new THREE.Quaternion();
        const tiltQuat = new THREE.Quaternion();
        const tiltEuler = new THREE.Euler();

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
          const dt = Math.min((now - lastRenderAt) / 1000, 0.1); // 秒，夹紧避免切后台后跳帧
          lastRenderAt = now;
          const time = (now - startedAt) / 1000;
          const idleFloat = reduceMotion ? 0 : Math.sin(time * 0.32) * 0.025;
          const idleBob = reduceMotion ? 0 : -Math.sin(time * 1.745) * 0.08; // 1.745 ≈ 2π/3.6：一趟往返 1.8s 与 scroll-bob 同频；取负让分子先下后上
          const breath = reduceMotion ? 1 : 1 - Math.sin(time * 1.745) * 0.02; // 呼吸缩放同步 1.8s；取负先收缩后膨胀，与下浮同相

          hoverX += (pointerX - hoverX) * HOVER_LERP;
          hoverY += (pointerY - hoverY) * HOVER_LERP;

          if (!isDragging) {
            /* 弹簧归位：回拉力与位移成正比（会过冲），阻尼让晃动逐渐收敛到 0。 */
            spinVel += (-SPRING_STIFFNESS * spin - SPRING_DAMPING * spinVel) * dt;
            spin += spinVel * dt;
            if (Math.abs(spin) < 0.001 && Math.abs(spinVel) < 0.001) {
              spin = 0;
              spinVel = 0;
            }
          }
          /* 拖拽时 spin 在 onPointerMove 里直接累加。 */

          /* 姿态 = 基础朝向 * 屏幕相对微倾斜 * 绕键轴自旋。
           * 相乘顺序（右起先作用）：先绕本地 x 轴自旋，再微倾斜，最后套基础朝向。 */
          tiltQuat.setFromEuler(tiltEuler.set(
            hoverY * HOVER_TILT_X,
            hoverX * HOVER_TILT_Y + idleFloat,
            hoverX * HOVER_ROLL,
          ));
          spinQuat.setFromAxisAngle(X_AXIS, spin);
          root.quaternion.copy(baseQuat).multiply(tiltQuat).multiply(spinQuat);

          root.position.x = -0.6 + hoverX * HOVER_SHIFT;
          const verticalK = hoverY < 0 ? HOVER_SHIFT_Y_UP : HOVER_SHIFT_Y_DOWN; // 向上受限、向下正常
          root.position.y = -0.34 - hoverY * verticalK + idleBob; // 取负：屏幕 y 向下为正，反转后鼠标往上分子往上
          const responsiveScale = mobileScaleQuery.matches ? 0.62 : 1;
          root.scale.setScalar(HERO_VIEW.modelScale * responsiveScale * breath); // 手机端缩模型而非缩画布，保留完整取景

          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };

        const onPointerMove = (event: PointerEvent) => {
          const bounds = canvas.getBoundingClientRect();
          const rawPointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const pointerXLimit = mobileScaleQuery.matches ? MOBILE_POINTER_X_LIMIT : 1;
          pointerX = THREE.MathUtils.clamp(rawPointerX, -pointerXLimit, pointerXLimit);
          pointerY = THREE.MathUtils.clamp(
            ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
            -1,
            1,
          );

          if (isDragging) {
            const dx = event.clientX - lastX;
            spin += dx * DRAG_SENSITIVITY; // 水平拖拽 → 绕 C=O 键轴自旋
            lastX = event.clientX;
          }
        };
        const onPointerDown = (event: PointerEvent) => {
          if (event.button !== 0) return; // 只响应左键
          isDragging = true;
          spinVel = 0; // 拖拽期间由手指控制，清掉残留的回弹速度
          lastX = event.clientX;
          canvas.setPointerCapture(event.pointerId);
        };
        const onPointerUp = (event: PointerEvent) => {
          if (!isDragging) return;
          isDragging = false;
          if (mobileScaleQuery.matches) {
            pointerX = 0;
            pointerY = 0;
          }
          /* 松手后 spin 保持累计值，由 render 里的弹簧沿拖拽反方向回弹归位。 */
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        };
        const onPointerLeave = () => {
          if (isDragging) return; // 拖拽中由 pointer capture 接管，不重置 hover
          pointerX = 0;
          pointerY = 0;
        };

        const resizeObserver = new ResizeObserver(resize);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          const nextVisible = Boolean(entry?.isIntersecting);
          if (nextVisible === visible) return;
          visible = nextVisible;
          if (visible) {
            render();
          } else {
            cancelAnimationFrame(frame);
          }
        }, { rootMargin: '20% 0px' });

        /* 释放回调交给 webgl-owner 在真正让出上下文时调用。幂等，
         * 卸载清理里可能已经先 dispose 过一次。 */
        disposeScene = () => {
          const previous = disposeScene;
          disposeScene = null;
          if (previous === null) return;
          cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointercancel', onPointerUp);
          canvas.removeEventListener('pointerleave', onPointerLeave);
          root.traverse((object) => {
            if (object instanceof THREE.Mesh) object.geometry.dispose();
          });
          Object.values(materials).forEach((material) => material.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
        };

        if (cancelled) {
          release();
          return;
        }

        resizeObserver.observe(canvas);
        visibilityObserver.observe(canvas);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerLeave);
        resize();
        render();
      } catch (error) {
        console.warn('[system] Molecular hero failed to initialize; left blank.', error);
        release?.();
      }
    })();

    return () => {
      cancelled = true;
      /* release() 幂等，且只在当前仍持有许可时才会真正销毁；若此时
       * 场景还没建完（disposeScene 仍为 null），销毁逻辑由上面的
       * cancelled 分支兜底。 */
      release?.();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.heroCanvas} aria-label="分子结构三维模型" />;
}
