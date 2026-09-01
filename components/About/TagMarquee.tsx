'use client';

import { Fragment, useEffect, useRef } from 'react';
import styles from './About.module.css';

type TagMarqueeProps = {
  tags: readonly string[];
  ariaLabel?: string;
};

type Motion = {
  rotation: readonly [number, number, number];
  delay: number;
};

const TOTAL_DURATION = 1.327;
const ROTATIONS: Motion['rotation'][] = [
  [250, 50, 0],
  [-162, -45, 0],
  [-15, 15, 0],
  [0, -60, 0],
  [50, 375, 360],
  [132, 34, 0],
  [-235, -72, 0],
  [88, 420, 360],
  [-110, 72, 0],
];

function TagIcon({ index }: { index: number }) {
  const paths = [
    <><rect key="a" x="2.5" y="3.5" width="11" height="10" rx="2" /><path key="b" d="M5 2v3M11 2v3M2.5 7h11M5.25 10h.01M8 10h.01M10.75 10h.01" /></>,
    <><circle key="a" cx="6" cy="5" r="2.25" /><path key="b" d="M2.5 13c.45-2.55 1.65-3.8 3.5-3.8S9.05 10.45 9.5 13M11.8 4.3c1.75.85 1.75 3.1 0 4.05-1.75-.95-1.75-3.2 0-4.05Z" /></>,
    <><rect key="a" x="4" y="4" width="8" height="8" rx="1.5" /><path key="b" d="M6 1.8v2M10 1.8v2M6 12v2.2M10 12v2.2M1.8 6h2M12 6h2.2M1.8 10h2M12 10h2.2M6.5 6.5h3v3h-3z" /></>,
    <><path key="a" d="m2.5 12.8 1.1-3.25L10.7 2.5l2.8 2.8-7.05 7.1zM9.7 3.5l2.8 2.8M3.6 9.55l2.85 2.85M10.5 11.5h3M12 10v3" /></>,
    <><path key="a" d="M2 6.2a8.5 8.5 0 0 1 12 0M4.3 8.55a5.25 5.25 0 0 1 7.4 0M6.65 10.9a1.9 1.9 0 0 1 2.7 0M8 13.1h.01" /></>,
    <><path key="a" d="M2.5 5.5c1.1-2.1 2.4-2.1 3.5 0s2.4 2.1 3.5 0 2.4-2.1 4 0M3.2 9.5c1.25 3 3.05 4.3 5.05 4.3s3.75-1.3 4.55-4.3M5.5 9h.01M10.5 9h.01" /></>,
    <><path key="a" d="M1.5 9.2c1.25 0 1.25-1.6 2.5-1.6s1.25 1.6 2.5 1.6S7.75 7.6 9 7.6s1.25 1.6 2.5 1.6S12.75 7.6 14 7.6M2.5 12c1.25 0 1.25-1.3 2.5-1.3S6.25 12 7.5 12 8.75 10.7 10 10.7s1.25 1.3 2.5 1.3" /></>,
    <><path key="a" d="m8 2 1.55 3.15L13 5.65l-2.5 2.45.6 3.45L8 9.9l-3.1 1.65.6-3.45L3 5.65l3.45-.5zM3 13.5h10" /></>,
    <><path key="a" d="M8 14s4-3.9 4-7.5a4 4 0 1 0-8 0C4 10.1 8 14 8 14Z" /><path key="b" d="M8 4.5c1.35.7 1.7 2.2.75 3.45-.8 1.05-2.25.95-2.75-.15 1.25-.15 2.05-.8 2-1.8" /></>,
  ];

  return (
    <svg className={styles.tagIcon} viewBox="0 0 16 16" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        {paths[index % paths.length]}
      </g>
    </svg>
  );
}

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
  if (time < 1.16) return segment(time, 0.66, 1.16, peakY, 20, easeFall);
  return segment(time, 1.16, TOTAL_DURATION, 20, 0, easeSettle);
}

function getRotation(time: number, rotation: Motion['rotation']) {
  if (time < 0.83) return segment(time, 0, 0.83, rotation[0], rotation[1], easeRise);
  if (time < 1.16) return segment(time, 0.83, 1.16, rotation[1], rotation[2], easeFall);
  return rotation[2];
}

export default function TagMarquee({
  tags,
  ariaLabel = '个人标签',
}: TagMarqueeProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const pills = Array.from(host.querySelectorAll<HTMLElement>('[data-tag-pill]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let observer: IntersectionObserver | null = null;
    let hasPlayed = false;

    const revealImmediately = () => {
      pills.forEach((pill) => {
        pill.style.opacity = '1';
        pill.style.visibility = 'visible';
        pill.style.transform = '';
      });
      host.dataset.motionComplete = 'true';
    };

    if (reduceMotion) {
      revealImmediately();
      return;
    }

    const play = () => {
      if (hasPlayed) return;
      hasPlayed = true;
      host.dataset.motionActive = 'true';

      const compact = window.matchMedia('(max-width: 520px)').matches;
      const startY = compact ? 118 : 210;
      const peakY = compact ? -58 : -100;
      const delayStep = compact ? 0.045 : 0.035;
      const start = performance.now();

      const tick = (now: number) => {
        let running = false;

        pills.forEach((pill, index) => {
          const motion: Motion = {
            rotation: ROTATIONS[index % ROTATIONS.length],
            delay: index * delayStep,
          };
          const time = (now - start) / 1000 - motion.delay;

          if (time < 0) {
            running = true;
            return;
          }

          const clamped = Math.min(time, TOTAL_DURATION);
          const y = getY(clamped, startY, peakY);
          const rotation = getRotation(clamped, motion.rotation);

          pill.style.opacity = '1';
          pill.style.visibility = 'visible';
          pill.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`;

          if (time < TOTAL_DURATION) running = true;
        });

        if (running) {
          frame = requestAnimationFrame(tick);
          return;
        }

        /* Some paths intentionally finish at 360deg, which is visually the
         * same as 0deg but not the same CSS value. Clearing that inline style
         * after re-enabling transitions makes the browser animate 360 -> 0
         * once more. Normalize every pill while transitions are still
         * disabled, force that state to commit, then restore hover motion. */
        pills.forEach((pill) => {
          pill.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        });
        void host.offsetWidth;
        delete host.dataset.motionActive;
        host.dataset.motionComplete = 'true';
        frame = requestAnimationFrame(() => {
          pills.forEach((pill) => {
            pill.style.transform = '';
          });
        });
      };

      frame = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer?.disconnect();
        play();
      },
      { threshold: 0.3 }
    );
    observer.observe(host);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [tags]);

  return (
    <div ref={hostRef} className={styles.tagsViewport}>
      <ul className={styles.tags} aria-label={ariaLabel}>
        {tags.map((tag, index) => (
          <Fragment key={tag}>
            <li className={styles.tag} data-tag-pill>
              <TagIcon index={index} />
              <span>{tag}</span>
            </li>
            {tag === tags[4] ? (
              <li className={styles.tagBreak} aria-hidden="true" />
            ) : null}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
