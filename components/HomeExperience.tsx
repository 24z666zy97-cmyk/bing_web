'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { forceScrollToTop } from '@/lib/scroll-to-top';
import About from './About/About';
import ContentSection from './Content/ContentSection';
import Hero from './Hero/Hero';
import HomeShell from './HomeShell';
import Loading from './Loading/Loading';

/** Coordinates the homepage entrance so Hero cannot start behind Loading. */
export default function HomeExperience() {
  const [heroReady, setHeroReady] = useState(false);
  const startHero = useCallback(() => setHeroReady(true), []);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    let cancelReset = forceScrollToTop();
    const resetToHero = () => {
      cancelReset();
      cancelReset = forceScrollToTop();
    };
    window.addEventListener('pageshow', resetToHero);

    return () => {
      cancelReset();
      window.removeEventListener('pageshow', resetToHero);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  return (
    <>
      <Loading onFinish={startHero} />
      <div>
        <HomeShell>
          <main className="homeMain">
            <h1 className="srOnly">{'\u5f20\u96e8\u51b0 Zhang Yubing'}</h1>
            <Hero active={heroReady} />
            <About />
            <ContentSection />
          </main>
        </HomeShell>
      </div>
    </>
  );
}
