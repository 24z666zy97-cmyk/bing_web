'use client';

import { useEffect, useRef, useState } from 'react';
import { lockScroll } from '@/lib/scroll-lock';
import ContentList from './ContentList';
import styles from './ContentSection.module.css';

/** 三种形态（content.md §1、requirements.md §3）
 *   inline   首页最后一屏，跟随文档流
 *   overlay  下拉菜单向下切出的全屏覆盖层
 *   footer   四个子页的页尾，用于子页互跳
 */
export type ContentVariant = 'inline' | 'overlay' | 'footer';

interface ContentSectionProps {
  variant?: ContentVariant;
  /** 内联/覆盖层形态的装饰肖像；默认沿用 shack-face。 */
  portrait?: 'shack-face' | 'sad-face';
  /** 肖像气泡文案。 */
  bubbleText?: string;
  /** overlay 形态的开合状态 */
  open?: boolean;
  /** overlay 形态请求关闭（点击列表跳转前先收起） */
  onClose?: () => void;
  /** footer 形态用：隐藏当前所在分类 */
  excludeHref?: string;
}

export default function ContentSection({
  variant = 'inline',
  portrait = 'shack-face',
  bubbleText = '接下来看点儿啥？',
  open = false,
  onClose,
  excludeHref,
}: ContentSectionProps) {
  const isOverlay = variant === 'overlay';
  const isFooter = variant === 'footer';
  const sectionRef = useRef<HTMLElement>(null);
  const [portraitEntered, setPortraitEntered] = useState(false);

  useEffect(() => {
    if (isOverlay || isFooter || portraitEntered || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPortraitEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isOverlay, isFooter, portraitEntered]);

  /* 覆盖层打开时锁滚动。用计数式滚动锁，避免和 Loading、局部撕纸互相解锁。 */
  useEffect(() => {
    if (!isOverlay || !open) return;
    const unlock = lockScroll('content-overlay');
    return unlock;
  }, [isOverlay, open]);

  /* Esc 关闭覆盖层 */
  useEffect(() => {
    if (!isOverlay || !open || !onClose) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOverlay, open, onClose]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles[variant]}`}
      data-open={isOverlay ? String(open) : undefined}
      data-portrait-entered={portraitEntered ? 'true' : undefined}
      /* 覆盖层收起时整体移出无障碍树，避免读屏读到隐藏内容 */
      aria-hidden={isOverlay && !open ? 'true' : undefined}
      id={variant === 'inline' ? 'content' : undefined}
    >
      {/* 页尾形态不重复出现肖像与气泡（content.md §3） */}
      {!isFooter && (
        <div className={styles.portraitArea}>
          <div className={styles.bubble}>
            <picture>
              <source type="image/avif" srcSet="/profile/tornpaper/bubble.avif" />
              <img className={styles.bubbleShape} src="/profile/tornpaper/bubble.webp" alt="" aria-hidden="true" />
            </picture>
            <span className={styles.bubbleText}>{bubbleText}</span>
          </div>

          {/* 装饰性肖像，读屏跳过。与整张卷起共用资产，此处是独立装饰实例。 */}
          <picture>
            <source type="image/avif" srcSet={`/profile/avatar/${portrait}.avif`} />
            <img
              className={styles.portrait}
              src={`/profile/avatar/${portrait}.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      )}

      <div className={styles.listArea}>
        <ContentList excludeHref={excludeHref} onNavigate={onClose} />
      </div>

      {/* 版权与致谢：低权重纯文字，禁止链接或任何点击行为（content.md §10） */}
      <div className={styles.colophon}>
        <span>© Ruby 2026</span>
        <span>Page design reference thanks to Trevor Noah</span>
      </div>
    </section>
  );
}
