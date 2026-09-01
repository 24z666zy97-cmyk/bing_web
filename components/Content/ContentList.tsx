'use client';

import Link from 'next/link';
import { type MouseEvent, useState } from 'react';
import { SECTIONS } from '@/lib/sections';
import styles from './ContentList.module.css';

interface ContentListProps {
  /** 子页页尾用：隐藏当前所在的分类，只列出其余三项（requirements.md §3） */
  excludeHref?: string;
  /** 覆盖层形态点击后要先关闭覆盖层再跳转 */
  onNavigate?: () => void;
}

export default function ContentList({ excludeHref, onNavigate }: ContentListProps) {
  /* 触摸设备没有 hover，用首次触摸点亮激活态，第二次才跳转会很别扭；
   * 这里只记录触摸位置让样式跟上，不拦截跳转本身。 */
  const [touched, setTouched] = useState<string | null>(null);

  const rows = excludeHref ? SECTIONS.filter((s) => s.href !== excludeHref) : SECTIONS;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const usesTapInteraction = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (usesTapInteraction && touched !== href) {
      event.preventDefault();
      setTouched(href);
      return;
    }

    onNavigate?.();
  };

  return (
    <nav className={styles.list} aria-label="内容导览">
      {rows.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={styles.row}
          data-section-num={section.num}
          data-active={touched === section.href ? 'true' : undefined}
          onClick={(event) => handleClick(event, section.href)}
        >
          <span className={styles.num} aria-hidden="true">
            {section.num}
          </span>

          <span className={styles.titleSlot}>
            <span className={styles.title}>{section.title}</span>
            {/* tagline 是标题的补充说明，读屏时一并读出，不设 aria-hidden */}
            <span className={styles.tagline}>{section.tagline}</span>
          </span>

          {/* 装饰性素材，读屏跳过。素材最大显示宽度约 170px，
            * 640w 版本已足够覆盖 2x DPR，不加载原图。 */}
          <picture className={styles.assetClip}>
            <source
              type="image/avif"
              srcSet={`/profile/7-items-cropped/${section.asset}.avif`}
            />
            <img
              className={styles.asset}
              src={`/profile/7-items-cropped/${section.asset}.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </Link>
      ))}
    </nav>
  );
}
