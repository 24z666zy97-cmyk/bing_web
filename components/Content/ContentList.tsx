'use client';

import Link from 'next/link';
import { type PointerEvent, useState } from 'react';
import { SECTIONS } from '@/lib/sections';
import styles from './ContentList.module.css';

interface ContentListProps {
  /** 子页页尾用：隐藏当前所在的分类，只列出其余三项（requirements.md §3） */
  excludeHref?: string;
  /** 覆盖层形态点击后要先关闭覆盖层再跳转 */
  onNavigate?: () => void;
}

export default function ContentList({ excludeHref, onNavigate }: ContentListProps) {
  /* 触摸按下时立即点亮中文激活态，同时保留 Link 的单击直达行为。
   * 如果手势被浏览器识别为滚动并取消点击，则撤销临时激活态。 */
  const [touched, setTouched] = useState<string | null>(null);

  const rows = excludeHref ? SECTIONS.filter((s) => s.href !== excludeHref) : SECTIONS;

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>, href: string) => {
    if (event.pointerType !== 'mouse') setTouched(href);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== 'mouse') setTouched(null);
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
          onPointerDown={(event) => handlePointerDown(event, section.href)}
          onPointerCancel={handlePointerCancel}
          onClick={onNavigate}
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
