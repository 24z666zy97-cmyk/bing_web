import LineReveal from '@/components/About/LineReveal';
import ContentSection from '@/components/Content/ContentSection';
import Typewriter from '@/components/System/Typewriter';
import TypewriterOpening from '@/components/System/TypewriterOpening';
import ContinueScrollCue from '@/components/System/ContinueScrollCue';
import WorkflowCapabilitiesCard, { type Capability } from '@/components/System/WorkflowCapabilitiesCard';
import systemStyles from '@/components/System/SystemPage.module.css';
import GlassesScene from './GlassesScene';
import RollingArchive from './RollingArchive';
import styles from './SignalsPage.module.css';

const VISUAL_CAPABILITIES: Capability[][] = [
  [
    { id: 'visual-storytelling', icon: 'code', label: '视觉叙事' },
    { id: 'information-distillation', icon: 'search', label: '信息提炼' },
    { id: 'layout-design', icon: 'hierarchy', label: '版式设计' },
    { id: 'visual-hierarchy', icon: 'chart', label: '视觉层级' },
  ],
  [
    { id: 'data-visualization', icon: 'chart', label: '数据可视化' },
    { id: 'analytical-expression', icon: 'search', label: '分析表达' },
    { id: 'graphic-language', icon: 'code', label: '图形语言' },
    { id: 'information-design', icon: 'database', label: '信息图设计' },
  ],
  [
    { id: 'poster-design', icon: 'users', label: '海报设计' },
    { id: 'visual-experiments', icon: 'cpu', label: '视觉实验' },
    { id: 'content-communication', icon: 'cloud', label: '内容传播' },
    { id: 'style-exploration', icon: 'flash', label: '风格探索' },
  ],
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <header className={systemStyles.sectionHeading}>
      <picture className={systemStyles.pageBreak} aria-hidden="true">
        <source type="image/avif" srcSet="/profile/stickers/page-break.avif" />
        <img src="/profile/stickers/page-break.webp" alt="" width={560} height={441} loading="lazy" decoding="async" />
      </picture>
      <h2 className={systemStyles.sectionHeadingTitle}>
        <LineReveal>{children}</LineReveal>
        <span className={systemStyles.sectionHeadingHalftone} aria-hidden="true">
          <span className={systemStyles.sectionHeadingHalftoneDot}>{children}</span>
        </span>
      </h2>
    </header>
  );
}

export default function SignalsPageContent() {
  return (
    <main className={`${systemStyles.page} ${styles.page}`}>
      <section className={systemStyles.hero} aria-labelledby="signals-title">
        <div className={`${systemStyles.heroTitleGroup} ${styles.heroTitleGroup}`}>
          <h1 id="signals-title" className="srOnly">SIGNALS</h1>
          <span className={systemStyles.heroWord} data-signals-word aria-hidden="true">
            {'SIGNALS'.split('').map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}
          </span>
          <p className={systemStyles.heroSubtitle}>视觉语言 · 信息设计 · 公共传播</p>
        </div>
        <div className={`${systemStyles.heroTitleFront} ${styles.heroTitleFront}`} aria-hidden="true">
          <span className={`${systemStyles.heroWord} ${styles.heroWordMiddle}`}>
            {'SIGNALS'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} className={index === 3 || index === 4 ? styles.heroWordMiddleVisible : undefined}>
                {letter}
              </span>
            ))}
          </span>
        </div>
        <div className={`${systemStyles.heroModel} ${styles.heroModel}`}>
          <GlassesScene className={`${systemStyles.heroCanvas} ${styles.heroCanvas}`} />
        </div>
        <a className={systemStyles.scrollCue} href="#from-content-to-expression">
          <span className={systemStyles.scrollCueLabel}>我如何转译和传播多元信息</span>
          <span className={systemStyles.scrollIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </a>
      </section>

      <TypewriterOpening id="from-content-to-expression" english="From content to expression" chinese="内容如何被组织，并形成清晰、有节奏的视觉表达？" sticker="question-mark">
        <ContinueScrollCue targetId="signals-workflow-card" label="查看视觉表达实践" />
      </TypewriterOpening>

      <section id="signals-workflow-card" className={`${systemStyles.section} ${systemStyles.workflowCardSection}`}>
        <WorkflowCapabilitiesCard
          tagRows={VISUAL_CAPABILITIES}
          stageLabel="可拖动放大镜查看视觉表达能力"
          heading="SIGNALS · 视觉表达实践"
          metaLinks={[
            { label: 'POSTER', href: '#rolling-archive' },
            { label: 'VISUAL EXPERIMENTS', href: '#rolling-archive' },
            { label: 'DATA VISUALIZATION', href: '#rolling-archive' },
          ]}
          description={<>这里收集了我不同阶段的视觉表达实践，从<strong>海报、视觉实验到分析图与数据可视化</strong>，记录内容如何在不同媒介中被重新组织，并形成各自的表达方式。</>}
        />
      </section>

      <section className={systemStyles.section} aria-labelledby="rolling-archive-heading">
        <SectionHeading>Rolling Archive</SectionHeading>
        <div id="rolling-archive" className={styles.archiveSlot} data-content-slot="rolling-archive">
          <h3 id="rolling-archive-heading" className="srOnly">Rolling Archive 内容接口</h3>
          <RollingArchive />
        </div>
      </section>

      <section className={`${systemStyles.section} ${systemStyles.beyond}`}>
        <SectionHeading>Beyond Visual Expression</SectionHeading>
        <div className={systemStyles.beyondCopy}>
          <p className={systemStyles.beyondLead} aria-label="好的表达，不是堆砌形式，而是让信息更容易被看见、理解与记住。">
            <Typewriter text="好的表达，不是堆砌形式，而是让信息更容易被看见、理解与记住。" />
          </p>
          <div className={systemStyles.beyondColumns}>
            <article className={systemStyles.beyondColumn}>
              <h3>我逐渐意识到，<br />视觉表达并不是内容完成后的装饰，</h3>
              <p>而是对信息重新判断、<br />组织与取舍的过程。</p>
              <span className={systemStyles.beyondAccent} aria-hidden="true" />
            </article>
            <span className={systemStyles.beyondDivider} aria-hidden="true" />
            <article className={systemStyles.beyondColumn}>
              <h3>我希望持续建立三种能力：</h3>
              <ul>
                <li>提炼重点</li>
                <li>组织层级</li>
                <li>转译表达</li>
              </ul>
              <span className={systemStyles.beyondAccent} aria-hidden="true" />
            </article>
          </div>
        </div>
      </section>

      <ContentSection portrait="sad-face" bubbleText="现在就要走了吗？" />
    </main>
  );
}
