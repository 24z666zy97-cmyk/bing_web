import { type ReactNode } from 'react';
import LineReveal from '@/components/About/LineReveal';
import ChapterHoverSticker, { type ChapterSticker } from './ChapterHoverSticker';
import Typewriter from './Typewriter';
import styles from './SystemPage.module.css';

type TypewriterOpeningProps = {
  english: ReactNode;
  chinese: string;
  children?: ReactNode;
  id?: string;
  className?: string;
  highlight?: string;
  sticker?: ChapterSticker;
};

export default function TypewriterOpening({ english, chinese, children, id, className, highlight, sticker }: TypewriterOpeningProps) {
  const chineseLine = (
    <p className={styles.chapterChinese} aria-label={chinese.replace(/\n/g, ' ')}>
      <Typewriter text={chinese} highlight={highlight} />
    </p>
  );

  return (
    <section id={id} className={`${styles.chapterOpening}${className ? ` ${className}` : ''}`}>
      <p className={styles.chapterEnglish}>
        {sticker ? (
          <LineReveal>
            <ChapterHoverSticker sticker={sticker}>{english}</ChapterHoverSticker>
          </LineReveal>
        ) : (
          <LineReveal>{english}</LineReveal>
        )}
      </p>
      {children ? <div className={styles.chapterCueGroup}>{chineseLine}{children}</div> : chineseLine}
    </section>
  );
}
