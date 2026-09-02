'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import styles from './MobileCardCarousel.module.css';

const AUTOPLAY_MS = 2500;
const INTERACTION_PAUSE_MS = 6000;
const SWIPE_THRESHOLD_PX = 42;

export function useMobileCardCarousel(count: number, rootRef: RefObject<HTMLElement | null>, paused = false) {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous' | null>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [resumeAt, setResumeAt] = useState(0);
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || !rootRef.current) {
      setVisible(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.28 });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [enabled, rootRef]);

  const select = useCallback((next: number, userInitiated = true) => {
    const normalized = ((next % count) + count) % count;
    setDirection(normalized === (index - 1 + count) % count ? 'previous' : 'next');
    setIndex(normalized);
    if (userInitiated) setResumeAt(Date.now() + INTERACTION_PAUSE_MS);
  }, [count, index]);

  useEffect(() => {
    if (!enabled || !visible || !pageVisible || paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const delay = Math.max(AUTOPLAY_MS, resumeAt - Date.now());
    const timer = window.setTimeout(() => {
      setDirection('next');
      setIndex((current) => (current + 1) % count);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [count, enabled, index, pageVisible, paused, resumeAt, visible]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || !event.isPrimary) return;
    setResumeAt(Date.now() + INTERACTION_PAUSE_MS);
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!enabled || !start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
    select(index + (dx < 0 ? 1 : -1));
  };

  const getPosition = (cardIndex: number) => {
    if (cardIndex === index) return 'active';
    if (cardIndex === (index + 1) % count) return 'next';
    if (cardIndex === (index - 1 + count) % count) return 'previous';
    return 'hidden';
  };

  return { enabled, index, direction, select, getPosition, onPointerDown, onPointerUp };
}

export function MobileCardCarouselControls({ label, onPrevious, onNext }: { label: string; onPrevious: () => void; onNext: () => void }) {
  return <div className={styles.controls} aria-label={`${label}卡片切换`}>
    <button className={styles.button} type="button" onClick={onPrevious} aria-label="查看上一张卡片"><svg viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg></button>
    <button className={styles.button} type="button" onClick={onNext} aria-label="查看下一张卡片"><svg viewBox="0 0 20 20"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg></button>
  </div>;
}
