'use client';

import { useEffect, useRef, useState } from 'react';
import { lockScroll } from '@/lib/scroll-lock';

/* Hero 状态机（requirements.md §140 起）。
 *
 *   closed → local-opening → open → whole-peeling → gone
 *
 * 两段进度分开：
 *   localProgress 局部撕开 0..1，由入场时间驱动，期间锁滚动
 *   peelProgress  整张卷起 0..1，由滚动位置驱动
 *
 * 卷起进度映射的是「吸顶行程」：.hero 比视口高出的那一段，
 * 也就是 .sentinel 的高度。脸在吸顶期间原地卷走，卷完才让
 * 下方内容顶上来。用 .hero 的 rect.top 而不是 sentinel 的
 * 底边——sentinel 底边越过视口上沿时 sticky 早已解除吸顶，
 * 那时候再卷就什么都看不见了。
 */

export type HeroStage = 'closed' | 'local-opening' | 'open' | 'whole-peeling' | 'gone';

/** 局部撕开时长，ms */
const OPEN_DURATION = 2400;

export function useHeroStage(
  heroRef: React.RefObject<HTMLElement | null>,
  active = true,
) {
  const [stage, setStage] = useState<HeroStage>('closed');
  const [localProgress, setLocalProgress] = useState(0);
  const [peelProgress, setPeelProgress] = useState(0);

  // 用 ref 读 stage，避免把 stage 放进滚动 effect 的依赖里反复解绑
  const stageRef = useRef<HeroStage>('closed');
  stageRef.current = stage;

  /* 入场：局部撕开。期间锁滚动，结束后解锁。 */
  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      // §366：不播过程，直接完成态，也不锁滚动
      setStage('open');
      setLocalProgress(1);
      return;
    }

    setStage('local-opening');
    const release = lockScroll('hero-local-tear');

    /* 超时兜底（scroll-lock.ts §20）：万一 rAF 被浏览器挂起
     * （标签页切到后台等），也必须解锁，禁止永久锁页。 */
    const failsafe = window.setTimeout(() => {
      setLocalProgress(1);
      setStage('open');
      release();
    }, OPEN_DURATION + 2000);

    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / OPEN_DURATION);
      // easeOutCubic：起手快、收尾稳，撕纸的手感
      setLocalProgress(t * t * (3 - 2 * t));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setStage('open');
        window.clearTimeout(failsafe);
        release();
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      // 组件在动画中途卸载也要还锁，否则页面永久锁死
      release();
    };
  }, [active]);

  /* 卷起：滚动驱动。
   *
   * reduced-motion 下整段跳过：CSS 已把 .sentinel 高度归零，
   * 吸顶行程为 0，再算下去 span 会被夹成 1，稍一滚动进度就
   * 跳到 1、stage 变 gone，把 Hero 标成不可交互。 */
  useEffect(() => {
    if (!active) return;

    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;

      // 局部撕开还没结束就不接受卷起，两段动画不能重叠
      if (stageRef.current === 'closed' || stageRef.current === 'local-opening') {
        setPeelProgress(0);
        return;
      }

      /* hero 顶边推过视口上沿的距离，就是已走完的吸顶行程。
       * 行程总长 = hero 高度 - 视口高度（即 sentinel 的高度）。 */
      const rect = hero.getBoundingClientRect();
      const passed = -rect.top;
      if (passed <= 0) {
        setPeelProgress(0);
        if (stageRef.current === 'whole-peeling') setStage('open');
        return;
      }

      const span = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, passed / span);
      setPeelProgress(p);

      if (p >= 1) setStage('gone');
      else setStage('whole-peeling');
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroRef, active]);

  return { stage, localProgress, peelProgress };
}
