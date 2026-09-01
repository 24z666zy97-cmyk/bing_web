'use client';

import styles from './SystemPage.module.css';

export default function ContinueScrollCue({ targetId, label }: { targetId: string; label: string }) {
  const revealTarget = (button: HTMLButtonElement) => {
    if (!document.getElementById(targetId)) return;

    const targetTop = window.scrollY + button.getBoundingClientRect().bottom + 1;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    window.scrollTo({
      top: Math.min(Math.max(0, targetTop), maxTop),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <button className={`${styles.scrollCue} ${styles.inlineScrollCue}`} type="button" onClick={(event) => revealTarget(event.currentTarget)} aria-label={`${label}，并继续向下滚动`}>
      <span className={styles.scrollIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </span>
    </button>
  );
}
