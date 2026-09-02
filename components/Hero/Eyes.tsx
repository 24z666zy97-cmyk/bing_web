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

type ReadyFrame = { image: HTMLImageElement; fail: () => void };

function EyeFrame({ dir, active, onReady }: {
  dir: Direction;
  active: boolean;
  onReady: (dir: Direction, frame: ReadyFrame | null) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    let cancelled = false;
    let decoding = false;
    let failed = false;
    const fail = () => {
      if (cancelled || failed) return;
      failed = true;
      onReady(dir, null);
      if (!fallback) setFallback(true);
      else console.warn(`[hero] Eye image unavailable: ${dir}`);
    };
    const decode = async () => {
      if (cancelled || failed || decoding) return;
      decoding = true;
      try {
        await image.decode();
        if (!cancelled && !failed && image.naturalWidth > 0) {
          onReady(dir, { image, fail });
        }
      } catch {
        fail();
      } finally {
        decoding = false;
      }
    };
    image.addEventListener('load', decode);
    image.addEventListener('error', fail);
    // Covers cached images whose load event fired before the effect attached.
    if (image.complete) {
      if (image.naturalWidth > 0) void decode();
      else fail();
    }
    return () => {
      cancelled = true;
      image.removeEventListener('load', decode);
      image.removeEventListener('error', fail);
      onReady(dir, null);
    };
  }, [dir, fallback, onReady]);

  return (
    <picture className={styles.frame} data-active={active}>
      {!fallback && (
        <source type="image/avif" srcSet={`/profile/avatar/eye-${dir}.avif`} />
      )}
      <img
        key={fallback ? 'webp' : 'preferred'}
        ref={imageRef}
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
  );
}

export default function Eyes({ progress, onPrepared }: EyesProps) {
  const [activeDir, setActiveDir] = useState<Direction | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const readyFrames = useRef(new Map<Direction, ReadyFrame>());
  const requestedDir = useRef<Direction>(DEFAULT_DIR);
  const requestVersion = useRef(0);
  const [prepared, setPrepared] = useState(false);

  const requestDirection = useCallback((dir: Direction) => {
    requestedDir.current = dir;
    const version = ++requestVersion.current;
    const frame = readyFrames.current.get(dir);
    if (!frame) return; // Keep the last successfully displayed direction.
    // Decode the actual displayed node, not a detached preloader. Recheck on
    // each request, and never let a slow earlier request override a later one.
    void frame.image.decode().then(() => {
      if (version !== requestVersion.current || readyFrames.current.get(dir) !== frame) return;
      if (frame.image.naturalWidth > 0) setActiveDir(dir);
    }).catch(frame.fail);
  }, []);

  const markFrameReady = useCallback((dir: Direction, frame: ReadyFrame | null) => {
    if (!frame) {
      readyFrames.current.delete(dir);
      return;
    }
    readyFrames.current.set(dir, frame);
    // A decoded frame can fill the sockets while the preferred one is pending.
    setActiveDir((current) => current ?? dir);
    if (requestedDir.current === dir) requestDirection(dir);
    if (readyFrames.current.size === ALL_DIRECTIONS.length) setPrepared(true);
  }, [requestDirection]);

  useEffect(() => {
    if (prepared) onPrepared();
  }, [prepared, onPrepared]);

  useEffect(() => () => { ++requestVersion.current; }, []);

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
        <EyeFrame
          key={dir}
          dir={dir}
          active={activeDir === dir}
          onReady={markFrameReady}
        />
      ))}
    </div>
  );
}
