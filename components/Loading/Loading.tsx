'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react';
import { lockScroll } from '@/lib/scroll-lock';
import styles from './Loading.module.css';

const STORAGE_KEY = 'zy-loading-seen';
const MODULES = ['SYSTEM', 'SENSE', 'SIGNALS', 'STAGES'] as const;
/* 每行文字列占位用的最长文案：让文字宽度固定，完成变短时不跳动 */
const LOADING_SIZER = `Loading ${MODULES.reduce((a, b) => (a.length > b.length ? a : b))}...`;
const MODULE_INTERVAL = 1200;
const WELCOME_DELAY = 500;
const AUTO_ENTER_DELAY = 5000;
const LEAVE_FALLBACK_DELAY = 1000;
const MODULE_TIMINGS = MODULES.map((_, index) => (index + 1) * MODULE_INTERVAL);
const WELCOME_AT = MODULE_TIMINGS[MODULE_TIMINGS.length - 1] + WELCOME_DELAY;

interface LoadingProps {
  /** Fires only after the Loading overlay has fully left the screen. */
  onFinish?: () => void;
}

export default function Loading({ onFinish }: LoadingProps) {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const unlockRef = useRef<(() => void) | null>(null);
  const finishedRef = useRef(false);
  const leaveFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // If storage is unavailable, play the entrance once for this mount.
    }

    if (seen) {
      setVisible(false);
      finishedRef.current = true;
      onFinish?.();
    } else {
      setVisible(true);
    }
  }, [onFinish]);

  useEffect(() => {
    if (visible !== true) return;

    unlockRef.current = lockScroll('loading');
    const timers: ReturnType<typeof setTimeout>[] = [];

    MODULE_TIMINGS.forEach((at, index) => {
      timers.push(setTimeout(() => setDoneCount(index + 1), at));
    });
    timers.push(setTimeout(() => setShowWelcome(true), WELCOME_AT));

    return () => {
      timers.forEach(clearTimeout);
      unlockRef.current?.();
      unlockRef.current = null;
    };
  }, [visible]);

  const completeExit = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    if (leaveFallbackRef.current) {
      clearTimeout(leaveFallbackRef.current);
      leaveFallbackRef.current = null;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage failure may replay Loading next visit, but must not block entry.
    }

    setVisible(false);
    unlockRef.current?.();
    unlockRef.current = null;
    onFinish?.();
  }, [onFinish]);

  const finish = useCallback(() => {
    if (finishedRef.current || leaving || !showWelcome) return;
    setLeaving(true);
    leaveFallbackRef.current = setTimeout(completeExit, LEAVE_FALLBACK_DELAY);
  }, [completeExit, leaving, showWelcome]);

  useEffect(() => {
    if (visible !== true || !showWelcome || leaving) return;
    const timer = setTimeout(finish, AUTO_ENTER_DELAY);
    return () => clearTimeout(timer);
  }, [finish, leaving, showWelcome, visible]);

  useEffect(() => {
    if (visible !== true || !showWelcome || leaving) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        finish();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finish, leaving, showWelcome, visible]);

  useEffect(() => {
    return () => {
      if (leaveFallbackRef.current) clearTimeout(leaveFallbackRef.current);
    };
  }, []);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (
        leaving &&
        event.currentTarget === event.target &&
        event.propertyName === 'opacity'
      ) {
        completeExit();
      }
    },
    [completeExit, leaving],
  );

  if (visible !== true) return null;

  return (
    <div
      className={styles.root}
      data-state={leaving ? 'leaving' : 'running'}
      onClick={showWelcome && !leaving ? finish : undefined}
      onTransitionEnd={handleTransitionEnd}
      role={showWelcome ? 'button' : 'status'}
      tabIndex={showWelcome && !leaving ? 0 : -1}
      aria-label={showWelcome ? 'Enter homepage' : 'Initializing workspace'}
      aria-busy={!showWelcome}
    >
      <div className={styles.inner}>
        {!showWelcome && (
          <>
            <p className={styles.title}>Initializing Workspace</p>
            <ul className={styles.modules} aria-live="polite">
              {MODULES.map((name, index) => {
                const done = index < doneCount;
                return (
                  <li key={name} className={styles.module} data-done={done}>
                    <span className={styles.text}>
                      <span className={styles.textGhost} aria-hidden="true">{LOADING_SIZER}</span>
                      <span className={styles.textLabel}>{done ? name : `Loading ${name}...`}</span>
                    </span>
                    <span className={styles.check} aria-hidden="true">
                      {done ? '\u2713' : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {showWelcome && (
          <div className={styles.welcome}>
            <p className={styles.welcomeLine}>Welcome</p>
            <p className={styles.workspace}>Zhang Yubing&apos;s Workspace</p>
            <p className={styles.hint}>Click to explore</p>
          </div>
        )}
      </div>
    </div>
  );
}