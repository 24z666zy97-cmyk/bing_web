'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './SystemPage.module.css';

export type ThinkingNodeContent = readonly [english: string, chinese: string, detail: string];

const NODES: readonly ThinkingNodeContent[] = [
  ['User Needs', '用户需求', '理解行业痛点与业务目标。'],
  ['Business Workflow', '业务流程', '拆解任务链路、角色关系和关键规则。'],
  ['Data Structure', '数据组织', '组织多源数据、信息与关系。'],
  ['Product Capability', '产品能力', '将需求转化为平台功能与服务模块。'],
  ['AI Workflow', 'AI 赋能', '辅助信息检索、分析判断与任务交互。'],
  ['Scenario Value', '行业方案', '在场景中验证能力并沉淀可复制路径。'],
] as const;

/* 每块图版的图钉：左右交替、倾斜方向与幅度各异，接近手工钉图版的自然感。 */
const PIN_PLACEMENT = [
  { side: 'right', tilt: -10 },
  { side: 'left', tilt: 9 },
  { side: 'right', tilt: 14 },
  { side: 'left', tilt: -14 },
  { side: 'right', tilt: 7 },
  { side: 'left', tilt: -8 },
] as const;

/* 入场动效：完整复刻首页「抛物线走马灯」——胶囊沿抛物线飞入回落、带大幅翻滚、逐个错开。
 * 时长、缓动、旋转幅度均沿用 TagMarquee（取前 6 组，含 360° 转圈）。 */
const TOTAL_DURATION = 1.327;
const SETTLE_START = 1.16;
const SETTLE_OFFSET = 20;
const GROUP_OVERSHOOT_DURATION = 0.12;
/* 自动巡游的停留与空档刻意等长，让节奏保持稳定、不会显得催促。 */
const CAROUSEL_HOLD_MS = 1200;
const CAROUSEL_GAP_MS = 1200;
const CAROUSEL_INITIAL_GAP_MS = 500;
const ROTATIONS: readonly [number, number, number][] = [
  [250, 50, 0],
  [-162, -45, 0],
  [-15, 15, 0],
  [0, -60, 0],
  [50, 375, 360],
  [132, 34, 0],
];

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  return (x: number) => {
    let time = x;
    for (let index = 0; index < 8; index += 1) {
      const sampleX = ((ax * time + bx) * time + cx) * time;
      const derivative = (3 * ax * time + 2 * bx) * time + cx;
      const error = sampleX - x;
      if (Math.abs(error) < 1e-5 || Math.abs(derivative) < 1e-5) break;
      time -= error / derivative;
    }
    const clamped = Math.max(0, Math.min(1, time));
    return ((ay * clamped + by) * clamped + cy) * clamped;
  };
}

const easeRise = cubicBezier(0.17, 0.17, 0, 1);
const easeFall = cubicBezier(1, 0, 0.5, 1);
const easeSettle = cubicBezier(0.17, 0, 0.5, 1);
const easeGroupOvershoot = cubicBezier(0.3, 0.45, 0.5, 1);

function segment(
  time: number,
  start: number,
  end: number,
  from: number,
  to: number,
  ease: (value: number) => number
) {
  const local = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return from + (to - from) * ease(local);
}

function getY(time: number, startY: number, peakY: number) {
  if (time < 0.66) return segment(time, 0, 0.66, startY, peakY, easeRise);
  if (time < SETTLE_START) return segment(time, 0.66, SETTLE_START, peakY, 0, easeFall);
  return 0;
}

function getRotation(time: number, rotation: readonly [number, number, number]) {
  if (time < 0.83) return segment(time, 0, 0.83, rotation[0], rotation[1], easeRise);
  if (time < 1.16) return segment(time, 0.83, 1.16, rotation[1], rotation[2], easeFall);
  return rotation[2];
}

function PinIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ThinkingNodeIcon({ index }: { index: number }) {
  const paths = [
    <><circle key="a" cx="8" cy="6" r="2.5" /><path key="b" d="M3.5 14c.5-2.6 2-4 4.5-4s4 1.4 4.5 4M12 5.5h2.5M13.25 4.25v2.5" /></>,
    <><path key="a" d="M3 4h4v4H3zM9 8h4v4H9zM3 12h4M5 8v4M7 6h3" /></>,
    <><ellipse key="a" cx="8" cy="4" rx="5" ry="2" /><path key="b" d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8" /></>,
    <><path key="a" d="M3 5.5 8 3l5 2.5L8 8zM3 9.5 8 12l5-2.5M3 12l5 2.5 5-2.5" /></>,
    <><path key="a" d="M6 2.5v2M10 2.5v2M6 11.5v2M10 11.5v2M2.5 6h2M11.5 6h2M2.5 10h2M11.5 10h2M5 5h6v6H5z" /></>,
    <><path key="a" d="M2.5 13.5h11M4 12V8M7 12V5M10 12V7M13 12V3" /></>,
  ];

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        {paths[index % paths.length]}
      </g>
    </svg>
  );
}

export default function SystemThinking({
  nodes = NODES,
  ariaLabel = '产品系统六要素',
  expandedGrid = false,
}: {
  nodes?: readonly ThinkingNodeContent[];
  ariaLabel?: string;
  expandedGrid?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [motionComplete, setMotionComplete] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [columns, setColumns] = useState<1 | 2 | 3 | 6>(6);
  const columnsRef = useRef<1 | 2 | 3 | 6>(6);
  const lastInteractionRef = useRef(-1);

  const toggle = (index: number) => {
    if (expandedGrid) return;
    /* 移动布局始终支持点击抢占当前轮播项；部分窄屏浏览器仍会错误
       上报 hover/fine，不能只用输入设备特征判断。 */
    if (window.matchMedia('(max-width: 767px), (hover: none)').matches) {
      lastInteractionRef.current = index;
      setExpandedIndex((prev) => (prev === index ? null : index));
    }
  };

  useEffect(() => {
    const host = hostRef.current;
    const lane = laneRef.current;
    if (!host || !lane) return;

    const pills = Array.from(host.querySelectorAll<HTMLElement>('[data-capsule]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let observer: IntersectionObserver | null = null;
    let hasPlayed = false;
    let entryAnimations: Animation[] = [];

    const revealImmediately = () => {
      pills.forEach((pill) => {
        pill.style.opacity = '1';
        pill.style.visibility = 'visible';
        pill.style.transform = '';
      });
      lane.style.transform = '';
      host.dataset.motionComplete = 'true';
      setMotionComplete(true);
    };

    if (reduceMotion) {
      revealImmediately();
      return;
    }

    const play = () => {
      if (hasPlayed) return;
      hasPlayed = true;
      host.dataset.motionActive = 'true';

      if (expandedGrid) {
        entryAnimations = pills.map((pill, index) => {
          pill.style.opacity = '1';
          pill.style.visibility = 'visible';
          return pill.animate(
            [
              { transform: 'translate3d(0, 72px, 0)' },
              { transform: 'translate3d(0, 0, 0)' },
            ],
            {
              duration: 680,
              delay: index * 55,
              easing: 'cubic-bezier(.22, 1, .36, 1)',
              fill: 'both',
            }
          );
        });
        const lastAnimation = entryAnimations.at(-1);
        if (lastAnimation) lastAnimation.onfinish = () => {
          entryAnimations.forEach((animation) => animation.cancel());
          delete host.dataset.motionActive;
          host.dataset.motionComplete = 'true';
          setMotionComplete(true);
        };
        return;
      }

      const compact = window.matchMedia('(max-width: 520px)').matches;
      const startY = compact ? 118 : 210;
      const peakY = compact ? -58 : -100;
      const delayStep = compact ? 0.045 : 0.035;
      const sharedArrival = SETTLE_START + (pills.length - 1) * delayStep;
      const sharedOvershootEnd = sharedArrival + GROUP_OVERSHOOT_DURATION;
      const sharedSettleEnd = sharedOvershootEnd + (TOTAL_DURATION - SETTLE_START);
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = (now - start) / 1000;
        const laneY = elapsed < sharedArrival
          ? 0
          : elapsed < sharedOvershootEnd
            ? segment(
                elapsed,
                sharedArrival,
                sharedOvershootEnd,
                0,
                SETTLE_OFFSET,
                easeGroupOvershoot
              )
            : segment(
                Math.min(elapsed, sharedSettleEnd),
                sharedOvershootEnd,
                sharedSettleEnd,
                SETTLE_OFFSET,
                0,
                easeSettle
              );

        lane.style.transform = `translate3d(0, ${laneY.toFixed(2)}px, 0)`;

        pills.forEach((pill, index) => {
          const rotation = ROTATIONS[index % ROTATIONS.length];
          const time = elapsed - index * delayStep;
          if (time < 0) {
            return;
          }
          /* 起飞仍然错峰，但按剩余时间拉伸各自轨迹，确保六颗胶囊
           * 在 sharedArrival 同一帧旋正并到达泳道中心。 */
          const entryDuration = sharedArrival - index * delayStep;
          const entryTime = Math.min(SETTLE_START, (time / entryDuration) * SETTLE_START);
          const y = getY(entryTime, startY, peakY);
          const rot = getRotation(entryTime, rotation);

          pill.style.opacity = '1';
          pill.style.visibility = 'visible';
          pill.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        });

        if (elapsed < sharedSettleEnd) {
          frame = requestAnimationFrame(tick);
          return;
        }

        /* 归一化到正位后清掉内联 transform，交还给 CSS 过渡（hover 边框等） */
        pills.forEach((pill) => {
          pill.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        });
        lane.style.transform = 'translate3d(0, 0, 0)';
        void host.offsetWidth;
        delete host.dataset.motionActive;
        host.dataset.motionComplete = 'true';
        setMotionComplete(true);
        frame = requestAnimationFrame(() => {
          pills.forEach((pill) => {
            pill.style.transform = '';
          });
          lane.style.transform = '';
        });
      };

      frame = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer?.disconnect();
        play();
      },
      { threshold: 0.3 }
    );
    observer.observe(host);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      entryAnimations.forEach((animation) => animation.cancel());
    };
  }, [expandedGrid]);

  useEffect(() => {
    if (expandedGrid) return;
    if (!motionComplete || autoPaused) return;
    /* 桌面与移动端都保留自动巡游；移动端由固定泳道高度吸收展开尺寸，
       不再依靠禁用轮播来避免布局位移。 */

    const showing = expandedIndex !== null;
    const delay = showing
      ? CAROUSEL_HOLD_MS
      : lastInteractionRef.current === -1
        ? CAROUSEL_INITIAL_GAP_MS
        : CAROUSEL_GAP_MS;
    const timer = window.setTimeout(() => {
      if (showing) {
        setExpandedIndex(null);
        return;
      }

      const nextIndex = (lastInteractionRef.current + 1) % nodes.length;
      lastInteractionRef.current = nextIndex;
      setExpandedIndex(nextIndex);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [autoPaused, expandedGrid, expandedIndex, motionComplete, nodes.length]);

  const handleMouseEnter = (index: number) => {
    if (expandedGrid) return;
    if (!window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) return;
    lastInteractionRef.current = index;
    setAutoPaused(true);
    setExpandedIndex(index);
  };

  const handleMouseLeave = (index: number) => {
    if (expandedGrid) return;
    if (!window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) return;
    lastInteractionRef.current = index;
    setExpandedIndex(null);
    setAutoPaused(false);
  };

  useEffect(() => {
    const host = hostRef.current;
    const lane = laneRef.current;
    if (!host || !lane) return;

    const measure = () => {
      const pills = Array.from(lane.querySelectorAll<HTMLElement>('[data-capsule]'));
      if (!pills.length) return;

      if (expandedGrid) {
        pills.forEach((pill) => {
          pill.style.removeProperty('--thinking-collapsed-width');
          pill.style.removeProperty('--thinking-expanded-width');
          pill.style.removeProperty('--thinking-reveal-width');
        });
        columnsRef.current = 6;
        setColumns(6);
        return;
      }

      const laneStyle = getComputedStyle(lane);
      const gap = Number.parseFloat(laneStyle.columnGap) || 0;
      const laneChrome =
        (Number.parseFloat(laneStyle.paddingInlineStart) || 0) +
        (Number.parseFloat(laneStyle.paddingInlineEnd) || 0) +
        (Number.parseFloat(laneStyle.borderInlineStartWidth) || 0) +
        (Number.parseFloat(laneStyle.borderInlineEndWidth) || 0);

      /* 只量收起态中文标题所需宽度，避免 hover / 点击展开时触发布局反复切换。 */
      const collapsedWidths = pills.map((pill) => {
        const pillStyle = getComputedStyle(pill);
        const title = pill.querySelector<HTMLElement>(`.${styles.thinkingZh}`);
        return (
          (title?.scrollWidth || 0) +
          (Number.parseFloat(pillStyle.paddingInlineStart) || 0) +
          (Number.parseFloat(pillStyle.paddingInlineEnd) || 0) +
          (Number.parseFloat(pillStyle.borderInlineStartWidth) || 0) +
          (Number.parseFloat(pillStyle.borderInlineEndWidth) || 0)
        );
      });
      /* clientWidth 会随垂直滚动条出现而缩窄；把滚动条宽度补回去，
         避免临界视口在 6 列与换行布局之间形成反馈振荡。 */
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      const available = host.clientWidth + scrollbarWidth;
      const singleRowWidth = collapsedWidths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, pills.length - 1) + laneChrome;
      const widest = Math.max(...collapsedWidths);
      const mobileGrid = window.matchMedia('(max-width: 767px)').matches;

      let next: 1 | 2 | 3 | 6 = 6;
      /* 换行后需要多出一段安全余量才允许回到单行，防止临界宽度
         因滚动条、子像素取整等 1–16px 波动在 6/3 列间来回切换。 */
      const shouldWrap =
        columnsRef.current === 6
          ? available + 0.5 < singleRowWidth
          : available + 0.5 < singleRowWidth + 24;
      if (mobileGrid) {
        /* 窄手机使用 2 × 3，较宽移动视口使用 3 × 2。展开态只在
           自己的网格单元内变化，避免实时测宽临界抖动。 */
        next = available >= 600 ? 3 : 2;
      } else if (shouldWrap) {
        if (available >= widest * 3 + gap * 2) next = 3;
        else if (available >= widest * 2 + gap) next = 2;
        else next = 1;
      }

      /* 移动端宽度动画使用明确的起止数值：文字层从第一帧起就按
         最终内容宽度排版，再由 CSS 裁切显现，避免动画途中重新换行。 */
      if (next !== 6) {
        const trackWidth = Math.max(0, (available - gap * (next - 1)) / next);
        pills.forEach((pill, index) => {
          const pillStyle = getComputedStyle(pill);
          const inlineChrome =
            (Number.parseFloat(pillStyle.paddingInlineStart) || 0) +
            (Number.parseFloat(pillStyle.paddingInlineEnd) || 0) +
            (Number.parseFloat(pillStyle.borderInlineStartWidth) || 0) +
            (Number.parseFloat(pillStyle.borderInlineEndWidth) || 0);
          /* 移动端同组胶囊收起时统一为最长标题宽度，让 2 × 3 / 3 × 2
             静态网格保持整齐；桌面换行布局仍按各自内容宽度呈现。 */
          const collapsedWidth = mobileGrid
            ? Math.min(widest, trackWidth)
            : collapsedWidths[index];
          const expandedWidth = Math.max(collapsedWidth, trackWidth);
          pill.style.setProperty('--thinking-collapsed-width', `${collapsedWidth.toFixed(2)}px`);
          pill.style.setProperty('--thinking-expanded-width', `${expandedWidth.toFixed(2)}px`);
          pill.style.setProperty(
            '--thinking-reveal-width',
            `${Math.max(0, expandedWidth - inlineChrome).toFixed(2)}px`
          );
        });
      } else {
        pills.forEach((pill) => {
          pill.style.removeProperty('--thinking-collapsed-width');
          pill.style.removeProperty('--thinking-expanded-width');
          pill.style.removeProperty('--thinking-reveal-width');
        });
      }
      columnsRef.current = next;
      setColumns((current) => (current === next ? current : next));
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(host);
    document.fonts.ready.then(measure);
    measure();

    return () => resizeObserver.disconnect();
  }, [expandedGrid]);

  const renderNode = ([english, chinese, detail]: ThinkingNodeContent, index: number) => (
    <button
      type="button"
      key={english}
      className={styles.thinkingNode}
      data-capsule
      data-expanded={expandedGrid || expandedIndex === index ? 'true' : undefined}
      aria-expanded={expandedGrid || expandedIndex === index}
      onClick={() => toggle(index)}
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={() => handleMouseLeave(index)}
    >
      <span className={styles.thinkingZh}>
        <ThinkingNodeIcon index={index} />
        <span>{chinese}</span>
      </span>
      <span className={styles.thinkingReveal}>
        <span className={styles.thinkingEn}>{english}</span>
      </span>
      <span className={styles.thinkingReveal}>
        <span className={styles.thinkingDesc}>{detail}</span>
      </span>
      <span
        className={styles.thinkingPin}
        data-side={PIN_PLACEMENT[index % PIN_PLACEMENT.length].side}
        style={{ '--pin-tilt': `${PIN_PLACEMENT[index % PIN_PLACEMENT.length].tilt}deg` } as CSSProperties}
        aria-hidden="true"
      >
        <PinIcon />
      </span>
    </button>
  );

  return (
    <div ref={hostRef} className={`${styles.thinkingFlow} ${expandedGrid ? styles.thinkingExpandedGrid : ''}`} role="group" aria-label={ariaLabel}>
      <div ref={laneRef} className={styles.thinkingLane} data-columns={columns}>
        {expandedGrid
          ? [[0, 2], [2, 5], [5, 7]].map(([start, end]) => (
              <div className={styles.thinkingExpandedRow} key={start}>
                {nodes.slice(start, end).map((node, offset) => renderNode(node, start + offset))}
              </div>
            ))
          : nodes.map(renderNode)}
      </div>
    </div>
  );
}
