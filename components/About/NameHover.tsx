'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import styles from './About.module.css';

export default function NameHover() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);

  const movePortrait = useCallback((event: PointerEvent<HTMLSpanElement>) => {
    const clientX = event.clientX;
    const clientY = event.clientY;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      const edgeX = Math.min(rect.width / 2, Math.max(36, rect.height * 0.62));
      const x = Math.min(rect.width - edgeX, Math.max(edgeX, clientX - rect.left));
      const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
      host.style.setProperty('--portrait-x', `${x}px`);
      host.style.setProperty('--portrait-y', `${y}px`);
    });
  }, []);

  return (
    <span
      ref={hostRef}
      className={styles.name}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.active = 'true';
        movePortrait(event);
      }}
      onPointerMove={movePortrait}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.active = 'false';
      }}
    >
      张雨冰
      <picture aria-hidden="true">
        <source
          type="image/avif"
          srcSet="/profile/avatar/name-hover-laugh-320w.avif 320w, /profile/avatar/name-hover-laugh-640w.avif 640w"
          sizes="240px"
        />
        <source
          type="image/webp"
          srcSet="/profile/avatar/name-hover-laugh-320w.webp 320w, /profile/avatar/name-hover-laugh-640w.webp 640w"
          sizes="240px"
        />
        <img
          className={styles.namePortrait}
          src="/profile/avatar/name-hover-laugh-320w.webp"
          alt=""
          width={320}
          height={400}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </span>
  );
}
