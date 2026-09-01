'use client';

import type { CSSProperties, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './ContactPanel.module.css';

const EMAIL = '13348859093@163.com';
const PHONE = '13348859093';

/** 复制成功提示保留多久 */
const COPIED_FEEDBACK_MS = 1600;

interface ContactPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

export default function ContactPanel({ open, onClose, anchorRef }: ContactPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  /* 挂载和「滑到位」必须分成两帧：同一帧内设置起始态和结束态，
   * 浏览器只会看到结束态，过渡不播放。 */
  const [entered, setEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /* 关闭后要把焦点还给触发它的按钮，否则键盘用户会掉到页面顶部 */
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [anchorStyle, setAnchorStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;

    const syncAnchor = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setAnchorStyle({
        top: `${rect.bottom + 12}px`,
        right: `${Math.max(0, window.innerWidth - rect.right)}px`,
      });
    };

    syncAnchor();
    window.addEventListener('resize', syncAnchor);
    window.addEventListener('scroll', syncAnchor, true);
    return () => {
      window.removeEventListener('resize', syncAnchor);
      window.removeEventListener('scroll', syncAnchor, true);
    };
  }, [open, anchorRef]);

  /* ESC 关闭 + 锁滚动 + 焦点管理 */
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    /* 面板滑入后再聚焦，立刻聚焦会让浏览器把动画滚掉 */
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      /* 焦点陷阱：面板打开时 Tab 不应跑到后面的页面里去 */
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  /* 关闭时清掉复制提示，下次打开是干净状态 */
  useEffect(() => {
    if (!open) setCopiedField(null);
  }, [open]);

  /* 下一帧再置 entered，让面板从 translateY(-100%) 滑入 */
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const copy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => {
        /* 只清掉自己这次的提示。用户可能已经复制了另一个字段，
         * 无条件 setCopiedField(null) 会把后一次的提示提前抹掉。 */
        setCopiedField((current) => (current === field ? null : current));
      }, COPIED_FEEDBACK_MS);
    } catch {
      /* 剪贴板 API 需要安全上下文，http 或旧浏览器会拒绝。
       * 号码本身是可见的，用户可以手选复制，所以静默失败即可。 */
    }
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        data-open={entered}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={styles.panel}
        style={anchorStyle}
        data-open={entered}
        role="dialog"
        aria-modal="true"
        aria-label="联系方式"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭联系方式"
        >
          <span className={styles.closeIcon} aria-hidden="true" />
        </button>

        <div className={styles.inner}>
          <div className={styles.greeting}>
            <p className={styles.greetingEn}>You made it here.</p>
            <h2 className={styles.connectTitle}>
              Let&apos;s <span>connect.</span>
            </h2>
            <p className={styles.greetingZh} lang="zh-CN">
              你来啦，欢迎和我联系！
            </p>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.label}>Email</span>
              <div className={styles.valueRow}>
                <span className={styles.fieldIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 6.5h18v11H3z" />
                    <path d="m4 7 8 7 8-7" />
                  </svg>
                </span>
                <span className={styles.value}>{EMAIL}</span>
                <button
                  type="button"
                  className={styles.copyButton}
                  data-copied={copiedField === 'email'}
                  onClick={() => copy(EMAIL, 'email')}
                >
                  {copiedField === 'email' ? '已复制' : '复制'}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Phone</span>
              <div className={styles.valueRow}>
                <span className={styles.fieldIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7.2 3.5 4.5 5.8c.6 6.4 7.3 13.1 13.7 13.7l2.3-2.7-4.1-3-2 2c-2.7-1.1-5.1-3.5-6.2-6.2l2-2z" />
                  </svg>
                </span>
                {/* tel: 让移动端可直接拨号（内容稿要求） */}
                <a className={`${styles.value} ${styles.valueLink}`} href={`tel:${PHONE}`}>
                  {PHONE}
                </a>
                <button
                  type="button"
                  className={styles.copyButton}
                  data-copied={copiedField === 'phone'}
                  onClick={() => copy(PHONE, 'phone')}
                >
                  {copiedField === 'phone' ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
