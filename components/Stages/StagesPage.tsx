import LineReveal from '@/components/About/LineReveal';
import ContentSection from '@/components/Content/ContentSection';
import Typewriter from '@/components/System/Typewriter';
import TypewriterOpening from '@/components/System/TypewriterOpening';
import ContinueScrollCue from '@/components/System/ContinueScrollCue';
import WorkflowCapabilitiesCard, { type Capability } from '@/components/System/WorkflowCapabilitiesCard';
import systemStyles from '@/components/System/SystemPage.module.css';
import VoiceMicScene from './VoiceMicScene';
import PlanningExperienceNavigation from './PlanningExperienceNavigation';
import CraftsmanPathPractice from './CraftsmanPathPractice';
import LightStudioPractice from './LightStudioPractice';
import HabitatPractice from './HabitatPractice';
import styles from './StagesPage.module.css';

const EXPERIENCE_CAPABILITIES: Capability[][] = [
  [
    { id: 'content-planning', icon: 'database', label: '内容策划' },
    { id: 'narrative-building', icon: 'hierarchy', label: '叙事构建' },
    { id: 'exhibition-design', icon: 'code', label: '展示设计' },
    { id: 'experience-planning', icon: 'users', label: '体验策划' },
  ],
  [
    { id: 'information-organization', icon: 'database', label: '信息组织' },
    { id: 'path-design', icon: 'search', label: '路径设计' },
    { id: 'spatial-composition', icon: 'hierarchy', label: '空间编排' },
    { id: 'rhythm-control', icon: 'settings', label: '节奏控制' },
  ],
  [
    { id: 'visual-expression', icon: 'chart', label: '视觉表达' },
    { id: 'atmosphere', icon: 'cpu', label: '氛围塑造' },
    { id: 'media-integration', icon: 'code', label: '媒介整合' },
    { id: 'on-site-presentation', icon: 'users', label: '现场呈现' },
  ],
];

const PROJECTS = [
  { id: 'craftsmans-path', title: "CRAFTSMAN'S PATH", description: '把一段关于“匠人”的内容拆成线索、节奏与触发点，让观看本身变成一次逐步发现故事的过程。' },
  { id: 'light-studio', title: 'LIGHT STUDIO', description: '把自然光里短暂、偶然的变化装进一个可操控的装置，让人可以亲手切换、组合并重新感受不同的光影状态。' },
  { id: 'habitat-0', title: 'HABITAT 0', description: '从未来生活方式出发，把行为、关系与使用场景重新组合，像搭建一套“生活原型”一样探索新的体验可能。' },
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <header className={systemStyles.sectionHeading}>
      <picture className={systemStyles.pageBreak} aria-hidden="true"><source type="image/avif" srcSet="/profile/stickers/page-break.avif" /><img src="/profile/stickers/page-break.webp" alt="" width={560} height={441} loading="lazy" decoding="async" /></picture>
      <h2 className={systemStyles.sectionHeadingTitle}><LineReveal>{children}</LineReveal><span className={systemStyles.sectionHeadingHalftone} aria-hidden="true"><span className={systemStyles.sectionHeadingHalftoneDot}>{children}</span></span></h2>
    </header>
  );
}

export default function StagesPageContent() {
  return (
    <main className={`${systemStyles.page} ${styles.page}`}>
      <section className={systemStyles.hero} aria-labelledby="stages-title">
        <div className={`${systemStyles.heroTitleGroup} ${styles.heroTitleGroup}`}>
          <h1 id="stages-title" className="srOnly">STAGES</h1>
          <span className={systemStyles.heroWord} aria-hidden="true"><span>STAG</span><span>ES</span></span>
          <p className={systemStyles.heroSubtitle}>项目叙事 · 展示设计 · 体验策划</p>
        </div>
        <div className={`${systemStyles.heroModel} ${styles.heroModel}`}><VoiceMicScene className={`${systemStyles.heroCanvas} ${styles.heroCanvas}`} /></div>
        <div className={`${systemStyles.heroTitleFront} ${styles.heroTitleFront}`} aria-hidden="true"><span className={systemStyles.heroWord}><span className={systemStyles.heroWordGhost}>STAG</span><span className={styles.heroFrontEs}>ES</span></span></div>
        <a className={systemStyles.scrollCue} href="#from-content-to-experience"><span className={systemStyles.scrollCueLabel}>我如何策划并呈现完整体验</span><span className={systemStyles.scrollIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></span></a>
      </section>

      <TypewriterOpening id="from-content-to-experience" english="From content to experience" chinese="内容如何被编排，并转化为具有节奏与记忆点的完整体验？" sticker="thinkingface">
        <ContinueScrollCue targetId="stages-workflow-card" label="查看体验策划实践" />
      </TypewriterOpening>

      <section id="stages-workflow-card" className={`${systemStyles.section} ${systemStyles.workflowCardSection}`}>
        <WorkflowCapabilitiesCard tagRows={EXPERIENCE_CAPABILITIES} stageLabel="可拖动聚光灯查看体验策划能力" heading="STAGES · 体验策划实践" metaLinks={[{ label: "CRAFTSMAN'S PATH", href: '#craftsmans-path' }, { label: 'LIGHT STUDIO', href: '#light-studio' }, { label: 'HABITAT 0', href: '#habitat-0' }]} description={<>这里记录了三个围绕<strong>内容组织、叙事表达与体验呈现</strong>展开的实践项目，探索内容如何被转化为完整而有节奏的体验。</>} />
      </section>

      <section className={systemStyles.section}>
        <SectionHeading>Planning Experience</SectionHeading>
        <div className={systemStyles.ecosystemIntro}>
          <h3>{PROJECTS[0].title}</h3>
        </div>
        <p className={styles.projectLead}><Typewriter text={PROJECTS[0].description} /></p>
        <div className={styles.planningLayout}>
          <PlanningExperienceNavigation />
          <div className={styles.projectSections}>
            {PROJECTS.map((project, index) => <article id={project.id} className={styles.projectSection} key={project.id} data-content-slot={project.id}>
              {index > 0 && <>
                <div className={`${systemStyles.ecosystemSubheading} ${styles.projectHeading}`}>
                  <h3>{project.title}</h3>
                </div>
                <p className={styles.projectLead}><Typewriter text={project.description} /></p>
              </>}
              {project.id === 'craftsmans-path'
                ? <CraftsmanPathPractice />
                : project.id === 'light-studio'
                  ? <LightStudioPractice />
                  : <HabitatPractice />}
            </article>)}
          </div>
        </div>
      </section>

      <section className={`${systemStyles.section} ${systemStyles.beyond}`}>
        <SectionHeading>Beyond Presentation</SectionHeading>
        <div className={systemStyles.beyondCopy}>
          <p className={systemStyles.beyondLead} aria-label="这些体验实践让我逐渐理解，好的呈现不只是结果本身，更在于人如何进入、感受并记住它。"><Typewriter text="这些体验实践让我逐渐理解，好的呈现不只是结果本身，更在于人如何进入、感受并记住它。" /></p>
          <div className={systemStyles.beyondColumns}>
            <article className={systemStyles.beyondColumn}><h3>相比于呈现一个“干巴”的结果，<br />我开始更关注体验如何被一步步建立——</h3><p>从内容进入、节奏推进到参与方式，<br />每一个环节都会影响最终感受。</p><span className={systemStyles.beyondAccent} aria-hidden="true" /></article>
            <span className={systemStyles.beyondDivider} aria-hidden="true" />
            <article className={systemStyles.beyondColumn}><h3>这些实践让我逐渐形成了对体验策划的理解：</h3><ul><li><strong>Narrative</strong> 建立叙事</li><li><strong>Sequence</strong> 组织节奏</li><li><strong>Experience</strong> 形成体验</li></ul><span className={systemStyles.beyondAccent} aria-hidden="true" /></article>
          </div>
        </div>
      </section>
      <ContentSection portrait="sad-face" bubbleText="现在就要走了吗？" />
    </main>
  );
}
