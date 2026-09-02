'use client';

import { useEffect, useRef, useState } from 'react';
import { MobileCardCarouselControls, useMobileCardCarousel } from '@/components/MobileCardCarousel';
import WorkflowCapabilitiesCard, { type Capability } from '@/components/System/WorkflowCapabilitiesCard';
import styles from './ResearchPractice.module.css';

const PRACTICE_CAPABILITIES: Capability[][] = [
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

const SITES = [
  ['Site A', 100, 80, 51], ['Site B', 60, 75, 56], ['Site C', 30, 85, 90],
  ['Site D', 18, 82, 87], ['Site E', 18, 100, 82], ['Site F', 15, 92, 100],
  ['Site G', 16, 88, 82], ['Site H', 24, 77, 58], ['Site I', 17, 68, 68],
] as const;

const HUBS = [
  ['Anchor Hub', 72, 188, 'XL', 'REBALANCE'], ['Growth Hub', 146, 122, 'L', 'ADD SUPPORT'],
  ['Coverage Hub', 138, 94, 'M', 'ADD COVERAGE'], ['Ramp-up Hub', 102, 72, 'M', 'STAFF UP'],
  ['Lean Hub', 88, 58, 'S', 'WATCH LOAD'], ['Local Hub', 66, 44, 'S', 'ADD PROCESS'],
  ['Bridge Hub', 62, 46, 'S', 'MONITOR'], ['Satellite Hub', 56, 40, 'S', 'MONITOR'],
  ['Regional Hub', 54, 42, 'S', 'HOLD'], ['Balanced Hub', 50, 44, 'S', 'HOLD'],
  ['Emerging Hub', 22, 16, 'XS', 'TRACK'],
] as const;

const MARKETS = [
  ['Market A', 2.6, [60, 95, 100]], ['Market B', 1.8, [20, 55, 10]],
  ['Market C', 2.4, [60, 75, 30]], ['Market D', 3.5, [50, 60, 40]],
  ['Market E', 2.8, [20, 15, 35]], ['Market F', 3.4, [10, 30, 30]],
  ['Market G', 5, [30, 35, 50]], ['Market H', 3.6, [40, 50, 10]],
  ['Market I', 3.3, [20, 15, 0]], ['Market J', 3.3, [10, 10, 10]],
] as const;

function ChartShell({ children, legend, active, label, prompt, offset = 0 }: { children: React.ReactNode; legend: React.ReactNode; active: boolean; label: string; prompt: readonly [string, string]; offset?: number }) {
  return <div className={styles.chart} data-active={active}><header className={styles.chartIntro}><strong>{prompt[0]}</strong></header><svg style={{ '--chart-offset': `${offset}px` } as React.CSSProperties} viewBox="40 24 786 326" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>{children}</svg><footer>{legend}</footer></div>;
}

function MismatchChart({ active }: { active: boolean }) {
  const rows = SITES.map(([name, footprint, stable, pressure]) => ({ name, footprint, stable, pressure, gap: stable - footprint })).sort((a, b) => b.gap - a.gap);
  const mapX = (v: number) => 246 + ((v + 25) / 110) * 524;
  const zero = mapX(0);
  return <ChartShell active={active} label="匿名点位面积效率错配榜" prompt={PROMPTS[2]} offset={-3} legend={<div className={styles.legend}><span><i className={styles.footprintKey}/>Footprint Index</span><span><i className={styles.hotKey}/>Stable Load Index</span><span><i className={styles.pressureKey}/>Peak Pressure Band</span></div>}>
    <line x1="54" y1="53" x2="818" y2="53" className={`${styles.frameLine} ${styles.fade}`}/>
    <line x1="54" y1="329" x2="818" y2="329" className={`${styles.frameLine} ${styles.fade}`} style={{ animationDelay: '.24s' }}/>
    {[-50, -25, 0, 25, 50, 75].map((v, i) => <g className={styles.fade} style={{ animationDelay: `${i * .04}s` }} key={v}><line x1={mapX(v)} y1="55" x2={mapX(v)} y2="329" className={v === 0 ? styles.zeroGrid : styles.grid}/><text x={mapX(v)} y="43" textAnchor="middle" className={v === 0 ? styles.zeroText : undefined}>{v > 0 ? `+${v}` : v}</text></g>)}
    {rows.map((d, i) => { const y = 87 + i * 27; const x = mapX(d.gap); const positive = d.gap >= 0; return <g key={d.name}><line x1="54" y1={y} x2="818" y2={y} className={`${styles.grid} ${styles.fade}`} style={{ animationDelay: `${i * .045}s` }}/><text x="54" y={y + 3} className={`${styles.rowLabel} ${styles.fade}`} style={{ animationDelay: `${.05 + i * .045}s` }}>{d.name.toUpperCase()}</text><line x1={positive ? zero : x} x2={positive ? x : zero} y1={y} y2={y} pathLength="1" className={`${styles.draw} ${positive ? styles.hotStroke : styles.coolStroke}`} style={{ animationDelay: `${.2 + i * .055}s` }}/><circle cx={x} cy={y} r={3.8 + Math.sqrt(d.pressure / 100) * 6.2} className={`${styles.pop} ${positive ? styles.hotRing : styles.pressureCoolRing}`} strokeDasharray={d.pressure >= 80 ? '2.2 3' : undefined} style={{ animationDelay: `${.48 + i * .055}s` }}><title>{`${d.name} · Gap Index ${d.gap >= 0 ? '+' : ''}${d.gap} · Footprint Index ${d.footprint} · Stable Load Index ${d.stable} · Peak Pressure Band ${d.pressure}`}</title></circle><circle cx={x} cy={y} r="2.9" className={`${styles.pop} ${positive ? styles.hotFill : styles.coolFill}`} style={{ animationDelay: `${.58 + i * .055}s` }}/><text x={positive ? x + 13 : x - 13} y={y + 3} textAnchor={positive ? 'start' : 'end'} className={`${styles.fade} ${positive ? styles.hotText : styles.coolText}`} style={{ animationDelay: `${.62 + i * .055}s` }}>{positive ? '+' : ''}{d.gap}</text></g>; })}
  </ChartShell>;
}

function HubChart({ active }: { active: boolean }) {
  const rows = [...HUBS].sort((a, b) => Math.abs((b[1] as number) - (b[2] as number)) - Math.abs((a[1] as number) - (a[2] as number)));
  const mapX = (v: number) => 176 + (v / 200) * 472;
  return <ChartShell active={active} label="匿名业务需求与资源指数比较" prompt={PROMPTS[1]} offset={1} legend={<div className={styles.legend}><span><i className={styles.resourceKey}/>Resource Index</span><span><i className={styles.hotKey}/>Demand Index</span><span><i className={styles.gapKey}/>Gap Index</span></div>}>
    <g>
      <line x1="54" y1="53" x2="818" y2="53" className={`${styles.frameLine} ${styles.fade}`}/>
      {Array.from({ length: 9 }, (_, g) => g * 25).map((v, i) => <g className={styles.fade} style={{ animationDelay: `${i * .025}s` }} key={v}><line x1={mapX(v)} y1="55" x2={mapX(v)} y2="329" className={v % 50 === 0 ? styles.grid : styles.minorGrid}/>{v % 50 === 0 && <text x={mapX(v)} y="43" textAnchor="middle">{v}</text>}</g>)}
      {rows.map(([role, demand, resource, scale, action], i) => { const y = 79 + i * 24; const xd = mapX(demand); const xr = mapX(resource); const gap = demand - resource; const status = gap > 20 ? 'demand' : gap < -20 ? 'resource' : 'fit'; return <g key={role}><line x1="54" y1={y} x2="818" y2={y} className={`${styles.grid} ${styles.fade}`} style={{ animationDelay: `${i * .045}s` }}/><text x="54" y={y} dominantBaseline="middle" className={`${styles.rowLabel} ${styles.fade}`} style={{ animationDelay: `${i * .045}s` }}>{role.toUpperCase()}</text><line x1={Math.min(xd, xr)} x2={Math.max(xd, xr)} y1={y} y2={y} pathLength="1" className={`${styles.drawThin} ${gap >= 0 ? styles.hotStroke : styles.coolStroke}`} style={{ animationDelay: `${.16 + i * .045}s` }}/><circle cx={xr} cy={y} r={scale === 'XL' ? 6.4 : 5.2} className={`${styles.pop} ${styles.coolRing}`} style={{ animationDelay: `${.22 + i * .045}s` }}/><circle cx={xd} cy={y} r={scale === 'XL' ? 6.2 : 5.4} className={`${styles.pop} ${styles.hotFill}`} style={{ animationDelay: `${.5 + i * .045}s` }}/><line x1="658" y1={y - 9} x2="658" y2={y + 9} className={`${styles.fade} ${status === 'demand' ? styles.hotStroke : status === 'resource' ? styles.coolStroke : styles.mutedStroke}`} style={{ animationDelay: `${.24 + i * .045}s` }}/><text x="670" y={y + 3} className={`${styles.fade} ${status === 'demand' ? styles.hotText : status === 'resource' ? styles.coolText : styles.mutedText}`} style={{ animationDelay: `${.28 + i * .045}s` }}>{action}</text><text x="795" y={y + 3} textAnchor="end" className={`${styles.fade} ${styles.faintText}`} style={{ animationDelay: `${.3 + i * .045}s` }}>{scale}</text></g>; })}
    </g>
  </ChartShell>;
}

const random = (i: number, k: number) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;
function blobPath(x: number, y: number, r: number, seed: number) {
  const count = Math.max(14, Math.round(r * 1.55));
  const points = Array.from({ length: count }, (_, index) => { const angle = index / count * Math.PI * 2; const wave = 1 + .055 * Math.sin(angle * 2 + seed * 7) + .04 * Math.sin(angle * 3 + seed * 13) + (random(seed + index, 3) - .5) * .035; return [x + Math.cos(angle) * r * wave, y + Math.sin(angle) * r * wave]; });
  let path = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  points.forEach((point, index) => { const next = points[(index + 1) % count]; path += ` Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${((point[0] + next[0]) / 2).toFixed(1)} ${((point[1] + next[1]) / 2).toFixed(1)}`; });
  return `${path} Z`;
}

function AlmanacChart({ active }: { active: boolean }) {
  const rowY = (index: number) => 98 + index * 86;
  const points = MARKETS.flatMap(([name, vacancy, values], j) => values.map((value, i) => ({ name, vacancy, value, i, j }))).sort((a, b) => b.value - a.value).map((point, k) => { const seed = point.i * 31 + point.j * 7 + 5; return { ...point, x: 145 + point.j * 69.5 + (random(point.i * 11 + point.j + 3, point.j + 9) - .5) * 8, y: rowY(point.i) + (random(point.i * 7 + point.j + 5, point.j + 11) - .5) * 6, r: point.value <= 0 ? 2.4 : Math.sqrt(point.value / 100) * 31, seed, delay: .15 + k * .014 }; });
  const topThree = new Set(points.slice(0, 3).map((point) => `${point.name}-${point.i}`));
  return <ChartShell active={active} label="匿名市场供应指数与压力指数年鉴" prompt={PROMPTS[0]} offset={9} legend={<div className={styles.legend}><span><i className={styles.coolKey}/>Supply Index</span><span><i className={styles.hotKey}/>Vacancy Pressure Index</span></div>}>
    <g transform="translate(0 10)">
      {Array.from({ length: 39 }, (_, index) => 64 + index * 6.1).map((y, index) => <line key={y} x1="54" y1={y} x2="818" y2={y} className={`${styles.minorGrid} ${styles.fade}`} style={{ animationDelay: `${index * .0068}s` }}/>) }
      {['2025F', '2026F', '2027F'].map((year, i) => <g key={year}><line x1="54" y1={rowY(i)} x2="818" y2={rowY(i)} className={`${styles.frameLine} ${styles.fade}`} style={{ animationDelay: `${i * .05}s` }}/><text x="54" y={rowY(i) + 4} className={`${styles.rowLabel} ${styles.fade}`} style={{ animationDelay: `${i * .05}s` }}>{year}</text></g>)}
      {MARKETS.map(([name], j) => { const x = 115 + j * 69.5; return <text key={name} x={x} y="42" transform={`rotate(-32 ${x} 42)`} className={`${styles.marketLabel} ${styles.fade}`} style={{ animationDelay: `${j * .035}s` }}>{name.replace('Market ', 'MKT ').toUpperCase()}</text>; })}
      {points.map((point) => <g className={styles.pop} style={{ animationDelay: `${point.delay}s` }} key={`bubble-${point.name}-${point.i}`}><path d={blobPath(point.x, point.y, point.r, point.seed)} className={point.value <= 0 ? styles.emptyBubble : styles.supplyBlob}><title>{`${point.name} · ${2025 + point.i}F — Supply Index ${point.value} · Pressure Index ${point.vacancy.toFixed(1)} / 5`}</title></path></g>)}
      {points.map((point) => { const pressure = Math.max(0, (point.vacancy - 1) / 4); const coreR = 2.2 + pressure * 5.4; const ox = (random(point.seed + 1, 17) - .5) * point.r * .22; const oy = (random(point.seed + 3, 19) - .5) * point.r * .22; return <g className={styles.pop} style={{ animationDelay: `${point.delay + .08}s` }} key={`core-${point.name}-${point.i}`}>{point.vacancy >= 2.4 && <circle cx={point.x} cy={point.y} r={point.r + 4} className={styles.hotHalo}/>} {point.value > 0 && <path d={blobPath(point.x + ox, point.y + oy, coreR, point.seed + 29)} className={styles.hotFill}/>}</g>; })}
      {points.filter((point) => topThree.has(`${point.name}-${point.i}`)).map((point) => <text key={`top-${point.name}-${point.i}`} x={point.x} y={point.y - point.r - 8} textAnchor="middle" className={`${styles.topLabel} ${styles.fade}`} style={{ animationDelay: '1s' }}>{`SI ${point.value}`}</text>)}
    </g>
  </ChartShell>;
}

const PROMPTS = [
  ['Market｜市场环境', '通过租赁市场与合同条件，形成对商务条件与调整成本的判断。'],
  ['Business｜业务与组织', '结合业务表现、市场覆盖与资源配置，判断业务价值与战略重要性。'],
  ['Space｜空间使用', '基于空间使用与调整需求，判断空间效率、投入成本与办公模式适配度。'],
] as const;

type TopicMetricIcon = 'chart' | 'coins' | 'grid' | 'briefcase' | 'contract' | 'layers';

const TOPIC_DETAILS = [
  {
    english: 'Market', chinese: '市场环境', description: PROMPTS[0][1],
    criteria: [
      { label: '商务条件', detail: '租赁条件与市场水平', icon: 'contract' },
      { label: '变更成本', detail: '解约、恢复与调整成本', icon: 'layers' },
    ],
  },
  {
    english: 'Business', chinese: '业务与组织', description: PROMPTS[1][1],
    criteria: [
      { label: '业务表现', detail: '业务表现与资源配置', icon: 'briefcase' },
    ],
  },
  {
    english: 'Space', chinese: '空间使用', description: PROMPTS[2][1],
    criteria: [
      { label: '空间效率', detail: '使用效率与空间利用水平', icon: 'chart' },
      { label: '资本投入', detail: '空间调整与改造投入成本', icon: 'coins' },
      { label: '办公适配度', detail: '办公模式与空间匹配程度', icon: 'grid' },
    ],
  },
] as const satisfies readonly { english: string; chinese: string; description: string; criteria: readonly { label: string; detail: string; icon: TopicMetricIcon }[] }[];

function TopicMetricGlyph({ type }: { type: TopicMetricIcon }) {
  if (type === 'chart') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 15 3-4 3 2 4-6M16 7h2v2"/></svg>;
  if (type === 'coins') return <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>;
  if (type === 'grid') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (type === 'briefcase') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2"/></svg>;
  if (type === 'contract') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8l3 3v15H7zM15 3v4h4M10 11h5M10 15h5"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></svg>;
}

function CommaBreakText({ text }: { text: string }) {
  const commaIndex = text.indexOf('，');
  if (commaIndex < 0) return <>{text}</>;
  return <>{text.slice(0, commaIndex + 1)}<br />{text.slice(commaIndex + 1)}</>;
}

const OVERVIEW_TICKER_ROWS = [
  [
    { label: '业务表现', icon: 'briefcase' },
    { label: '商务条件', icon: 'contract' },
  ],
  [
    { label: '空间效率', icon: 'chart' },
    { label: '变更成本', icon: 'layers' },
  ],
  [
    { label: '资本投入', icon: 'coins' },
    { label: '办公适配度', icon: 'grid' },
  ],
] as const satisfies readonly (readonly { label: string; icon: TopicMetricIcon }[])[];

export default function ResearchPractice() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState([false, false, false]);
  const [entryDistance, setEntryDistance] = useState(720);
  const [activeTopic, setActiveTopic] = useState(-1);
  const carousel = useMobileCardCarousel(3, rootRef);
  const displayedTopic = carousel.enabled ? carousel.index : activeTopic;

  useEffect(() => {
    if (window.matchMedia('(max-width: 980px)').matches) {
      setEntered([true, true, true]);
      const charts = Array.from({ length: 3 }, (_, index) => document.getElementById(`research-chart-${index + 1}`)).filter(Boolean) as HTMLElement[];
      const observer = new IntersectionObserver(() => {
        const viewportCenter = window.innerHeight * .5;
        const visible = charts.map((chart, index) => ({ index, rect: chart.getBoundingClientRect() })).filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight).sort((a, b) => Math.abs((a.rect.top + a.rect.bottom) / 2 - viewportCenter) - Math.abs((b.rect.top + b.rect.bottom) / 2 - viewportCenter))[0];
        if (visible) setActiveTopic(visible.index);
        else if (charts[0]?.getBoundingClientRect().top > window.innerHeight) setActiveTopic(-1);
      }, { rootMargin: '-18% 0px -18%', threshold: [0, .15, .5] });
      charts.forEach((chart) => observer.observe(chart));
      return () => observer.disconnect();
    }
    let frame = 0;
    const update = () => { frame = 0; const root = rootRef.current; const sticky = stickyRef.current; if (!root || !sticky) return; const rect = root.getBoundingClientRect(); const travel = root.offsetHeight - window.innerHeight; const next = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0; const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0; setEntryDistance(Math.max(sticky.offsetHeight, window.innerHeight - stickyTop)); setProgress(next); setActiveTopic(next < 1 / 6 ? -1 : Math.min(2, Math.ceil(next * 3 - .5) - 1)); setEntered((old) => old.map((value, index) => value || next > index / 3 + .06)); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const scrollToChart = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    if (carousel.enabled) {
      carousel.select(index);
      return;
    }
    if (window.matchMedia('(max-width: 980px)').matches) {
      document.getElementById(`research-chart-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const rootTop = window.scrollY + root.getBoundingClientRect().top;
    const travel = Math.max(0, root.offsetHeight - window.innerHeight);
    window.scrollTo({ top: rootTop + travel * ((index + 1) / 3), behavior: 'smooth' });
  };

  const renderFeatureCard = (extraClass = '') => <WorkflowCapabilitiesCard
    className={extraClass}
    variant="compact"
    tagRows={PRACTICE_CAPABILITIES}
    stageLabel="可拖动放大镜查看研究能力"
    eyebrow="Research & Synthesis"
    heading="研究与整合"
    showMeta={false}
    description={null}
    footerNote="数据已做脱敏处理，仅展示分析框架。"
    stageContent={displayedTopic < 0
      ? <div className={styles.overviewStage} key="overview">
          <header>
            <h3 className={styles.overviewTitle}>Organizing Complexity</h3>
            <button type="button" aria-label="切换到市场环境" onClick={() => scrollToChart(0)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg></button>
          </header>
          <div className={styles.overviewTicker} aria-label="六项评价维度">
            {OVERVIEW_TICKER_ROWS.map((row, rowIndex) => (
              <div className={styles.overviewTickerRow} data-direction={rowIndex === 1 ? 'reverse' : 'forward'} key={rowIndex}>
                <div className={styles.overviewTickerTrack}>
                  {Array.from({ length: 4 }, (_, groupIndex) => (
                    <span className={styles.overviewTickerGroup} aria-hidden={groupIndex > 0} key={groupIndex}>
                      {row.map((item) => (
                        <span className={styles.overviewTickerPill} key={`${item.label}-${groupIndex}`}>
                          <TopicMetricGlyph type={item.icon}/>
                          <strong>{item.label}</strong>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      : <div className={styles.topicStage} key={TOPIC_DETAILS[displayedTopic].english}>
          <header><h3><span>{TOPIC_DETAILS[displayedTopic].english}</span> {TOPIC_DETAILS[displayedTopic].chinese}</h3><button type="button" aria-label={`切换到${TOPIC_DETAILS[(displayedTopic + 1) % TOPIC_DETAILS.length].chinese}`} onClick={() => scrollToChart((displayedTopic + 1) % TOPIC_DETAILS.length)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg></button></header>
          <p><CommaBreakText text={TOPIC_DETAILS[displayedTopic].description} /></p>
          <ul>
            {TOPIC_DETAILS[displayedTopic].criteria.map((criterion) => <li key={criterion.label}><TopicMetricGlyph type={criterion.icon}/><strong>{criterion.label}</strong></li>)}
            {Array.from({ length: 3 - TOPIC_DETAILS[displayedTopic].criteria.length }, (_, index) => <li key={`placeholder-${index}`} data-placeholder="true" aria-hidden="true" />)}
          </ul>
        </div>}
  />;
  const renderPromptBoard = () => <article className={`${styles.board} ${styles.promptBoard}`}><ol>{PROMPTS.map(([title, body], index) => <li key={title}><div><strong>{title}</strong><p>{body}</p></div><button className={styles.arrow} type="button" aria-label={`查看${title}图表`} onClick={() => scrollToChart(index)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5v11M6.25 11.25 10 15l3.75-3.75"/></svg></button></li>)}</ol></article>;

  return <div ref={rootRef} className={styles.scrollStage}>
    <div ref={stickyRef} className={styles.stickyStage}>
      <div className={styles.mobilePagerShell}>
        {renderFeatureCard(styles.mobilePagerCard)}
      </div>
      {renderFeatureCard(styles.desktopFeatureCard)}
      <div className={styles.boardStack} data-mobile-carousel={carousel.enabled || undefined} data-carousel-direction={carousel.direction ?? undefined} onPointerDown={carousel.onPointerDown} onPointerUp={carousel.onPointerUp}>
        {renderPromptBoard()}
        {[<AlmanacChart active={entered[0]} key="almanac"/>, <HubChart active={entered[1]} key="hub"/>, <MismatchChart active={entered[2]} key="mismatch"/>].map((chart, index) => { const local = Math.min(1, Math.max(0, progress * 3 - index)); return <article id={`research-chart-${index + 1}`} className={`${styles.board} ${styles.chartBoard}`} data-carousel-position={carousel.getPosition(index)} style={{ '--stack-index': index, transform: `translate3d(0, ${(1 - local) * entryDistance}px, 0)` } as React.CSSProperties} key={index}>{chart}</article>; })}
        <MobileCardCarouselControls label="复杂信息的组织" onPrevious={() => carousel.select(carousel.index - 1)} onNext={() => carousel.select(carousel.index + 1)} />
      </div>
    </div>
  </div>;
}
