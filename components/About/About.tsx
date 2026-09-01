import Timeline from './Timeline';
import CuriousPhrase from './CuriousPhrase';
import LineReveal from './LineReveal';
import NameHover from './NameHover';
import TagMarquee from './TagMarquee';
import styles from './About.module.css';

/* 个人标签。前五项为桌面端第一排，其余为第二排；移动端按宽度重排。 */
const TAGS = [
  '01年',
  'ESFJ',
  'AI深度用户',
  'Design → AI',
  '超高网速冲浪中',
  '微微抽象:D',
  '水上运动专业户',
  '好看的一切收藏家',
  '不太能吃辣的成都人',
];

/**
 * About me —— 首页 Hero 之后的自我介绍区块。
 *
 * 全静态，无客户端状态：爱心 hover 和标签反馈都是纯 CSS，
 * 所以这里保持 server component，不占首屏 JS 预算。
 */
export default function About() {
  return (
    <section className={styles.section} aria-labelledby="about-heading">
      <header className={styles.chapter}>
        <picture className={styles.pageBreak} aria-hidden="true">
          <source type="image/avif" srcSet="/profile/stickers/page-break.avif" />
          <img
            src="/profile/stickers/page-break.webp"
            alt=""
            width={560}
            height={441}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <h2 className={styles.chapterTitle} id="about-heading">
          <LineReveal>About me</LineReveal>
          <span className={styles.chapterHalftone} aria-hidden="true">
            <span className={styles.chapterHalftoneDot}>About me</span>
          </span>
        </h2>
      </header>

      <p className={styles.hello}>
        <LineReveal>
          <span className={styles.helloLead}>Hello,</span> 我是
            <NameHover />
            <span className={styles.helloMark}>！</span>
        </LineReveal>
      </p>

      <TagMarquee tags={TAGS} />

      <div className={styles.portraitScene} aria-label="张雨冰的个人形象">
        <picture className={styles.brainDecoration} aria-hidden="true">
          <source type="image/avif" srcSet="/profile/7-items-cropped/brain.avif" />
          <img
            src="/profile/7-items-cropped/brain.webp"
            alt=""
            width={554}
            height={408}
            loading="lazy"
            decoding="async"
          />
        </picture>

        <picture className={styles.aboutPortrait}>
          <source
            type="image/avif"
            srcSet="/profile/avatar/about-me-1-640w.avif 640w, /profile/avatar/about-me-1.avif 748w"
            sizes="(max-width: 860px) 90vw, 48vw"
          />
          <source
            type="image/webp"
            srcSet="/profile/avatar/about-me-1-640w.webp 640w, /profile/avatar/about-me-1.webp 748w"
            sizes="(max-width: 860px) 90vw, 48vw"
          />
          <img
            src="/profile/avatar/about-me-1.webp"
            alt="张雨冰的照片"
            width={748}
            height={453}
            loading="lazy"
            decoding="async"
          />
        </picture>

        <picture className={styles.cloudDecoration} aria-hidden="true">
          <source type="image/avif" srcSet="/profile/7-items-cropped/cloud.avif" />
          <img
            src="/profile/7-items-cropped/cloud.webp"
            alt=""
            width={380}
            height={255}
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div className={styles.sceneBubble} aria-hidden="true">
          <picture>
            <source type="image/avif" srcSet="/profile/tornpaper/bubble.avif" />
            <img
              src="/profile/tornpaper/bubble.webp"
              alt=""
              width={520}
              height={218}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <span>What now?</span>
        </div>
      </div>

      <div className={styles.resumeActions} aria-label="简历操作">
        <a
          className={styles.resumeView}
          href="/profile/resume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          View Resume
        </a>
      </div>

      <h3 className={styles.opening}>
        <LineReveal className={styles.openingLine}>一个对</LineReveal>
        <LineReveal>
          <CuriousPhrase />
        </LineReveal>
        <LineReveal className={styles.openingLine}>保持好奇的人</LineReveal>
      </h3>

      <header className={`${styles.chapter} ${styles.pathChapter}`}>
        <picture className={styles.pageBreak} aria-hidden="true">
          <source type="image/avif" srcSet="/profile/stickers/page-break.avif" />
          <img
            src="/profile/stickers/page-break.webp"
            alt=""
            width={560}
            height={441}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <h3 className={styles.pathHeading}>
          <LineReveal>My Path</LineReveal>
          <span className={styles.chapterHalftone} aria-hidden="true">
            <span className={styles.chapterHalftoneDot}>My Path</span>
          </span>
        </h3>
      </header>

      <Timeline />
    </section>
  );
}
