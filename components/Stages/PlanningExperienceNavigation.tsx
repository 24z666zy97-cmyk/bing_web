'use client';

import { useEffect, useState } from 'react';
import styles from './StagesPage.module.css';

const ITEMS = [
  { id: 'craftsmans-path', title: "CRAFTSMAN'S PATH", icon: <><path d="m4 19 2 2 10-10-2-2zM10 7l4-4 7 7-3 3-4-4-2 2z"/></> },
  { id: 'light-studio', title: 'LIGHT STUDIO', icon: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/></> },
  { id: 'habitat-0', title: 'HABITAT 0', icon: <><path d="M4 19v-7a8 8 0 0 1 16 0v7M3 19h18M9 19v-5h6v5"/><circle cx="12" cy="9" r="1.5"/></> },
] as const;

export default function PlanningExperienceNavigation() {
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-28% 0px -55%', threshold: [0, .1, .5] });
    ITEMS.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  return <nav className={styles.planningRail} aria-label="体验策划章节导航">
    {ITEMS.map(({ id, title, icon }) => <a className={active === id ? styles.planningRailActive : undefined} href={`#${id}`} aria-label={title} aria-current={active === id ? 'location' : undefined} title={title} onClick={() => setActive(id)} key={id}><svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg></a>)}
  </nav>;
}
