'use client';

import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import styles from './SystemPage.module.css';

export type ChapterSticker = 'question-mark' | 'exclamation-mark' | 'thinkingface' | 'shack-face';

const stickerAssets: Record<ChapterSticker, { avif: string; webp: string; width: number; height: number }> = {
  'question-mark': {
    avif: '/profile/stickers/chapter-question-mark.avif',
    webp: '/profile/stickers/chapter-question-mark.webp',
    width: 138,
    height: 162,
  },
  'exclamation-mark': {
    avif: '/profile/stickers/chapter-exclamation-mark.avif',
    webp: '/profile/stickers/chapter-exclamation-mark.webp',
    width: 138,
    height: 240,
  },
  thinkingface: {
    avif: '/profile/stickers/chapter-thinkingface.avif',
    webp: '/profile/stickers/chapter-thinkingface.webp',
    width: 256,
    height: 320,
  },
  'shack-face': {
    avif: '/profile/stickers/chapter-shack-face.avif',
    webp: '/profile/stickers/chapter-shack-face.webp',
    width: 282,
    height: 320,
  },
};

type ChapterHoverStickerProps = {
  children: ReactNode;
  sticker: ChapterSticker;
};

export default function ChapterHoverSticker({ children, sticker }: ChapterHoverStickerProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const asset = stickerAssets[sticker];

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const moveSticker = useCallback((event: PointerEvent<HTMLSpanElement>) => {
    const { clientX, clientY } = event;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      const edgeX = Math.min(rect.width / 2, Math.max(44, rect.height * 0.72));
      const x = Math.min(rect.width - edgeX, Math.max(edgeX, clientX - rect.left));
      const y = Math.min(rect.height, Math.max(0, clientY - rect.top));

      host.style.setProperty('--chapter-sticker-x', `${x}px`);
      host.style.setProperty('--chapter-sticker-y', `${y}px`);
    });
  }, []);

  return (
    <span
      ref={hostRef}
      className={styles.chapterStickerHost}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.active = 'true';
        moveSticker(event);
      }}
      onPointerMove={moveSticker}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.active = 'false';
      }}
    >
      {children}
      <picture aria-hidden="true">
        <source type="image/avif" srcSet={asset.avif} />
        <img
          src={asset.webp}
          alt=""
          className={styles.chapterSticker}
          width={asset.width}
          height={asset.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </span>
  );
}
