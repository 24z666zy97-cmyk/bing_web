'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { useNavState } from '@/lib/useNavState';
import { smoothScrollToTop } from '@/lib/scroll-to-top';
import ContactPanel from './ContactPanel';
import styles from './Nav.module.css';

/** 整张卷起进度超过这个值，Indicator 才开始接收交互（content.md:130） */
const INDICATOR_INTERACTIVE_AT = 0.15;
const NAV_DOCK_END = 0.375;

interface NavProps {
  /** Content 覆盖层是否打开。打开时菜单图标变叉号。 */
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  /**
   * Indicator 的行为。首页留空 = 滚回页顶；子页传 '/' = 链回首页
   * （子页滚到顶没有意义，用户要的是离开这一页）。
   */
  indicatorHref?: string;
}

export default function Nav({
  menuOpen = false,
  onMenuToggle,
  indicatorHref,
}: NavProps) {
  const { stage, curlProgress } = useNavState();
  const [contactOpen, setContactOpen] = useState(false);
  const contactButtonRef = useRef<HTMLButtonElement>(null);

  const closeContact = useCallback(() => setContactOpen(false), []);

  /* 菜单与 CONTACT：局部撕开完成后出现 */
  const clusterVisible = stage === 'torn';

  /* Indicator：只在整张卷起阶段随进度淡入 */
  const dockProgress = Math.min(1, Math.max(0, curlProgress / NAV_DOCK_END));
  /* Content 打开时统一使用导航的最终停靠布局；关闭后继续跟随 Hero 进度。 */
  const visibleDockProgress = menuOpen ? 1 : dockProgress;
  /* Mobile backdrop waits until the hero name has started leaving, so it does
   * not mask the title during the opening composition. */
  const backdropProgress = menuOpen
    ? 1
    : Math.min(1, Math.max(0, (visibleDockProgress - 0.45) / 0.55));
  const indicatorActive = menuOpen || dockProgress > INDICATOR_INTERACTIVE_AT;

  const scrollToTop = useCallback(() => {
    smoothScrollToTop();
  }, []);

  const closeMenuAndScrollToTop = useCallback(() => {
    onMenuToggle?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => smoothScrollToTop());
    });
  }, [onMenuToggle]);

  return (
    <>
      <nav
        className={styles.dock}
        aria-label="主导航"
        style={{ '--nav-backdrop-progress': backdropProgress } as React.CSSProperties}
      >
        {/* 左上角身份标识。始终渲染，用 opacity 跟随卷起进度，
          * 这样淡入淡出是连续的而不是突然出现。 */}
        {indicatorHref ? (
        <Link
          href={indicatorHref}
          className={styles.indicator}
          style={
            {
              opacity: visibleDockProgress,
              '--indicator-progress': visibleDockProgress,
            } as React.CSSProperties
          }
          onClick={(event) => {
            if (!menuOpen) return;
            event.preventDefault();
            onMenuToggle?.();
          }}
          aria-label="返回首页"
        >
          Zhang Yubing
        </Link>
        ) : (
        <button
          type="button"
          className={styles.indicator}
          style={
            {
              opacity: visibleDockProgress,
              '--indicator-progress': visibleDockProgress,
            } as React.CSSProperties
          }
          onClick={menuOpen ? closeMenuAndScrollToTop : scrollToTop}
          /* 未到阈值时不可聚焦也不响应点击，避免看不见的按钮抢焦点 */
          tabIndex={indicatorActive ? 0 : -1}
          aria-hidden={!indicatorActive}
          disabled={!indicatorActive}
          aria-label={menuOpen ? '返回当前页面' : '回到页面顶部'}
        >
          Zhang Yubing
        </button>
        )}

        <div
          className={styles.cluster}
          data-visible={clusterVisible}
          style={{ '--nav-dock-progress': visibleDockProgress } as React.CSSProperties}
        >
          <button
            type="button"
            className={`${styles.button} ${styles.menuButton}`}
            onClick={onMenuToggle}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? '关闭内容导览' : '打开内容导览'}
            tabIndex={clusterVisible ? 0 : -1}
          >
            <span className={styles.menuIcon} aria-hidden="true" />
          </button>

          <button
            ref={contactButtonRef}
            type="button"
            className={`${styles.button} ${styles.contactButton}`}
            onClick={() => setContactOpen(true)}
            aria-expanded={contactOpen}
            tabIndex={clusterVisible ? 0 : -1}
          >
            Contact
          </button>
        </div>
      </nav>

      <ContactPanel
        open={contactOpen}
        onClose={closeContact}
        anchorRef={contactButtonRef}
      />
    </>
  );
}
