'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import styles from './About.module.css';

type LineRevealProps = {
  children: ReactNode;
  className?: string;
};

export default function LineReveal({ children, className }: LineRevealProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const text = textRef.current;
    if (!host || !text) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(text, { clearProps: 'all' });
      host.dataset.revealed = 'true';
      return;
    }

    const context = gsap.context(() => {
      gsap.set(text, {
        yPercent: 112,
        clipPath: 'inset(100% 0 0 0)',
        willChange: 'transform, clip-path',
      });
    }, host);

    let hasPlayed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasPlayed) return;
        hasPlayed = true;
        observer.disconnect();

        gsap.to(text, {
          yPercent: 0,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.05,
          ease: 'power3.out',
          clearProps: 'transform,clipPath,willChange',
          onComplete: () => {
            host.dataset.revealed = 'true';
          },
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(host);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(text);
      context.revert();
    };
  }, []);

  return (
    <span ref={hostRef} className={styles.revealLine}>
      <span ref={textRef} className={`${styles.revealMotion} ${className ?? ''}`}>
        {children}
      </span>
    </span>
  );
}
