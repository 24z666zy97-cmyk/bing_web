'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './BrainWorld.module.css';

/* Brain-world base layer. Cropped assets map back to the shared 1068x1213 canvas,
 * preserving their visual relationships while providing independent hit areas.
 */

/** Crop positions on the original canvas, including transparent safety margins. */
const ITEMS = [
  { name: 'cloud', box: [8.708, 17.724, 35.581, 21.022], size: [380, 255] },
  { name: 'brain', box: [13.951, 17.477, 51.873, 33.636], size: [554, 408] },
  { name: 'analyticsClipboard', label: 'SENSE', waveOrder: 3, capsule: [83.072, 32.232, 13], box: [61.049, 14.674, 31.461, 38.17], size: [336, 463], hitArea: 'polygon(96.4% 19.9%, 69% 93.3%, 67.3% 95.9%, 65.5% 97.2%, 59.5% 98.1%, 57.7% 97.6%, 6% 73%, 4.2% 70.4%, 3% 64.4%, 20.8% 6.9%, 25% 3.5%, 27.4% 2.2%, 91.7% 16.4%, 94.6% 17.7%)' },
  { name: 'glasses', label: 'SIGNALS', waveOrder: 1, capsule: [24.2, 21.1, -9], box: [32.865, 4.452, 28.933, 48.805], size: [309, 592], hitArea: 'polygon(95.8% 88.2%, 95.8% 92.6%, 94.5% 93.6%, 86.7% 96.3%, 70.6% 98%, 62.8% 96.6%, 27.2% 82.4%, 18.8% 75.3%, 3.9% 33.1%, 7.1% 20.3%, 19.4% 11.5%, 44% 2.4%, 46% 2%, 52.4% 2.4%, 61.5% 6.1%, 63.4% 7.8%)' },
  { name: 'voicemic', label: 'STAGES', waveOrder: 2, capsule: [54.475, 26.185, 6], box: [50.655, 1.649, 22.472, 53.339], size: [240, 647], hitArea: 'polygon(95% 17.9%, 52.5% 95.8%, 46.7% 97.7%, 30% 98%, 20.8% 97.1%, 19.2% 96.8%, 15% 94.9%, 5% 17%, 5% 15.1%, 23.3% 4.9%, 31.7% 3.1%, 42.5% 1.9%, 67.5% 3.1%, 79.2% 6.2%, 90% 11.7%)' },
  { name: 'molecularFormula', label: 'SYSTEM', waveOrder: 0, capsule: [1.423, 25.84, -14], box: [2.622, 13.85, 39.981, 33.306], size: [427, 404], hitArea: 'polygon(97.4% 56.4%, 97% 61.9%, 77.8% 93.1%, 73.1% 97%, 68.4% 97.5%, 65.6% 96.5%, 44.5% 82.7%, 2.8% 17.3%, 2.3% 12.9%, 2.8% 9.4%, 6.1% 4.5%, 8.4% 3%, 9.8% 2.5%, 46.8% 6.9%, 95.1% 51.5%, 97% 55%)' },
  { name: 'heart', box: [49.251, 32.317, 17.978, 14.097], size: [192, 171] },
] as const;

const GATHER_POINT = [52, 46] as const;
const MOBILE_CAROUSEL_STEP_MS = 1600;
const MOBILE_TOUCH_HOLD_MS = 1800;

type BrainItem = (typeof ITEMS)[number];
type InteractiveItem = Extract<BrainItem, { label: string; waveOrder: number }>;

const INTERACTIVE_ITEMS = [...ITEMS]
  .filter((item): item is InteractiveItem => 'label' in item)
  .sort((a, b) => a.waveOrder - b.waveOrder);

const isMobileInteraction = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

interface BrainWorldProps {
  /** Local tear-open progress from 0 to 1. */
  progress: number;
}

export default function BrainWorld({ progress }: BrainWorldProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const carouselTimer = useRef<number | null>(null);
  const touchHoldTimer = useRef<number | null>(null);
  const nextCarouselIndex = useRef(0);

  const clearTimers = useCallback(() => {
    if (carouselTimer.current !== null) window.clearTimeout(carouselTimer.current);
    carouselTimer.current = null;
    if (touchHoldTimer.current !== null) window.clearTimeout(touchHoldTimer.current);
    touchHoldTimer.current = null;
  }, []);

  const startCarousel = useCallback((delay = 0) => {
    if (progress < 1 || !isMobileInteraction()) return;

    if (carouselTimer.current !== null) window.clearTimeout(carouselTimer.current);
    carouselTimer.current = window.setTimeout(() => {
      const item = INTERACTIVE_ITEMS[nextCarouselIndex.current % INTERACTIVE_ITEMS.length];
      setActiveItem(item.name);
      nextCarouselIndex.current =
        (nextCarouselIndex.current + 1) % INTERACTIVE_ITEMS.length;
      startCarousel(MOBILE_CAROUSEL_STEP_MS);
    }, delay);
  }, [progress]);

  useEffect(() => {
    if (progress < 1 || !isMobileInteraction()) {
      clearTimers();
      setActiveItem(null);
      return;
    }

    clearTimers();
    nextCarouselIndex.current = 0;
    startCarousel(0);

    return clearTimers;
  }, [clearTimers, progress, startCarousel]);

  const showTouchLabel = (name: string) => {
    if (progress < 1 || !isMobileInteraction()) return;

    clearTimers();
    const touchedIndex = INTERACTIVE_ITEMS.findIndex((item) => item.name === name);
    if (touchedIndex >= 0) {
      nextCarouselIndex.current = (touchedIndex + 1) % INTERACTIVE_ITEMS.length;
    }
    setActiveItem(name);
    touchHoldTimer.current = window.setTimeout(() => {
      touchHoldTimer.current = null;
      startCarousel(0);
    }, MOBILE_TOUCH_HOLD_MS);
  };

  return (
    <>
      <div
        /* Start floating only after the reveal completes. */
      className={`${styles.world}${progress >= 1 ? ` ${styles.floating}` : ''}`}
      style={{ '--open': progress } as React.CSSProperties}
      aria-hidden="true"
    >
      <span
        className={styles.touchDismiss}
        onPointerDown={() => {
          if (!isMobileInteraction()) return;
        }}
      />
      {ITEMS.map((item, index) => {
        const [left, top, width, height] = item.box;
        const [imageWidth, imageHeight] = item.size;
        const gatherX = GATHER_POINT[0] - (left + width / 2);
        const gatherY = GATHER_POINT[1] - (top + height / 2);
        const interactive = 'hitArea' in item;
        return (
          <div
            key={item.name}
            data-item={item.name}
            data-active={activeItem === item.name ? 'true' : undefined}
            className={`${styles.itemFrame}${interactive ? ` ${styles.interactive}` : ''}`}
            style={
              {
                '--left': `${left}%`,
                '--top': `${top}%`,
                '--width': `${width}%`,
                '--height': `${height}%`,
                '--z': index + 1,
                '--i': index,
                '--depth': (index % 3) + 1,
                '--wave-order': interactive ? item.waveOrder : 0,
                '--gather-x': `${gatherX}cqw`,
                '--gather-y': `${gatherY}cqh`,
                '--hit-area': interactive ? item.hitArea : undefined,
              } as React.CSSProperties
            }
          >
            <div className={styles.floatLayer}>
              <div className={styles.waveLayer}>
                <picture>
                  <source
                    type="image/avif"
                    srcSet={`/profile/7-items-cropped/${item.name}.avif`}
                  />
                  <img
                    src={`/profile/7-items-cropped/${item.name}.webp`}
                    alt=""
                    width={imageWidth}
                    height={imageHeight}
                    decoding="async"
                    className={styles.item}
                  />
                </picture>
              </div>
            </div>
            {interactive && (
              <span
                className={styles.hitArea}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  showTouchLabel(item.name);
                }}
              />
            )}
          </div>
        );
        })}
      </div>
      <div className={styles.capsuleLayer}>
        {ITEMS.map((item) =>
          'label' in item ? (
            <span
              className={styles.capsule}
              data-for={item.name}
              data-active={activeItem === item.name ? 'true' : undefined}
              key={item.name}
              style={
                {
                  '--capsule-x': `${item.capsule[0]}%`,
                  '--capsule-y': `${item.capsule[1]}%`,
                  '--capsule-rotate': `${item.capsule[2]}deg`,
                } as React.CSSProperties
              }
            >
              {item.label}
            </span>
          ) : null,
        )}
      </div>
    </>
  );
}
