'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import styles from './WorkflowCapabilitiesCard.module.css';

export type Capability = {
  id: string;
  label: string;
  icon: 'flash' | 'hierarchy' | 'search' | 'code' | 'users' | 'settings' | 'database' | 'cpu' | 'cloud' | 'chart';
};

const TAG_ROWS: Capability[][] = [
  [
    { id: 'zero-to-one', icon: 'flash', label: '0-1 产品建设' },
    { id: 'product-architecture', icon: 'hierarchy', label: '产品架构梳理' },
    { id: 'requirements', icon: 'search', label: '需求拆解' },
    { id: 'prototype-design', icon: 'code', label: '原型设计' },
  ],
  [
    { id: 'product-review', icon: 'users', label: '独立产品评审' },
    { id: 'acceptance-testing', icon: 'settings', label: '独立测试验收' },
    { id: 'spatial-data', icon: 'database', label: '空间数据结构化设计' },
    { id: 'ai-planning', icon: 'cpu', label: 'AI 能力规划' },
  ],
  [
    { id: 'agent-workflow', icon: 'hierarchy', label: 'Agent 工作流设计' },
    { id: 'low-code-demo', icon: 'code', label: '低代码 Demo 搭建' },
    { id: 'industry-solution', icon: 'cloud', label: '行业解决方案落地' },
    { id: 'commercial-content', icon: 'chart', label: '商业化内容策划' },
  ],
];

function CapabilityIcon({ name }: { name: Capability['icon'] }) {
  const paths: Record<Capability['icon'], React.ReactNode> = {
    flash: <path d="m13 2-7 11h6l-1 9 7-12h-6l1-8Z" />,
    hierarchy: <><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v5M6 17v-5h12v5" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3 0 5 1.7 6 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4M10 10h4v4h-4z" /></>,
    cloud: <path d="M6 18h12a4 4 0 0 0 .6-8A6.5 6.5 0 0 0 6.2 8.5 4.8 4.8 0 0 0 6 18Z" />,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Tags({ rows, reveal = false }: { rows: Capability[][]; reveal?: boolean }) {
  return (
    <div className={`${styles.tagRows} ${reveal ? styles.tagRowsReveal : ''}`}>
      {rows.map((row, rowIndex) => (
        <div className={`${styles.ticker} ${styles[`ticker${rowIndex + 1}`]}`} key={rowIndex}>
          <div className={styles.tickerTrack}>
            {[...row, ...row, ...row].map((tag, index) => (
              <div className={styles.tag} key={`${tag.id}-${index}`}>
                <CapabilityIcon name={tag.icon} />
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkflowCapabilitiesCard({
  tagRows = TAG_ROWS,
  stageLabel = '可拖动放大镜查看产品能力',
  heading = '墨斗云 · 空间智能产品实践',
  role = '产品经理实习',
  period = '2026.03—至今',
  dateTime = '2026-03',
  metaLinks,
  description,
  footerNote,
  eyebrow,
  showMeta = true,
  stageContent,
  variant = 'default',
  className = '',
}: {
  tagRows?: Capability[][];
  stageLabel?: string;
  heading?: string;
  role?: string;
  period?: string;
  dateTime?: string;
  metaLinks?: Array<{ label: string; href: string }>;
  description?: React.ReactNode;
  footerNote?: React.ReactNode;
  eyebrow?: string;
  showMeta?: boolean;
  stageContent?: React.ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
} = {}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState({ x: 77, y: 70 });
  const [dragging, setDragging] = useState(false);

  const moveLens = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setLens({
      x: Math.max(9, Math.min(91, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(16, Math.min(84, ((event.clientY - rect.top) / rect.height) * 100)),
    });
  };

  return (
    <article data-has-links={metaLinks ? 'true' : undefined} className={`${styles.card} ${variant === 'compact' ? styles.cardCompact : ''} ${className}`}>
      <section
        className={styles.stage}
        ref={stageRef}
        onPointerMove={moveLens}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        aria-label={stageLabel}
      >
        <Tags rows={tagRows} />
        <div
          className={styles.revealWindow}
          style={{ '--lens-x': `${lens.x}%`, '--lens-y': `${lens.y}%` } as React.CSSProperties}
          aria-hidden="true"
        >
          <Tags rows={tagRows} reveal />
        </div>
        <div className={`${styles.edgeFade} ${styles.edgeFadeLeft}`} aria-hidden="true" />
        <div className={`${styles.edgeFade} ${styles.edgeFadeRight}`} aria-hidden="true" />
        <button
          className={styles.lens}
          style={{ left: `${lens.x}%`, top: `${lens.y}%` }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={moveLens}
          onPointerUp={() => setDragging(false)}
          aria-label="拖动放大镜"
        >
          <img src="/portfolio/system/magnifying-lens.webp" alt="" draggable="false" />
        </button>
        {stageContent && <div className={styles.stageContent}>{stageContent}</div>}
      </section>

      <div className={styles.copy}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <div className={styles.headingRow}>
          <h2>{heading}</h2>
          {showMeta && <div className={styles.meta} data-links={metaLinks ? 'true' : undefined} aria-label={metaLinks ? '项目入口' : '实践信息'}>
            {metaLinks ? metaLinks.map((link) => <a href={link.href} key={`${link.href}-${link.label}`}>{link.label}</a>) : <>
              <span>{role}</span>
              <time dateTime={dateTime}>{period}</time>
            </>}
          </div>}
        </div>
        {description !== null && <p>{description ?? <>这里记录了我在米料智慧科技有限公司<span className={styles.keepTogether}>「墨斗云」</span>空间智能产品方向的实践探索。</>}</p>}
        {footerNote && <footer className={styles.footerNote}>{footerNote}</footer>}
      </div>
    </article>
  );
}
