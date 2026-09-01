import LineReveal from '@/components/About/LineReveal';
import ContentSection from '@/components/Content/ContentSection';
import SystemThinking, { type ThinkingNodeContent } from '@/components/System/SystemThinking';
import Typewriter from '@/components/System/Typewriter';
import TypewriterOpening from '@/components/System/TypewriterOpening';
import WorkflowCapabilitiesCard, { type Capability } from '@/components/System/WorkflowCapabilitiesCard';
import AnalyticsClipboardScene from './AnalyticsClipboardScene';
import EvaluationMatrix from './EvaluationMatrix';
import ResearchPractice from './ResearchPractice';
import ResearchPracticeNavigation from './ResearchPracticeNavigation';
import systemStyles from '@/components/System/SystemPage.module.css';
import styles from './SensePage.module.css';

const RESEARCH_NODES: readonly ThinkingNodeContent[] = [
  ['Context', '研究语境', '理解问题发生的环境、背景与现实约束。'],
  ['People', '参与者', '理解不同角色的行为、诉求与判断。'],
  ['Observation', '真实观察', '从信息、数据与行为中捕捉关键现象与线索。'],
  ['Problem Framing', '问题识别', '连接分散信息，逐步识别真正需要解决的问题。'],
  ['Insight', '需求洞察', '将观察与问题转化为对真实需求的理解。'],
  ['Strategy', '策略转化', '将研究结论转化为可继续推进的方向与行动。'],
];

const EVALUATION_NODES: readonly ThinkingNodeContent[] = [
  ['Sales Performance', '业务表现', '衡量业务表现与资源配置。'],
  ['Commercial Terms', '商务条件', '对比租赁条件与市场水平。'],
  ['Space Efficiency', '空间效率', '判断办公空间的使用效率。'],
  ['Change Cost', '变更成本', '评估方案调整带来的额外成本。'],
  ['CAPEX', '资本投入', '衡量方案所需资本投入。'],
  ['Office Suitability', '办公适配度', '判断不同办公模式的适配程度。'],
];

const RESEARCH_CAPABILITIES: Capability[][] = [
  [
    { id: 'user-research', icon: 'users', label: '用户研究与需求洞察' },
    { id: 'scenario-analysis', icon: 'search', label: '场景分析与问题拆解' },
    { id: 'market-trends', icon: 'chart', label: '市场趋势研究' },
    { id: 'business-environment', icon: 'hierarchy', label: '商业环境分析' },
  ],
  [
    { id: 'multi-source', icon: 'database', label: '多源信息整合' },
    { id: 'interviews', icon: 'users', label: '访谈调研与信息提炼' },
    { id: 'data-visualization', icon: 'chart', label: '数据分析与可视化' },
    { id: 'benchmarking', icon: 'search', label: 'Benchmarking 竞品对标' },
  ],
  [
    { id: 'research-framework', icon: 'hierarchy', label: '研究框架搭建' },
    { id: 'decision-model', icon: 'settings', label: '决策模型构建' },
    { id: 'strategy-simulation', icon: 'cpu', label: '策略方案推演' },
    { id: 'business-presentation', icon: 'code', label: '商业汇报与观点表达' },
  ],
];

const RESEARCH_PRACTICE_SECTIONS = [
  {
    id: 'organizing-complexity',
    title: '复杂信息的组织',
    description: '将市场、业务与空间等分散信息重新组织，识别真正影响问题判断的关键关系。',
  },
  {
    id: 'building-evaluation',
    title: '评价体系的建立',
    description: '把不同性质的判断因素转化为统一的评价维度、权重与评分规则。',
  },
] as const;

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

export default function SensePageContent() {
  return (
    <main className={`${systemStyles.page} ${styles.page}`}>
      <section className={systemStyles.hero} aria-labelledby="sense-title">
        <div className={systemStyles.heroTitleGroup}>
          <h1 id="sense-title" className="srOnly">SENSE</h1>
          <span className={systemStyles.heroWord} aria-hidden="true"><span>SEN</span><span>SE</span></span>
          <p className={systemStyles.heroSubtitle}>用户研究 · 场景洞察 · 策略转化</p>
        </div>
        <div className={systemStyles.heroModel}>
          <AnalyticsClipboardScene className={`${systemStyles.heroCanvas} ${styles.heroCanvas}`} />
        </div>
        <div className={systemStyles.heroTitleFront} aria-hidden="true">
          <span className={systemStyles.heroWord}><span className={systemStyles.heroWordGhost}>SEN</span><span className={styles.heroFrontSe}>SE</span></span>
        </div>
        <a className={systemStyles.scrollCue} href="#from-observations-to-needs">
          <span className={systemStyles.scrollCueLabel}>我如何研究并理解真实需求</span>
          <span className={systemStyles.scrollIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </a>
      </section>

      <TypewriterOpening id="from-observations-to-needs" english="From observations to needs" chinese="真实观察如何转化为对需求的理解？" sticker="exclamation-mark" />

      <section className={systemStyles.section}>
        <SectionHeading>Research Philosophy</SectionHeading>
        <p className={systemStyles.leadStatement} aria-label="研究的价值，不是获取更多信息，而是在复杂信息、真实行为与具体语境中，不断缩小“我们以为的问题”与“真实问题”之间的距离。">
          <Typewriter text={'研究的价值，不是获取更多信息，而是在复杂信息、真实行为\n与具体语境中，不断缩小“我们以为的问题”与“真实问题”之间的距离。'} />
        </p>
        <SystemThinking nodes={RESEARCH_NODES} ariaLabel="研究方法六要素" />
      </section>

      <TypewriterOpening english="From insights to decisions" chinese="研究洞察如何组织支持真实决策？" sticker="shack-face" />

      <section className={`${systemStyles.section} ${systemStyles.workflowCardSection}`}>
        <WorkflowCapabilitiesCard
          tagRows={RESEARCH_CAPABILITIES}
          stageLabel="可拖动放大镜查看研究能力"
          heading="CBRE · 战略咨询实践"
          role="战略咨询实习"
          period="2025.10—2026.02"
          dateTime="2025-10/2026-02"
          description={<>这里记录了我在 CBRE 战略咨询实习期间，围绕商业与办公场景，以 <strong>CBRE × Roche</strong> 项目为例所展开的研究探索。</>}
        />
      </section>

      <section className={systemStyles.section}>
        <SectionHeading>Research in Practice</SectionHeading>
        <div className={systemStyles.ecosystemIntro}>
          <h3>{RESEARCH_PRACTICE_SECTIONS[0].title}</h3>
        </div>
        <p className={styles.practiceLead} aria-label={RESEARCH_PRACTICE_SECTIONS[0].description.replace('\n', '')}>
          <Typewriter text={RESEARCH_PRACTICE_SECTIONS[0].description} />
        </p>
        <div id="research-in-practice-content" className={styles.practiceLayout} aria-label="Research in Practice">
          <ResearchPracticeNavigation />
          <div className={styles.practiceSections}>
            {RESEARCH_PRACTICE_SECTIONS.map(({ id, title, description }, index) => (
              <article className={styles.practiceSection} id={id} key={id}>
                {index > 0 && <>
                  <div className={systemStyles.ecosystemSubheading}><h3>{title}</h3></div>
                  <p className={`${styles.practiceLead} ${styles.practiceSectionLead}`} aria-label={description.replace('\n', '')}>
                    <Typewriter text={description} />
                  </p>
                </>}
                {index === 0 && <ResearchPractice />}
                {index === 1 && <div className={styles.evaluationThinking}>
                  <SystemThinking nodes={EVALUATION_NODES} ariaLabel="评价体系六项评价维度" />
                  <EvaluationMatrix />
                  <p className={`${styles.practiceLead} ${styles.evaluationFollowup}`} aria-label="对推荐方向进一步结合空间预测、租金预测与成本测算进行验证，形成最终策略建议。">
                    <Typewriter text="对推荐方向进一步结合空间预测、租金预测与成本测算进行验证，形成最终策略建议。" />
                  </p>
                </div>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${systemStyles.section} ${systemStyles.beyond}`}>
        <SectionHeading>Beyond Research Practice</SectionHeading>
        <div className={systemStyles.beyondCopy}>
          <p className={systemStyles.beyondLead} aria-label="参与 CBRE 战略咨询实践，让我第一次进入复杂商业问题的研究现场。">
            <Typewriter text="参与 CBRE 战略咨询实践，让我第一次进入复杂商业问题的研究现场。" />
          </p>
          <div className={systemStyles.beyondColumns}>
            <article className={systemStyles.beyondColumn}>
              <h3>相比于寻找一个预设答案，<br />我开始关注问题如何被发现——</h3>
              <p>从市场、业务到行为与空间，<br />真实需求往往隐藏在信息之间。</p>
              <span className={systemStyles.beyondAccent} aria-hidden="true" />
            </article>
            <span className={systemStyles.beyondDivider} aria-hidden="true" />
            <article className={systemStyles.beyondColumn}>
              <h3>这段经历让我逐步建立起研究方法：</h3>
              <ul>
                <li>看见真实诉求</li>
                <li>梳理问题结构</li>
                <li>转化判断依据</li>
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
