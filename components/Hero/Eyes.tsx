'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Eyes.module.css';

const SECTORS = [
  'right',
  'bottom-right-45',
  'bottom',
  'bottom-left-45',
  'left',
  'top-left-45',
  'top',
  'top-right-45',
] as const;

const INTRO_DIRECTIONS = [
  'top-left-45',
  'top-left-20',
  'top',
  'top-right-45',
  'right',
] as const;

const DEFAULT_DIR = 'right-ahead';
const INTRO_TRIGGER_PROGRESS = 0.1;
const POINTER_FOLLOW_DELAY_MS = 300;
const MOBILE_TAP_MAX_MOVE_PX = 12;
const MOBILE_GAZE_HOLD_MS = 800;
const EASTER_EGG_DIR = 'cross-eyed';
const CROSS_EYED_RADIUS = 0.12;

type Direction =
  | (typeof SECTORS)[number]
  | (typeof INTRO_DIRECTIONS)[number]
  | 'right-ahead'
  | typeof EASTER_EGG_DIR;

const PREPARE_DIRECTIONS: readonly Direction[] = [
  DEFAULT_DIR,
  ...INTRO_DIRECTIONS,
];

const DIRECTIONS: readonly Direction[] = [
  'right-ahead',
  ...SECTORS,
  EASTER_EGG_DIR,
];

const ALL_DIRECTIONS: readonly Direction[] = Array.from(
  new Set<Direction>([...PREPARE_DIRECTIONS, ...DIRECTIONS]),
);

interface EyesProps {
  progress: number;
  onPrepared: () => void;
}

export default function Eyes({ progress, onPrepared }: EyesProps) {
  const [activeDir, setActiveDir] = useState<Direction>(DEFAULT_DIR);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const decodeDirection = async (dir: Direction) => {
      for (const extension of ['avif', 'webp'] as const) {
        const image = new Image();
        image.decoding = 'async';
        image.src = `/profile/avatar/eye-${dir}.${extension}`;
        try {
          await image.decode();
          return;
        } catch {
          // Try the fallback format.
        }
      }
      throw new Error(`Unable to decode eye direction: ${dir}`);
    };

    // Decode every desktop-follow and intro frame before the portrait is marked
    // ready. This keeps the currently painted eye visible until any requested
    // direction can be swapped in immediately, including on a cold cache.
    void Promise.all(ALL_DIRECTIONS.map(decodeDirection))
      .then(() => {
        if (cancelled) return;
        onPrepared();
      })
      .catch((error) => {
        if (!cancelled) console.warn('[hero] Eye intro preload failed.', error);
      });

    return () => {
      cancelled = true;
    };
  }, [onPrepared]);

  const requestDirection = useCallback((dir: Direction) => {
    setActiveDir((current) => current === dir ? current : dir);
  }, []);

  useEffect(() => {
    if (progress >= 1) {
      requestDirection(DEFAULT_DIR);
      return;
    }

    if (progress <= INTRO_TRIGGER_PROGRESS) {
      requestDirection(DEFAULT_DIR);
      return;
    }

    const index = Math.min(
      INTRO_DIRECTIONS.length - 1,
      Math.floor(progress * INTRO_DIRECTIONS.length),
    );
    requestDirection(INTRO_DIRECTIONS[index]);
  }, [progress, requestDirection]);

  useEffect(() => {
    if (progress < 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let returnTimer = 0;

    const requestDirectionForPoint = (clientX: number, clientY: number) => {
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;

      if (Math.hypot(dx, dy) < rect.width * CROSS_EYED_RADIUS) {
        requestDirection(EASTER_EGG_DIR);
        return;
      }

      const angle = Math.atan2(dy, dx);
      const turns = (angle / (Math.PI * 2) + 1) % 1;
      const sector = Math.round(turns * 8) % 8;
      requestDirection(SECTORS[sector]);
    };

    const usesTouchInteraction = window.matchMedia(
      '(hover: none), (pointer: coarse)',
    ).matches;

    if (usesTouchInteraction) {
      const interactionSurface = hostRef.current?.parentElement;
      if (!interactionSurface) return;

      let tapStart: { pointerId: number; x: number; y: number } | null = null;

      const onPointerDown = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        tapStart = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!tapStart || tapStart.pointerId !== event.pointerId) return;

        const distance = Math.hypot(
          event.clientX - tapStart.x,
          event.clientY - tapStart.y,
        );
        tapStart = null;
        if (distance > MOBILE_TAP_MAX_MOVE_PX) return;

        requestDirectionForPoint(event.clientX, event.clientY);
        window.clearTimeout(returnTimer);
        returnTimer = window.setTimeout(() => {
          requestDirection(DEFAULT_DIR);
        }, MOBILE_GAZE_HOLD_MS);
      };

      const onPointerCancel = () => {
        tapStart = null;
      };

      interactionSurface.addEventListener('pointerdown', onPointerDown, {
        passive: true,
        capture: true,
      });
      interactionSurface.addEventListener('pointerup', onPointerUp, {
        passive: true,
        capture: true,
      });
      interactionSurface.addEventListener('pointercancel', onPointerCancel, {
        passive: true,
        capture: true,
      });

      return () => {
        window.clearTimeout(returnTimer);
        interactionSurface.removeEventListener('pointerdown', onPointerDown, true);
        interactionSurface.removeEventListener('pointerup', onPointerUp, true);
        interactionSurface.removeEventListener('pointercancel', onPointerCancel, true);
      };
    }

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        requestDirectionForPoint(event.clientX, event.clientY);
      });
    };

    const followTimer = window.setTimeout(() => {
      window.addEventListener('pointermove', onMove, { passive: true });
    }, POINTER_FOLLOW_DELAY_MS);

    return () => {
      window.clearTimeout(followTimer);
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [progress, requestDirection]);

  return (
    <div ref={hostRef} className={styles.eyes} aria-hidden="true">
      {ALL_DIRECTIONS.map((dir) => (
        <picture
          className={styles.frame}
          data-active={activeDir === dir}
          key={dir}
        >
          <source
            type="image/avif"
            srcSet={`/profile/avatar/eye-${dir}.avif`}
          />
          <img
            src={`/profile/avatar/eye-${dir}.webp`}
            alt=""
            width={1068}
            height={1213}
            loading="eager"
            fetchPriority={dir === DEFAULT_DIR ? 'high' : 'auto'}
            decoding="async"
            className={styles.slice}
          />
        </picture>
      ))}
    </div>
  );
}
