'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { setCurlProgress, setNavStage } from '@/lib/nav-visibility';
import { lockScroll } from '@/lib/scroll-lock';
import BrainWorld from './BrainWorld';
import Face from './Face';
import { useHeroStage } from './useHeroStage';
import styles from './Hero.module.css';

/* Hero layers share the 1068x1213 coordinate system:
 * BrainWorld sits below the masked portrait, eyes sit between portrait and flap,
 * and the lifted flap plus tear edge remain on top.
 */

interface HeroProps {
  active?: boolean;
}

export default function Hero({ active = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const tearEdgeMarkerRef = useRef<HTMLDivElement>(null);
  const [flapPrepared, setFlapPrepared] = useState(false);
  const [eyesPrepared, setEyesPrepared] = useState(false);
  const [showShackFace, setShowShackFace] = useState(false);
  const tearPrepared = flapPrepared && eyesPrepared;
  const markFlapPrepared = useCallback(() => setFlapPrepared(true), []);
  const markEyesPrepared = useCallback(() => setEyesPrepared(true), []);

  const { stage, localProgress, peelProgress } = useHeroStage(
    heroRef,
    active && tearPrepared,
  );
  // Keep the first half broad and shallow; reserve the tight fold for the end.
  const tearProgress =
    localProgress < 0.72
      ? 0.42 * Math.pow(localProgress / 0.72, 1.35)
      : 0.42 +
        0.58 * Math.pow((localProgress - 0.72) / 0.28, 0.85);
  const nameChars = Array.from('Zhang Yubing');
  const nameIntroProgress = Math.min(1, Math.max(0, (localProgress - 0.5) / 0.5));

  useEffect(() => {
    if (!active || tearPrepared) return;
    const release = lockScroll('hero-tear-prepare');
    const failsafe = window.setTimeout(() => {
      setFlapPrepared(true);
      setEyesPrepared(true);
    }, 5000);
    return () => {
      window.clearTimeout(failsafe);
      release();
    };
  }, [active, tearPrepared]);

  /* Reveal navigation after the local tear; drive its indicator from peel progress. */
  useEffect(() => {
    if (stage !== 'closed' && stage !== 'local-opening') setNavStage('torn');
  }, [stage]);

  useEffect(() => {
    setCurlProgress(peelProgress);
  }, [peelProgress]);

  useEffect(() => {
    let frame = 0;

    const updateFace = () => {
      frame = 0;
      const marker = tearEdgeMarkerRef.current;
      if (!marker) return;
      setShowShackFace(marker.getBoundingClientRect().top <= 0);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFace);
    };

    updateFace();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} data-stage={stage}>
      <div className={styles.sticky}>
        <div
          className={styles.name}
          data-prepared={tearPrepared}
          style={{ '--peel': peelProgress } as React.CSSProperties}
          aria-hidden="true"
        >
          {nameChars.map((char, index) => {
            const charProgress = Math.min(
              1,
              Math.max(0, (nameIntroProgress - index * 0.055) / 0.395),
            );
            const exitRaw = Math.min(
              1,
              Math.max(0, (peelProgress - index * 0.025) / 0.1),
            );
            const charExitProgress =
              exitRaw * exitRaw * (3 - 2 * exitRaw);
            return (
              <span
                key={`${char}-${index}`}
                className={styles.nameChar}
                style={
                  {
                    '--char-progress': charProgress,
                    '--char-exit-progress': charExitProgress,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              >
                {char === ' ' ? '\u00a0' : char}
              </span>
            );
          })}
        </div>
        <div
          className={styles.stage}
          data-prepared={tearPrepared}
          style={
            {
              '--peel': peelProgress,
              '--open': tearProgress,
            } as React.CSSProperties
          }
        >
          <BrainWorld progress={tearProgress} />
          <div
            ref={tearEdgeMarkerRef}
            className={styles.tearEdgeMarker}
            aria-hidden="true"
          />
          <Face
            progress={tearProgress}
            showShackFace={showShackFace}
            forgeEnabled={stage !== 'gone'}
            onFlapPrepared={markFlapPrepared}
            onEyesPrepared={markEyesPrepared}
          />
        </div>
        <a
          className={styles.mobileScrollCue}
          href="#about-heading"
          onClick={(event) => {
            const target = document.getElementById('about-heading');
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'center',
            });
            window.history.pushState(null, '', '#about-heading');
          }}
        >
          <span className={styles.mobileScrollCueLabel}>About me</span>
          <span className={styles.mobileScrollCueIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </a>
      </div>

      {/* Sticky scroll travel for the whole-sheet peel. */}
      <div className={styles.sentinel} aria-hidden="true" />
    </section>
  );
}
