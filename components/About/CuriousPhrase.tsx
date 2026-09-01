'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import styles from './About.module.css';

export default function CuriousPhrase() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);

  const moveHeart = useCallback((event: PointerEvent<HTMLSpanElement>) => {
    const clientX = event.clientX;
    const clientY = event.clientY;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      const edgeX = Math.min(rect.width / 2, Math.max(44, rect.height * 0.72));
      const x = Math.min(rect.width - edgeX, Math.max(edgeX, clientX - rect.left));
      const y = Math.min(rect.height, Math.max(0, clientY - rect.top));

      host.style.setProperty('--heart-x', `${x}px`);
      host.style.setProperty('--heart-y', `${y}px`);
    });
  }, []);

  return (
    <span
      ref={hostRef}
      className={styles.curious}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.active = 'true';
        moveHeart(event);
      }}
      onPointerMove={moveHeart}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.active = 'false';
      }}
    >
      「空间 · 技术与新世界」
      <picture aria-hidden="true">
        <source type="image/avif" srcSet="/profile/7-items-cropped/heart-clean.avif" />
        <img
          src="/profile/7-items-cropped/heart-clean.webp"
          alt=""
          className={styles.heart}
          width={320}
          height={274}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </span>
  );
}
