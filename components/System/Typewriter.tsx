'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './SystemPage.module.css';

type TypewriterProps = {
  text: string;
  highlight?: string; // 全部打完后再变粉的子串（如「墨斗云」）
};

const TYPE_INTERVAL_MS = 45;

/** 中文打字机：进入视口后从左到右逐字出现，下划线光标跟随。
 *  支持 \n 换行：每行独立成行、各自从左到右打字，行本身居中显示；
 *  highlight 在整段打完后再淡入变粉。 */
export default function Typewriter({ text, highlight }: TypewriterProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let timer = 0;
    let played = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || played) return;
      played = true;
      observer.disconnect();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setCount(text.length);
        return;
      }
      let next = 0;
      timer = window.setInterval(() => {
        next += 1;
        setCount(next);
        if (next >= text.length) window.clearInterval(timer);
      }, TYPE_INTERVAL_MS);
    }, { threshold: 0.45 });
    observer.observe(host);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [text]);

  const done = count >= text.length;
  const lines = text.split(/\\n|\r?\n/);
  const mobileText = text.replace(/\\n|\r?\n/g, '');
  const mobileVisibleCount = text.slice(0, count).replace(/\\n|\r?\n/g, '').length;
  const mobileHighlightStart = highlight ? mobileText.indexOf(highlight) : -1;

  // 每行在整段文字里的起始下标（含换行符占位），用来换算每行已输入多少字
  const lineStart: number[] = [];
  let acc = 0;
  for (const line of lines) {
    lineStart.push(acc);
    acc += line.length + 1;
  }
  const lineEnd = lines.map((line, i) => lineStart[i] + line.length);
  const typedLengths = lines.map((line, i) =>
    Math.max(0, Math.min(count - lineStart[i], line.length)),
  );

  // 光标所在行：该行还没打完（或刚打完、换行符未输入）时停在该行
  let activeLine = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (count <= lineEnd[i]) {
      activeLine = i;
      break;
    }
  }

  const renderLine = (line: string): ReactNode => {
    if (!highlight) return line;
    const idx = line.indexOf(highlight);
    if (idx === -1) return line;
    const cls = done
      ? `${styles.typewriterHighlight} ${styles.typewriterHighlightOn}`
      : styles.typewriterHighlight;
    return (
      <>
        {line.slice(0, idx)}
        <span className={cls}>{highlight}</span>
        {line.slice(idx + highlight.length)}
      </>
    );
  };

  return (
    <span ref={hostRef} className={styles.typewriterHost} aria-hidden="true">
      <span className={styles.typewriterDesktop}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            <span className={styles.chapterChineseTrack}>
              <span className={styles.chapterChineseGhost}>{line}</span>
              <span className={styles.chapterChineseText}>
                {renderLine(line.slice(0, typedLengths[i]))}
                {i === activeLine && <span className={styles.typeCursor} />}
              </span>
            </span>
          </Fragment>
        ))}
      </span>

      <span className={styles.typewriterMobile}>
        <span className={styles.chapterChineseTrack}>
          <span className={styles.chapterChineseGhost}>{mobileText}</span>
          <span className={styles.chapterChineseText}>
            {mobileVisibleCount === 0 && <span className={styles.typeCursor} />}
            {Array.from(mobileText).map((char, index) => {
              const highlighted =
                mobileHighlightStart >= 0 &&
                index >= mobileHighlightStart &&
                index < mobileHighlightStart + (highlight?.length ?? 0);
              const charClass = highlighted
                ? done
                  ? `${styles.typewriterMobileChar} ${styles.typewriterHighlight} ${styles.typewriterHighlightOn}`
                  : `${styles.typewriterMobileChar} ${styles.typewriterHighlight}`
                : styles.typewriterMobileChar;

              return (
                <Fragment key={`${char}-${index}`}>
                  <span
                    className={charClass}
                    data-visible={index < mobileVisibleCount ? 'true' : undefined}
                  >
                    {char}
                  </span>
                  {index + 1 === mobileVisibleCount && <span className={styles.typeCursor} />}
                </Fragment>
              );
            })}
          </span>
        </span>
      </span>
    </span>
  );
}
