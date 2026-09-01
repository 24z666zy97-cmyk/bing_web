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

interface EyeFrame {
  dir: Direction;
  revision: number;
}

interface EyesProps {
  progress: number;
  onPrepared: () => void;
}

export default function Eyes({ progress, onPrepared }: EyesProps) {
  const [frames, setFrames] = useState<[EyeFrame, EyeFrame]>([
    { dir: DEFAULT_DIR, revision: 0 },
    { dir: DEFAULT_DIR, revision: -1 },
  ]);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeFrameRef = useRef<0 | 1>(0);
  const displayedDirRef = useRef<Direction>(DEFAULT_DIR);
  const requestedDirRef = useRef<Direction>(DEFAULT_DIR);
  const revisionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const preloaders: HTMLImageElement[] = [];

    const decodeDirection = async (dir: Direction) => {
      for (const extension of ['avif', 'webp'] as const) {
        const image = new Image();
        image.decoding = 'async';
        image.src = `/profile/avatar/eye-${dir}.${extension}`;
        preloaders.push(image);
        try {
          await image.decode();
          return;
        } catch {
          // Try the fallback format.
        }
      }
      throw new Error(`Unable to decode eye direction: ${dir}`);
    };

    void Promise.all(PREPARE_DIRECTIONS.map(decodeDirection))
      .then(() => {
        if (cancelled) return;
        onPrepared();

        const preparedSet = new Set<Direction>(PREPARE_DIRECTIONS);
        const remaining = DIRECTIONS.filter((dir) => !preparedSet.has(dir));
        void Promise.allSettled(remaining.map(decodeDirection));
      })
      .catch((error) => {
        if (!cancelled) console.warn('[hero] Eye intro preload failed.', error);
      });

    return () => {
      cancelled = true;
      preloaders.forEach((image) => {
        image.src = '';
      });
    };
  }, [onPrepared]);

  const requestDirection = useCallback((dir: Direction) => {
    if (dir === requestedDirRef.current) return;
    requestedDirRef.current = dir;

    if (dir === displayedDirRef.current) {
      revisionRef.current += 1;
      return;
    }

    const nextFrame = activeFrameRef.current === 0 ? 1 : 0;
    const revision = ++revisionRef.current;
    setFrames((current) => {
      const updated: [EyeFrame, EyeFrame] = [...current];
      updated[nextFrame] = { dir, revision };
      return updated;
    });
  }, []);

  const showLoadedFrame = useCallback(
    (frameIndex: 0 | 1, frame: EyeFrame) => {
      if (
        frame.dir !== requestedDirRef.current ||
        frame.revision !== revisionRef.current
      ) {
        return;
      }

      // Let the decoded image reach a paint before hiding the previous frame.
      requestAnimationFrame(() => {
        if (
          frame.dir !== requestedDirRef.current ||
          frame.revision !== revisionRef.current
        ) {
          return;
        }
        activeFrameRef.current = frameIndex;
        displayedDirRef.current = frame.dir;
        setActiveFrame(frameIndex);
      });
    },
    [],
  );

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

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const host = hostRef.current;
        if (!host) return;

        const rect = host.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;

        if (Math.hypot(dx, dy) < rect.width * CROSS_EYED_RADIUS) {
          requestDirection(EASTER_EGG_DIR);
          return;
        }

        const angle = Math.atan2(dy, dx);
        const turns = (angle / (Math.PI * 2) + 1) % 1;
        const sector = Math.round(turns * 8) % 8;
        requestDirection(SECTORS[sector]);
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
      {frames.map((frame, index) => (
        <picture
          className={styles.frame}
          data-active={activeFrame === index}
          key={`${index}-${frame.dir}-${frame.revision}`}
        >
          <source
            type="image/avif"
            srcSet={`/profile/avatar/eye-${frame.dir}.avif`}
          />
          <img
            src={`/profile/avatar/eye-${frame.dir}.webp`}
            alt=""
            width={1068}
            height={1213}
            loading="eager"
            fetchPriority={frame.dir === DEFAULT_DIR ? 'high' : 'auto'}
            decoding="async"
            className={styles.slice}
            onLoad={() => showLoadedFrame(index as 0 | 1, frame)}
          />
        </picture>
      ))}
    </div>
  );
}
