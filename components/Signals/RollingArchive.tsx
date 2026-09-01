'use client';

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import styles from './SignalsPage.module.css';

type ArchiveItem = { id: string; width: number; height: number };

const ROWS: ArchiveItem[][] = [
  [
    { id: '1-1', width: 1491, height: 1055 }, { id: '1-2', width: 4961, height: 3508 },
    { id: '1-3', width: 1491, height: 1055 }, { id: '1-4', width: 4961, height: 3508 },
    { id: '1-5', width: 1491, height: 1055 }, { id: '1-6', width: 14030, height: 9920 },
    { id: '1-7', width: 4961, height: 3508 },
  ],
  [
    { id: '3-1', width: 7016, height: 4114 }, { id: '3-2', width: 4695, height: 7016 },
    { id: '3-3', width: 1137, height: 1383 }, { id: '3-4', width: 3780, height: 2126 },
    { id: '3-5', width: 2632, height: 3937 }, { id: '3-6', width: 1024, height: 1535 },
    { id: '3-7', width: 1168, height: 2131 },
  ],
  [
    { id: '4-1', width: 6988, height: 9054 }, { id: '4-2', width: 14049, height: 9134 },
    { id: '4-3', width: 9412, height: 6367 }, { id: '4-4', width: 3780, height: 2126 },
    { id: '4-5', width: 1024, height: 1536 }, { id: '4-6', width: 3780, height: 2126 },
    { id: '4-7', width: 1492, height: 2126 }, { id: '4-8', width: 3780, height: 2126 },
  ],
];

function ArchiveImage({ item }: { item: ArchiveItem }) {
  const root = `/portfolio/signals/rolling-archive/${item.id}`;
  return (
    <picture className={styles.archivePicture}>
      <source type="image/avif" srcSet={`${root}-480.avif 480w, ${root}-800.avif 800w, ${root}-1200.avif 1200w`} sizes="(max-width: 767px) 44vw, 28vw" />
      <source type="image/webp" srcSet={`${root}-480.webp 480w, ${root}-800.webp 800w, ${root}-1200.webp 1200w`} sizes="(max-width: 767px) 44vw, 28vw" />
      <img src={`${root}-800.webp`} alt={`Rolling Archive ${item.id}`} width={item.width} height={item.height} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

function ArchiveRow({ items, reverse, index }: { items: ArchiveItem[]; reverse: boolean; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, time: 0, offset: 0, animationX: 0, velocity: 0, frame: 0 });

  useEffect(() => {
    const track = trackRef.current;
    const sequence = sequenceRef.current;
    if (!track || !sequence) return;
    const measure = () => {
      const seconds = Math.max(24, sequence.scrollWidth / 58) / 0.85;
      track.style.setProperty('--archive-duration', `${seconds}s`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sequence);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(dragRef.current.frame);
    };
  }, []);

  const applyDragOffset = () => {
    const track = trackRef.current;
    const sequenceWidth = sequenceRef.current?.scrollWidth ?? 0;
    const drag = dragRef.current;
    if (!track) return;
    if (sequenceWidth > 0) {
      const combined = drag.animationX + drag.offset;
      const wrapped = ((combined % sequenceWidth) + sequenceWidth) % sequenceWidth - sequenceWidth;
      drag.offset = wrapped - drag.animationX;
    }
    track.style.setProperty('translate', `${drag.offset}px 0`);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!row || !track || !drag.active) return;
    drag.active = false;
    if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
    const coast = () => {
      drag.velocity *= 0.94;
      drag.offset += drag.velocity * 16;
      applyDragOffset();
      if (Math.abs(drag.velocity) > 0.025) {
        drag.frame = requestAnimationFrame(coast);
        return;
      }
      applyDragOffset();
      delete row.dataset.dragging;
    };
    drag.frame = requestAnimationFrame(coast);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track) return;
    const drag = dragRef.current;
    cancelAnimationFrame(drag.frame);
    drag.active = true;
    drag.x = event.clientX;
    drag.time = performance.now();
    drag.velocity = 0;
    row.dataset.dragging = 'true';
    const transform = getComputedStyle(track).transform;
    drag.animationX = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
    row.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = performance.now();
    const dx = event.clientX - drag.x;
    const dt = Math.max(8, now - drag.time);
    drag.offset += dx;
    drag.velocity = drag.velocity * 0.65 + (dx / dt) * 0.35;
    drag.x = event.clientX;
    drag.time = now;
    applyDragOffset();
  };

  return (
    <div
      ref={rowRef}
      className={styles.archiveRow}
      aria-label={`Rolling Archive 第 ${index + 1} 行，可拖动浏览`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div
        ref={trackRef}
        className={styles.archiveTrack}
        data-direction={reverse ? 'reverse' : 'forward'}
        style={{ '--archive-duration': '40s' } as CSSProperties}
      >
        <div ref={sequenceRef} className={styles.archiveSequence}>
          {items.map((item) => <ArchiveImage key={item.id} item={item} />)}
        </div>
        <div className={styles.archiveSequence} aria-hidden="true">
          {items.map((item) => <ArchiveImage key={`copy-${item.id}`} item={item} />)}
        </div>
      </div>
    </div>
  );
}

export default function RollingArchive() {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let inRange = false;
    const syncPlayback = () => {
      gallery.dataset.active = String(inRange && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inRange = Boolean(entry?.isIntersecting);
      syncPlayback();
    }, { rootMargin: '35% 0px' });
    observer.observe(gallery);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  return (
    <div ref={galleryRef} className={styles.archiveGallery} data-active="false">
      {ROWS.map((items, index) => <ArchiveRow key={items[0].id} items={items} reverse={index === 1} index={index} />)}
    </div>
  );
}
