'use client';

import { useEffect, useState } from 'react';
import styles from './SystemPage.module.css';

const ITEMS = [
  {
    id: 'modou-product-system',
    title: '墨斗云空间智能产品体系',
    icon: <><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 7h10M6.5 8.5l4.2 7.4M17.5 8.5l-4.2 7.4"/></>,
  },
  {
    id: 'modou-scenario-practice',
    title: '墨斗云场景应用实践',
    icon: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h3v3H8zM14 13h3v3h-3z"/></>,
  },
] as const;

export default function ProductEcosystemNavigation() {
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-28% 0px -55%', threshold: [0, .1, .5] });
    ITEMS.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  return <nav className={styles.ecosystemRail} aria-label="产品生态章节导航">
    {ITEMS.map(({ id, title, icon }) => <a className={active === id ? styles.ecosystemRailActive : undefined} href={`#${id}`} aria-label={title} aria-current={active === id ? 'location' : undefined} title={title} onClick={() => setActive(id)} key={id}><svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg></a>)}
  </nav>;
}
