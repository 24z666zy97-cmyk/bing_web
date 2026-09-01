'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

import styles from './Timeline.module.css';

type Lane = 'study' | 'internship';

type Entry = {
  title: string;
  summary: string;
  detail: string;
  badge: string;
  lane: Lane;
};

const GROUPS: Array<{
  lane: Lane;
  index: string;
  title: string;
  label: string;
}> = [
  {
    lane: 'study',
    index: '01',
    title: 'EDUCATION',
    label: '学习 · 积淀',
  },
  {
    lane: 'internship',
    index: '02',
    title: 'INTERNSHIP',
    label: '实践 · 探索',
  },
];

const ENTRIES: Entry[] = [
  {
    title: '西南交通大学',
    summary: '2019.09一2024.06 | 建筑学 | 茅以升班 | 学士',
    detail: '扎实的建筑学训练，培养系统思维与空间洞察力。',
    badge: '/profile/timeline-structure/xinanjiaotong-university.webp',
    lane: 'study',
  },
  {
    title: '同济大学',
    summary: '2024.09一2027.06 | 建筑学 | 硕士',
    detail: '持续深化专业素养，拓展研究与设计的边界。',
    badge: '/profile/timeline-structure/tongji-university.webp',
    lane: 'study',
  },
  {
    title: 'CBRE 世邦魏理仕',
    summary: '2025.10一2026.02 | 产业地产交易 | 见习分析师',
    detail: '参与产业地产交易全流程，锻炼市场分析与投资判断能力。',
    badge: '/profile/timeline-structure/cbre.webp',
    lane: 'internship',
  },
  {
    title: '米料智慧科技有限公司',
    summary: '2026.03一Present | 墨斗云空间智能系列产品 | 产品经理实习生',
    detail: '参与空间智能产品的规划与迭代，推动产品落地与用户价值。',
    badge: '/profile/timeline-structure/miliao-ai.webp',
    lane: 'internship',
  },
];

function CategoryBlock({
  group,
}: {
  group: (typeof GROUPS)[number];
}) {
  return (
    <div className={styles.group}>
      <span className={styles.quote} aria-hidden="true">
        “
      </span>
      <div className={styles.groupHead}>
        <span className={styles.groupIndex}>{group.index}</span>
        <span className={styles.groupArrow} aria-hidden="true" />
      </div>
      <p className={styles.groupTitle}>{group.title}</p>
      <p className={styles.groupLabel}>{group.label}</p>
      <span className={styles.groupRule} aria-hidden="true" />
    </div>
  );
}

function TimelineEntry({ entry, index }: { entry: Entry; index: number }) {
  const entryRef = useRef<HTMLElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const node = entryRef.current;
    if (!node || hasEntered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEntered(true);
        observer.disconnect();
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -2% 0px',
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <article
      ref={entryRef}
      className={[
        styles.entry,
        entry.lane === 'study' ? styles.studyEntry : styles.internshipEntry,
        hasEntered ? styles.entryVisible : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--entry-index': index } as CSSProperties}
    >
      <div className={styles.node} aria-hidden="true">
        <span className={styles.connector} />
        <span className={styles.nodeDot} />
      </div>

      <div className={styles.card}>
        <div className={styles.logoPanel}>
          <img
            className={styles.badge}
            src={entry.badge}
            alt=""
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
          />
        </div>
        <span className={styles.divider} aria-hidden="true" />
        <div className={styles.content}>
          <h4 className={styles.org}>{entry.title}</h4>
          <p className={styles.metaLine}>
            {entry.summary.split(' | ').map((part, partIndex) => (
              <span className={styles.metaChunk} key={`${part}-${partIndex}`}>
                {partIndex === 0 ? part : `| ${part}`}
              </span>
            ))}
          </p>
          <p className={styles.detail}>{entry.detail}</p>
        </div>
      </div>
    </article>
  );
}

export default function Timeline() {
  return (
    <section className={styles.wrap} aria-label="学习与实习经历时间轴">
      <div className={styles.timeline}>
        <aside className={styles.groups} aria-label="经历分类">
          {GROUPS.map((group) => (
            <CategoryBlock group={group} key={group.lane} />
          ))}
        </aside>

        <div className={styles.entries}>
          {ENTRIES.map((entry, index) => (
            <TimelineEntry entry={entry} index={index} key={entry.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
