import LineReveal from '@/components/About/LineReveal';
import ContentSection from '@/components/Content/ContentSection';
import MolecularFormulaScene from './MolecularFormulaScene';
import ProductEcosystem from './ProductEcosystem';
import SystemThinking from './SystemThinking';
import Typewriter from './Typewriter';
import TypewriterOpening from './TypewriterOpening';
import WorkflowCapabilitiesCard from './WorkflowCapabilitiesCard';
import CaseShowcase from './CaseShowcase';
import ProductEcosystemNavigation from './ProductEcosystemNavigation';
import styles from './SystemPage.module.css';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.sectionHeading}>
      <picture className={styles.pageBreak} aria-hidden="true">
        <source type="image/avif" srcSet="/profile/stickers/page-break.avif" />
        <img src="/profile/stickers/page-break.webp" alt="" width={560} height={441} loading="lazy" decoding="async" />
      </picture>
      <h2 className={styles.sectionHeadingTitle}>
        <LineReveal>{children}</LineReveal>
        <span className={styles.sectionHeadingHalftone} aria-hidden="true">
          <span className={styles.sectionHeadingHalftoneDot}>{children}</span>
        </span>
      </h2>
    </header>
  );
}

export default function SystemPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="system-title">
        <div className={styles.heroTitleGroup}>
          <h1 id="system-title" className="srOnly">SYSTEM</h1>
          <span className={styles.heroWord} aria-hidden="true"><span>SYST</span><span>EM</span></span>
          <p className={styles.heroSubtitle}>产品体系 · 数据底座 · AI 工作流</p>
        </div>
        <div className={styles.heroModel}><MolecularFormulaScene /></div>
        <div className={styles.heroTitleFront} aria-hidden="true">
          <span className={styles.heroWord}><span className={styles.heroWordGhost}>SYST</span><span className={styles.heroFrontEm}>EM</span></span>
        </div>
        <a className={styles.scrollCue} href="#from-features-to-systems">
          <span className={styles.scrollCueLabel}>我如何组织与落地复杂产品</span>
          <span className={styles.scrollIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </a>
      </section>

      <TypewriterOpening
        id="from-features-to-systems"
        sticker="question-mark"
        english={
          <>
            <span>From Features</span>{' '}
            <span className={styles.chapterEnglishLine}>to Systems</span>
          </>
        }
        chinese="复杂产品如何从功能集合，演变为系统能力？"
      />

      <section id="system-thinking" className={styles.section}>
        <SectionHeading>System Thinking</SectionHeading>
        <p className={styles.leadStatement} aria-label="复杂产品的构建，不是功能的堆叠，而是需求、数据与业务关系持续演进形成的系统。">
          <Typewriter text="复杂产品的构建，不是功能的堆叠，而是需求、数据与业务关系持续演进形成的系统。" />
        </p>
        <SystemThinking />
      </section>

      <TypewriterOpening
        sticker="thinkingface"
        english="From Ideas to Practice"
        chinese="系统方法思考如何进入真实实践？"
      />

      <section className={`${styles.section} ${styles.workflowCardSection}`}>
        <WorkflowCapabilitiesCard />
      </section>

      <section className={styles.section}>
        <SectionHeading>Product Ecosystem</SectionHeading>
        <div className={styles.ecosystemIntro}>
          <h3>墨斗云空间智能产品体系</h3>
        </div>
        <div id="product-ecosystem-content" className={styles.ecosystemLayout} aria-label="Product Ecosystem">
          <ProductEcosystemNavigation />
          <div className={styles.ecosystemSections}>
            <article id="modou-product-system" className={styles.ecosystemNavSection}>
              <ProductEcosystem />
              <p className={styles.ecosystemDesc} aria-label="墨斗云围绕空间数据全生命周期展开，从多源空间数据生产，到结构化数据组织，再到 AI 驱动的行业智能应用，形成连接数据、平台与业务流程的空间智能产品体系。">
                <Typewriter text={'墨斗云围绕空间数据全生命周期展开，从多源空间数据生产，\n到结构化数据组织，再到 AI 驱动的行业智能应用，形成连接数据、平台与业务流程的空间智能产品体系。'} />
              </p>
            </article>
            <article id="modou-scenario-practice" className={styles.ecosystemNavSection}>
              <div className={styles.ecosystemSubheading}>
                <h3>墨斗云场景应用实践</h3>
              </div>
              <CaseShowcase />
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.beyond}`}>
        <SectionHeading>Beyond Project Experience</SectionHeading>
        <div className={styles.beyondCopy}>
          <p className={styles.beyondLead} aria-label="参与墨斗云空间智能产品的建设，让我第一次真正进入复杂行业的工作现场。">
            <Typewriter text="参与墨斗云空间智能产品的建设，让我第一次真正进入复杂行业的工作现场。" />
          </p>
          <div className={styles.beyondColumns}>
            <article className={styles.beyondColumn}>
              <h3>相比于设计一个页面或完成一个 Demo，<br />我开始更多地关注复杂产品系统的形成——</h3>
              <p>从单点功能设计，<br />到围绕数据、平台与工作流<br />逐步展开的完整产品体系。</p>
              <span className={styles.beyondAccent} aria-hidden="true" />
            </article>
            <span className={styles.beyondDivider} aria-hidden="true" />
            <article className={styles.beyondColumn}>
              <h3>这段经历也让我逐步建立起<br />对产品系统的理解：</h3>
              <ul>
                <li>在行业语境中看见真实诉求，</li>
                <li>在多方约束中梳理问题结构，</li>
                <li>并寻找让方案向前推进的路径。</li>
              </ul>
              <span className={styles.beyondAccent} aria-hidden="true" />
            </article>
          </div>
        </div>
      </section>

      <ContentSection portrait="sad-face" bubbleText="现在就要走了吗？" />
    </main>
  );
}
