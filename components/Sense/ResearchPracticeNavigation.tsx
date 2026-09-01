'use client';

import { useEffect, useState } from 'react';
import styles from './SensePage.module.css';

const ITEMS = [
  { id: 'organizing-complexity', title: '复杂信息的组织', icon: <><path d="M5 6h14M7 12h10M9 18h6" /></> },
  { id: 'building-evaluation', title: '评价体系的建立', icon: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></> },
] as const;

export default function ResearchPracticeNavigation() {
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-28% 0px -55%', threshold: [0, .1, .5] });
    ITEMS.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  return <nav className={styles.practiceRail} aria-label="研究实践章节导航">
    {ITEMS.map(({ id, title, icon }) => <a className={active === id ? styles.practiceRailActive : undefined} href={`#${id}`} aria-label={title} aria-current={active === id ? 'location' : undefined} title={title} onClick={() => setActive(id)} key={id}><svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg></a>)}
  </nav>;
}
