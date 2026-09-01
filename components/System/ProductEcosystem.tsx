'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import styles from './SystemPage.module.css';

const FLOW_STEPS = [
  { title: '数据清洗', description: 'CAD、BIM、倾斜摄影与点云等多源异构空间数据，经解析和结构化形成 AI-ready 数据底座。' },
  { title: '模型训练', description: '基于统一数据模型、构件属性、空间语义与拓扑关系，训练空间智能垂类模型。' },
  { title: '模型赋能', description: '垂类模型将空间理解与语义推理能力反哺数据底座，增强空间数据的组织、查询和分析能力。' },
  { title: '数据搭载', description: '通过三维数据中台管理和服务化结构化数据，搭载空间理解、监测、分析与决策能力。' },
  { title: '现有项目', description: '能力进入健康监测、智能巡检与智能审查等真实场景，验证产品体系在行业流程中的落地价值。' },
  { title: '数据回流', description: '行业项目产生的状态、问题与决策数据回流垂类模型，形成持续学习闭环。' },
] as const;

const MEMORY_STACKS = [
  { className: styles.memoryProduct, label: '空间理解能力卡包', cards: ['关系推理', '语义理解', '对象识别', '空间理解'] },
  { className: styles.memoryResearch, label: '空间监测能力卡包', cards: ['动态追踪', '异常检测', '状态感知', '空间监测'] },
  { className: styles.memoryGrowth, label: '空间分析能力卡包', cards: ['风险评估', '规则校验', '数据分析', '空间分析'] },
  { className: styles.memoryEngineering, label: '空间决策能力卡包', cards: ['辅助决策', '智能调度', '任务规划', '空间决策'] },
] as const;

const LABELS = [
  { className: styles.flowLabelClean, text: '数据清洗' },
  { className: styles.flowLabelTrain, text: '模型训练' },
  { className: styles.flowLabelFeedback, text: '模型赋能' },
  { className: styles.flowLabelLoad, text: '数据搭载' },
  { className: styles.flowLabelProject, text: '现有项目' },
  { className: styles.flowLabelReturn, text: '数据回流' },
] as const;

const ROUTES = [
  { step: 0, path: 'M220 132H460', start: 0, end: 1 },
  { step: 1, path: 'M740 140H980', start: 0, end: 1 },
  { step: 2, path: 'M980 108H740', start: 0, end: 1 },
  { step: 3, path: 'M600 184.5V259.5', start: 0, end: .24 },
  { step: 3, path: 'M600 259.5H165V303.5', start: .24, end: 1 },
  { step: 3, path: 'M600 259.5H455V303.5', start: .24, end: 1 },
  { step: 3, path: 'M600 259.5H745V303.5', start: .24, end: 1 },
  { step: 3, path: 'M600 259.5H1035V303.5', start: .24, end: 1 },
  { step: 4, path: 'M165 493.5V507.5H600', start: 0, end: .78 },
  { step: 4, path: 'M455 493.5V507.5H600', start: 0, end: .78 },
  { step: 4, path: 'M745 493.5V507.5H600', start: 0, end: .78 },
  { step: 4, path: 'M1035 493.5V507.5H600', start: 0, end: .78 },
  { step: 4, path: 'M600 507.5V582.5', start: .78, end: 1 },
  { step: 5, path: 'M990 633H1120V184.5H1090', start: 0, end: 1 },
] as const;

const STEP_ENDPOINTS = [
  [[220, 132], [460, 132]],
  [[740, 140], [980, 140]],
  [[980, 108], [740, 108]],
  [[600, 184.5], [165, 303.5], [455, 303.5], [745, 303.5], [1035, 303.5]],
  [[165, 493.5], [455, 493.5], [745, 493.5], [1035, 493.5], [600, 582.5]],
  [[990, 633], [1090, 184.5]],
] as const;

/* 舞台静态几何（桌面端，原硬编码迁移为常量，值保持不变） */
const SKELETON = [
  { d: 'M220 132H460', cls: '' },
  { d: 'M740 140H980', cls: '' },
  { d: 'M980 108H740', cls: 'thin' },
  { d: 'M600 184.5V259.5', cls: '' },
  { d: 'M165 259.5H1035', cls: '' },
  { d: 'M165 259.5V303.5M455 259.5V303.5M745 259.5V303.5M1035 259.5V303.5', cls: 'bottom' },
  { d: 'M165 493.5V507.5M455 493.5V507.5M745 493.5V507.5M1035 493.5V507.5M165 507.5H1035M600 507.5V582.5', cls: 'bottom' },
  { d: 'M990 633H1120V184.5H1090', cls: 'bottom thin' },
] as const;
const JOINTS = [[220, 132], [980, 140], [740, 108], [600, 184.5], [600, 259.5], [165, 303.5], [455, 303.5], [745, 303.5], [1035, 303.5], [165, 493.5], [455, 493.5], [745, 493.5], [1035, 493.5], [600, 582.5]] as const;
const HALO_XS = [165, 455, 745, 1035] as const;
const HALO_Y = 469.5;
const ENDPOINTS = [[220, 132], [460, 132], [740, 140], [980, 140], [980, 108], [740, 108], [600, 184.5], [165, 303.5], [455, 303.5], [745, 303.5], [1035, 303.5], [165, 493.5], [455, 493.5], [745, 493.5], [1035, 493.5], [600, 582.5], [1090, 184.5], [990, 633]] as const;

/* —— 移动端（≤767px）简化几何：仍在 1200×736 舞台内，文件夹 2×2、文字组垂直，
 * 「1→4 / 4→1」折成 1→1。桌面端数据完全独立、不受影响。 —— */
const MOBILE_VIEWBOX = '0 0 1200 970';
const MOBILE_FOLDER_TOP = 285;     // 2×2 组团上边中点 y（单线进入点）
const MOBILE_FOLDER_BOTTOM = 638;  // 2×2 组团下边中点 y（单线出点）
const MOBILE_OUTCOME_TOP = 738.5;  // 与上方主干同为 100.5 单位长：738.5 - 638 = 285 - 184.5
const MOBILE_OUTCOME_CENTER = 843.5; // 三层结果板右缘中点 y（回流线起点）
const MOBILE_OUTCOME_RIGHT = 740;  // 与数据底座同宽 280px，居中于 x=600，右缘为 740

const MOBILE_SKELETON = [
  { d: 'M220 132H460', cls: '' },
  { d: 'M740 140H980', cls: '' },
  { d: 'M980 108H740', cls: 'thin' },
  { d: 'M600 184.5V259.5', cls: '' },
  { d: `M600 259.5V${MOBILE_FOLDER_TOP}`, cls: 'bottom' },
  { d: `M600 ${MOBILE_FOLDER_BOTTOM}V${MOBILE_OUTCOME_TOP}`, cls: 'bottom' },
  { d: `M${MOBILE_OUTCOME_RIGHT} ${MOBILE_OUTCOME_CENTER}H1120V184.5H1090`, cls: 'bottom thin' },
] as const;
const MOBILE_JOINTS = [[220, 132], [980, 140], [740, 108], [600, 184.5], [600, MOBILE_FOLDER_TOP], [600, MOBILE_FOLDER_BOTTOM], [600, MOBILE_OUTCOME_TOP]] as const;
const MOBILE_HALO_XS = [] as const;
const MOBILE_HALO_Y = 461.5;
const MOBILE_ENDPOINTS = [[220, 132], [460, 132], [740, 140], [980, 140], [980, 108], [740, 108], [600, 184.5], [600, MOBILE_FOLDER_TOP], [600, MOBILE_FOLDER_BOTTOM], [600, MOBILE_OUTCOME_TOP], [1090, 184.5], [MOBILE_OUTCOME_RIGHT, MOBILE_OUTCOME_CENTER]] as const;

const MOBILE_ROUTES = [
  { step: 0, path: 'M220 132H460', start: 0, end: 1 },
  { step: 1, path: 'M740 140H980', start: 0, end: 1 },
  { step: 2, path: 'M980 108H740', start: 0, end: 1 },
  { step: 3, path: 'M600 184.5V259.5', start: 0, end: .24 },
  { step: 3, path: `M600 259.5V${MOBILE_FOLDER_TOP}`, start: .24, end: 1 },
  { step: 4, path: `M600 ${MOBILE_FOLDER_BOTTOM}V${MOBILE_OUTCOME_TOP}`, start: 0, end: 1 },
  { step: 5, path: `M${MOBILE_OUTCOME_RIGHT} ${MOBILE_OUTCOME_CENTER}H1120V184.5H1090`, start: 0, end: 1 },
] as const;

const MOBILE_STEP_ENDPOINTS = [
  [[220, 132], [460, 132]],
  [[740, 140], [980, 140]],
  [[980, 108], [740, 108]],
  [[600, 184.5], [600, MOBILE_FOLDER_TOP]],
  [[600, MOBILE_FOLDER_BOTTOM], [600, MOBILE_OUTCOME_TOP]],
  [[MOBILE_OUTCOME_RIGHT, MOBILE_OUTCOME_CENTER], [1090, 184.5]],
] as const;

/* 每组动画的滚动时长（ms）。按信号实际行程长度换算：
 * 前 3 组约 150px/s，后 3 组约 300px/s。
 * 行程长度：0-2 单条 180px 短线；3 = trunk 75 + 最长分支 479 = 554px；
 * 4 = 最长分支 449 + merge 75 = 524px；5 = 回程 608.5px。
 * 时长 = 长度 / 速度 * 1000。 */
const STEP_DURATIONS = [1200, 1200, 1200, 1850, 1750, 2030];
const STEP_FADE = 1000;
/* 每个步骤里胶囊标签的高亮窗口 [labelOn, labelOff]。
 * labelOn = 小球到达该胶囊（标签位置）的 step progress；labelOff 取 1，配合下方 `<` 判断，
 * 表示小球走到 progress=1（本组运动完成、淡出开始）时熄灭，与线条/端点淡出同一时刻；
 * 颜色过渡交给 .flowLabel 的 transition，实现同步淡去。
 * 标签位置取自 flowLabel* 的 left/top 坐标，换算到所属 route 的 local 再映射回 step progress：
 *  0 数据清洗 / 1 模型训练 / 2 模型赋能 —— 各自 route 中点（progress 0.5）；
 *  3 数据搭载在 trunk（progress 0→0.24）中点 → 0.12；
 *  4 现有项目在 merge（progress 0.78→1）中点 → 0.89；
 *  5 数据回流在回程起始段 → ≈0.107。 */
const LABEL_WINDOWS: [number, number][] = [
  [0.5, 1],
  [0.5, 1],
  [0.5, 1],
  [0.12, 1],
  [0.89, 1],
  [0.107, 1],
];

function NodeIcon({ type }: { type: 'data' | 'base' | 'model' }) {
  if (type === 'data') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1m5-7a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1M7 15l3 3m-3 3 3-3H5a2 2 0 0 1-2-2v-2" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="3" rx="1" /></svg>;
  }
  if (type === 'base') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" /><path d="m20 14.29 1.5.84a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.84" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a3 3 0 1 0-6 .13 4 4 0 0 0-2.52 5.77 4 4 0 0 0 .55 6.58A4 4 0 1 0 12 18Z" /><path d="M9 13a4.5 4.5 0 0 0 3-4M12 13h4m-4 5h6a2 2 0 0 1 2 2v1M12 8h8m-4 0V5a2 2 0 0 1 2-2" /></svg>;
}

/* 4 个「能力卡包」文件夹：画布（桌面）与移动端重排版共用同一份渲染，避免手写两份。 */
function MemoryStacks() {
  return (
    <>
      {MEMORY_STACKS.map((stack) => (
        <article className={styles.memory + ' ' + stack.className} aria-label={stack.label} key={stack.label}>
          <div className={styles.slatScene}>
            <div className={styles.slat + ' ' + styles.slatBack} data-title={stack.cards[0]} />
            <div className={styles.slat + ' ' + styles.slatMid} data-title={stack.cards[1]} />
            <div className={styles.slat} data-title={stack.cards[2]} />
            <div className={styles.slat + ' ' + styles.slatFront} data-title={stack.cards[3]} />
          </div>
        </article>
      ))}
    </>
  );
}

/* 底部「行业应用」三格文字组，同样双端共用。 */
function OutcomeBoard() {
  return (
    <article className={styles.outcome}>
      <div className={styles.outcomeCell}><div><p>时空状态智能认知</p><h3>文博空间智能运维</h3></div></div>
      <span className={styles.outcomeRule} />
      <div className={styles.outcomeCell}><div><p>空间智能驱动具身协同</p><h3>能源设施智能巡检</h3></div></div>
      <span className={styles.outcomeRule} />
      <div className={styles.outcomeCell}><div><p>空间语义知识推理</p><h3>工程建设智能审查</h3></div></div>
    </article>
  );
}

export default function ProductEcosystem() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLabelActive, setIsLabelActive] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const cameraDragRef = useRef({ pointerId: -1, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const cameraReturnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const playingRef = useRef(true);
  const stepStartedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const labelActiveRef = useRef(false);

  const currentStep = FLOW_STEPS[activeStep];

  const playFrom = useCallback((index: number) => {
    const now = performance.now();
    stepRef.current = index;
    setActiveStep(index);
    labelActiveRef.current = false;
    setIsLabelActive(false);
    stepStartedAtRef.current = now;
    pausedAtRef.current = 0;
    if (cameraReturnTimerRef.current) clearTimeout(cameraReturnTimerRef.current);
    const stage = stageRef.current;
    if (stage) {
      stage.dataset.dragging = 'false';
      stage.style.setProperty('--camera-drag-x', '0px');
      stage.style.setProperty('--camera-drag-y', '0px');
    }
    if (!playingRef.current) {
      playingRef.current = true;
      setIsPlaying(true);
    }
  }, []);

  const handleCameraPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobile || isFullView || event.pointerType === 'mouse' && event.button !== 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    if (cameraReturnTimerRef.current) clearTimeout(cameraReturnTimerRef.current);
    cameraDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: Number.parseFloat(stage.style.getPropertyValue('--camera-drag-x')) || 0,
      offsetY: Number.parseFloat(stage.style.getPropertyValue('--camera-drag-y')) || 0,
    };
    stage.dataset.dragging = 'true';
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [isFullView, isMobile]);

  const handleCameraPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cameraDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const stage = stageRef.current;
    if (!stage) return;
    event.preventDefault();
    const x = Math.max(-180, Math.min(180, drag.offsetX + event.clientX - drag.startX));
    const y = Math.max(-180, Math.min(180, drag.offsetY + event.clientY - drag.startY));
    stage.style.setProperty('--camera-drag-x', `${x}px`);
    stage.style.setProperty('--camera-drag-y', `${y}px`);
  }, []);

  const handleCameraPointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (cameraDragRef.current.pointerId !== event.pointerId) return;
    cameraDragRef.current.pointerId = -1;
    const stage = stageRef.current;
    if (!stage) return;
    stage.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    cameraReturnTimerRef.current = setTimeout(() => {
      stage.style.setProperty('--camera-drag-x', '0px');
      stage.style.setProperty('--camera-drag-y', '0px');
    }, 2000);
  }, []);

  useEffect(() => () => {
    if (cameraReturnTimerRef.current) clearTimeout(cameraReturnTimerRef.current);
  }, []);

  const moveStep = useCallback((direction: -1 | 1) => {
    playFrom((activeStep + direction + FLOW_STEPS.length) % FLOW_STEPS.length);
    setIsFullView(false);
  }, [activeStep, playFrom]);

  const togglePlaying = useCallback(() => {
    const now = performance.now();
    if (playingRef.current) {
      playingRef.current = false;
      pausedAtRef.current = now;
      setIsPlaying(false);
      return;
    }

    if (pausedAtRef.current) {
      stepStartedAtRef.current += now - pausedAtRef.current;
    } else {
      stepStartedAtRef.current = now;
    }
    pausedAtRef.current = 0;
    playingRef.current = true;
    setIsPlaying(true);
  }, []);

  /* 移动端断点：仅用于切换舞台内部几何（桌面端数据独立）。客户端挂载后判定，避免 SSR 水合不一致。 */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const routeElements = Array.from(stage.querySelectorAll<SVGPathElement>('[data-flow-route]'));
    const packetElements = Array.from(stage.querySelectorAll<SVGCircleElement>('[data-flow-packet]'));
    const endpointElements = Array.from(stage.querySelectorAll<SVGGElement>('[data-flow-endpoints]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The packet and illuminated stroke must share the exact same length basis.
    // Using the real SVG path length also avoids a normalized dash pattern
    // wrapping around and briefly appearing at the far end of the route.
    const routeLengths = routeElements.map((route) => route.getTotalLength());

    const resetRoute = (route: SVGPathElement, packet: SVGCircleElement, length: number) => {
      route.style.opacity = '0';
      route.style.strokeDasharray = String(length);
      route.style.strokeDashoffset = String(length);
      packet.style.opacity = '0';
    };

    routeElements.forEach((route, index) => resetRoute(route, packetElements[index], routeLengths[index]));
    endpointElements.forEach((group) => { group.style.opacity = '0'; });
    stepStartedAtRef.current = performance.now();

    const renderFrame = (now: number) => {
      const currentStepIndex = stepRef.current;
      const elapsed = playingRef.current ? now - stepStartedAtRef.current : pausedAtRef.current - stepStartedAtRef.current;
      const stepDuration = STEP_DURATIONS[currentStepIndex];
      const progress = reducedMotion ? 1 : Math.min(Math.max(elapsed / stepDuration, 0), 1);
      /* 走完后的淡出：在 [stepDuration, stepDuration + STEP_FADE] 内，整组内容（线条/端点）
       * 的 opacity 从 1 线性降到 0，自然淡去而非瞬时消失。 */
      const fadeProgress = Math.min(Math.max((elapsed - stepDuration) / STEP_FADE, 0), 1);
      const fadeOpacity = 1 - fadeProgress;

      routeElements.forEach((route, index) => {
        const packet = packetElements[index];
        const length = routeLengths[index];
        const routeStep = Number(route.dataset.step);
        if (routeStep !== currentStepIndex) {
          resetRoute(route, packet, length);
          return;
        }

        const start = Number(route.dataset.start);
        const end = Number(route.dataset.end);
        const local = Math.min(Math.max((progress - start) / (end - start), 0), 1);
        const distance = length * local;

        route.style.opacity = local > 0 ? String(fadeOpacity) : '0';
        /* 线段与小球共用同一个 distance：小球用 getPointAtLength(distance) 定位，
         * 线条用 dashoffset 从起点画到 distance，二者严格同步、不会出现小球跑在
         * 亮线前面或尾部残留亮线的现象。 */
        route.style.strokeDasharray = String(length);
        route.style.strokeDashoffset = String(length - distance);

        if (local > 0 && local < 1) {
          const point = route.getPointAtLength(distance);
          packet.setAttribute('cx', String(point.x));
          packet.setAttribute('cy', String(point.y));
          packet.style.opacity = '1';
        } else {
          packet.style.opacity = '0';
        }
      });

      endpointElements.forEach((group) => {
        const endpointStep = Number(group.dataset.step);
        if (endpointStep !== currentStepIndex) {
          group.style.opacity = '0';
          return;
        }
        group.style.opacity = String(fadeOpacity);
        group.dataset.arrived = progress >= .94 ? 'true' : 'false';
      });

      const [labelOn, labelOff] = LABEL_WINDOWS[currentStepIndex];
      const shouldActivateLabel = progress >= labelOn && progress < labelOff;
      if (shouldActivateLabel !== labelActiveRef.current) {
        labelActiveRef.current = shouldActivateLabel;
        setIsLabelActive(shouldActivateLabel);
      }

      if (playingRef.current && elapsed >= stepDuration + STEP_FADE) {
        const nextStep = (currentStepIndex + 1) % FLOW_STEPS.length;
        stepRef.current = nextStep;
        setActiveStep(nextStep);
        labelActiveRef.current = false;
        setIsLabelActive(false);
        stepStartedAtRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isMobile, isFullView]);

  /* 手机聚焦镜头使用移动几何；「查看全图」直接复用桌面端完整几何。 */
  const useMobileGeometry = isMobile && !isFullView;
  const viewBox = useMobileGeometry ? MOBILE_VIEWBOX : '0 0 1200 736';
  const skeleton = useMobileGeometry ? MOBILE_SKELETON : SKELETON;
  const joints = useMobileGeometry ? MOBILE_JOINTS : JOINTS;
  const haloXs = useMobileGeometry ? MOBILE_HALO_XS : HALO_XS;
  const haloY = useMobileGeometry ? MOBILE_HALO_Y : HALO_Y;
  const endpoints = useMobileGeometry ? MOBILE_ENDPOINTS : ENDPOINTS;
  const routes = useMobileGeometry ? MOBILE_ROUTES : ROUTES;
  const stepEndpoints = useMobileGeometry ? MOBILE_STEP_ENDPOINTS : STEP_ENDPOINTS;

  return (
    <div className={styles.ecosystemShell}>
      <section className={styles.flowControlsPanel} aria-label="产品体系动画播放控制">
        <div className={styles.flowControls}>
          <button type="button" className={styles.flowPlay} aria-label={isPlaying ? '暂停产品体系动画' : '继续播放产品体系动画'} aria-pressed={isPlaying} onClick={togglePlaying}>
            <span className={styles.flowIconPause} aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.5" /><rect x="13.5" y="5" width="4" height="14" rx="1.5" /></svg></span>
            <span className={styles.flowIconPlay} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5 20 12 8 18.5Z" /></svg></span>
          </button>
          <div className={styles.flowStepCopy} aria-live="polite" key={'copy-' + activeStep}>
            <span>{String(activeStep + 1).padStart(2, '0')}</span><strong>{currentStep.title}</strong><p>{currentStep.description}</p>
          </div>
          <div className={styles.flowStepDots} role="tablist" aria-label="产品体系六步流程">
            {FLOW_STEPS.map((step, index) => (
              <button type="button" role="tab" aria-selected={activeStep === index} className={activeStep === index ? styles.isActive : undefined} onClick={() => playFrom(index)} key={step.title}>
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.stageScale} data-full-view={isFullView} aria-label="墨斗云空间智能产品体系">
        <div className={styles.mobileCameraBar}>
          <button type="button" aria-pressed={isFullView} onClick={() => setIsFullView((value) => !value)}>{isFullView ? '聚焦当前' : '查看全图'}</button>
        </div>
        <button className={`${styles.cameraArrow} ${styles.cameraArrowPrev}`} type="button" aria-label="上一步" onClick={() => moveStep(-1)}>‹</button>
        <div className={styles.stageInner} onPointerDown={handleCameraPointerDown} onPointerMove={handleCameraPointerMove} onPointerUp={handleCameraPointerEnd} onPointerCancel={handleCameraPointerEnd}>
          <section ref={stageRef} className={styles.ecosystemStage} data-step={activeStep + 1}>
          <svg className={styles.ecosystemLines} viewBox={viewBox} aria-hidden="true">
            {skeleton.map((p, index) => (
              <path
                key={`skeleton-${index}`}
                className={styles.line + (p.cls.includes('thin') ? ' ' + styles.lineThin : '') + (p.cls.includes('bottom') ? ' ' + styles.lineBottom : '')}
                d={p.d}
              />
            ))}
            <g className={styles.signalHalos} aria-hidden="true">{haloXs.map((cx) => <g key={cx}><circle className={styles.signalHalo} cx={cx} cy={haloY} r="9" /><circle className={styles.jointSignal} cx={cx} cy={haloY} r="4" /></g>)}</g>
            <g className={styles.joints}>{joints.map(([cx, cy]) => <circle className={styles.joint} cx={cx} cy={cy} r="2.6" key={cx + '-' + cy} />)}</g>
            <g className={styles.routeEndpoints} aria-hidden="true">
              {endpoints.map(([cx, cy]) => (
                <circle className={styles.routeEndpoint} cx={cx} cy={cy} r="2.6" key={`endpoint-${cx}-${cy}`} />
              ))}
            </g>
            <g className={styles.activeRoutes} aria-hidden="true">
              {routes.map((route, index) => (
                <g key={`route-${route.step}-${index}`} data-step={route.step}>
                  <path className={styles.routeHighlight} d={route.path} data-flow-route data-step={route.step} data-start={route.start} data-end={route.end} />
                  <circle className={styles.routePacket} r="4.5" data-flow-packet />
                </g>
              ))}
            </g>
            <g className={styles.activeEndpoints} aria-hidden="true">
              {stepEndpoints.map((points, step) => (
                <g data-flow-endpoints data-step={step} key={`active-endpoints-${step}`}>
                  {points.map(([cx, cy], index) => (
                    <g key={`${step}-${cx}-${cy}`} className={index === 0 ? styles.endpointStart : styles.endpointEnd}>
                      <circle className={styles.activeEndpointHalo} cx={cx} cy={cy} r="9" />
                      <circle className={styles.activeEndpoint} cx={cx} cy={cy} r="3.6" />
                    </g>
                  ))}
                </g>
              ))}
            </g>
          </svg>

          {LABELS.map((label, index) => <span className={styles.flowLabel + ' ' + label.className} data-active={activeStep === index && isLabelActive} key={label.text}>{label.text}</span>)}
          <article className={styles.ecosystemCard + ' ' + styles.ecosystemCardUser}><div className={styles.ecosystemKicker}><span className={styles.ecosystemIcon}><NodeIcon type="data" /></span>异构数据融合</div><h3>多源空间数据</h3></article>
          <article className={styles.ecosystemCard + ' ' + styles.ecosystemCardBase}><div className={styles.ecosystemKicker}><span className={styles.ecosystemIcon}><NodeIcon type="base" /></span>空间语义组织</div><h3>空间智能数据底座</h3></article>
          <article className={styles.ecosystemCard + ' ' + styles.ecosystemCardModel + ' ' + styles.ecosystemCardDark}><div className={styles.ecosystemKicker}><span className={styles.ecosystemIcon}><NodeIcon type="model" /></span>场景智能生成</div><h3>空间智能垂类模型</h3></article>
          <MemoryStacks />
          <OutcomeBoard />
        </section>
        </div>
        <button className={`${styles.cameraArrow} ${styles.cameraArrowNext}`} type="button" aria-label="下一步" onClick={() => moveStep(1)}>›</button>
      </div>
    </div>
  );
}
