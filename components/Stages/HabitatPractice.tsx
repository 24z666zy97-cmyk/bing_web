'use client';

import { useEffect, useRef, useState } from 'react';
import { MobileCardCarouselControls, useMobileCardCarousel } from '@/components/MobileCardCarousel';
import { BrowserBar, ContentItem, PlayIcon } from './CraftsmanPathPractice';
import styles from './StagesPage.module.css';

const MEDIA_ROOT = '/portfolio/stages/habitat';
const PANEL_COUNT = 2;

function BookingFlowImage() {
  const widths = [960, 1440, 1920];
  const set = (extension: 'avif' | 'webp') => widths.map((width) => `${MEDIA_ROOT}/booking-flow-${width}.${extension} ${width}w`).join(', ');
  return <picture>
    <source type="image/avif" srcSet={set('avif')} sizes="(max-width: 767px) 88vw, 62vw" />
    <source type="image/webp" srcSet={set('webp')} sizes="(max-width: 767px) 88vw, 62vw" />
    <img src={`${MEDIA_ROOT}/booking-flow-1920.webp`} alt="Habitat 0 移动端共享办公盒子预约流程" loading="lazy" decoding="async" />
  </picture>;
}

export default function HabitatPractice() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const motionRef = useRef<HTMLVideoElement>(null);
  const [videoRequested, setVideoRequested] = useState(false);
  const [progress, setProgress] = useState(0);
  const [entryDistance, setEntryDistance] = useState(720);
  const [activePanel, setActivePanel] = useState(0);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [stageVisible, setStageVisible] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const carousel = useMobileCardCarousel(PANEL_COUNT + 1, rootRef, mediaPlaying);
  const displayedPanel = carousel.enabled ? carousel.index : activePanel;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 1100px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMobile = () => setMobileLayout(mobileQuery.matches);
    const updateMotion = () => setReduceMotion(motionQuery.matches);
    updateMobile();
    updateMotion();
    mobileQuery.addEventListener('change', updateMobile);
    motionQuery.addEventListener('change', updateMotion);
    return () => {
      mobileQuery.removeEventListener('change', updateMobile);
      motionQuery.removeEventListener('change', updateMotion);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setStageVisible(entry.isIntersecting), { threshold: .05 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileLayout) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = rootRef.current;
      const sticky = stickyRef.current;
      if (!root || !sticky) return;
      const travel = root.offsetHeight - window.innerHeight;
      const next = travel > 0 ? Math.min(1, Math.max(0, -root.getBoundingClientRect().top / travel)) : 0;
      const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;
      setEntryDistance(Math.max(sticky.offsetHeight, window.innerHeight - stickyTop));
      setProgress(next);
      setActivePanel(Math.min(PANEL_COUNT, Math.floor(next * PANEL_COUNT + .08)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [mobileLayout]);

  useEffect(() => {
    if (!mobileLayout) return;
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-panel-index]'));
    let frame = 0;
    const update = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      const closest = cards.reduce((best, card) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        return distance < best.distance ? { card, distance } : best;
      }, { card: cards[0], distance: Number.POSITIVE_INFINITY });
      if (closest.card) setActivePanel(Number(closest.card.dataset.panelIndex));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [mobileLayout]);

  useEffect(() => {
    if (displayedPanel !== 0 || !stageVisible) videoRef.current?.pause();
  }, [displayedPanel, stageVisible]);

  useEffect(() => {
    const motion = motionRef.current;
    if (!motion) return;
    if (displayedPanel === 2 && stageVisible && !reduceMotion) motion.play().catch(() => undefined);
    else motion.pause();
  }, [displayedPanel, reduceMotion, stageVisible]);

  const requestVideo = () => {
    setVideoRequested(true);
    requestAnimationFrame(() => videoRef.current?.play().catch(() => undefined));
  };

  const selectPanel = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    if (carousel.enabled) {
      carousel.select(index);
      return;
    }
    if (mobileLayout) {
      root.querySelector<HTMLElement>(`[data-panel-index="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, root.offsetHeight - window.innerHeight);
    window.scrollTo({ top: rootTop + travel * (index / PANEL_COUNT), behavior: 'smooth' });
  };

  const panels = [
    <div className={styles.craftsmanOverviewFrame} key="booking-flow"><BookingFlowImage /></div>,
    reduceMotion
      ? <div className={styles.craftsmanOverviewFrame} key="motion-poster"><img src={`${MEDIA_ROOT}/motion-poster.webp`} alt="Habitat 0 盒体结构与功能演示" loading="lazy" decoding="async" /></div>
      : <div className={styles.craftsmanVideoFrame} key="motion-video"><video ref={motionRef} src={`${MEDIA_ROOT}/habitat-motion.mp4`} poster={`${MEDIA_ROOT}/motion-poster.webp`} muted loop playsInline preload="metadata" aria-label="Habitat 0 盒体结构与功能循环演示" /></div>,
  ];

  return <div ref={rootRef} className={`${styles.craftsmanPractice} ${styles.habitatPractice}`} aria-label="Habitat 0 交互内容舞台">
    <div ref={stickyRef} className={styles.craftsmanSticky}>
      <aside className={styles.craftsmanFeatureCard} aria-label="Habitat 0 内容接口">
        <div className={styles.craftsmanFeatureStage}>
          <ul className={styles.craftsmanContentList}>
            <ContentItem active={displayedPanel === 0} chinese="生活预演" icon="preview" onSelect={() => selectPanel(0)} />
            <ContentItem active={displayedPanel === 1} chinese="使用路径" icon="route" onSelect={() => selectPanel(1)} />
            <ContentItem active={displayedPanel === 2} chinese="系统展开" icon="expand" onSelect={() => selectPanel(2)} />
          </ul>
        </div>
        <div className={styles.craftsmanFeatureCopy}>
          <h4><span>Living</span><span>through Scenes</span></h4>
          <p>从预约到体验，从单一使用路径逐步展开至完整系统——让机制、服务和空间在使用体验中被一点点看见。</p>
        </div>
      </aside>
      <div className={styles.craftsmanBoardStack} data-mobile-carousel={carousel.enabled || undefined} data-carousel-direction={carousel.direction ?? undefined} onPointerDown={carousel.onPointerDown} onPointerUp={carousel.onPointerUp} aria-label="Habitat 0 项目媒体">
        <article className={`${styles.craftsmanBoard} ${styles.craftsmanBoardBase}`} data-media="wide" data-panel-index="0" data-carousel-position={carousel.getPosition(0)} aria-label="Habitat 0 视频">
          <BrowserBar />
          <div className={styles.craftsmanVideoFrame}>
            {videoRequested
              ? <video ref={videoRef} src={`${MEDIA_ROOT}/habitat-0.mp4`} controls playsInline preload="metadata" onPlay={() => setMediaPlaying(true)} onPause={() => setMediaPlaying(false)} onEnded={() => setMediaPlaying(false)} />
              : <button className={styles.craftsmanVideoPoster} type="button" onClick={requestVideo} aria-label="播放 Habitat 0 视频">
                <img className={styles.craftsmanVideoPosterImage} src={`${MEDIA_ROOT}/video-poster.webp`} alt="" loading="lazy" decoding="async" />
                <span className={styles.craftsmanPlayButton}><PlayIcon /></span>
              </button>}
          </div>
        </article>
        {panels.map((panel, index) => {
          const local = Math.min(1, Math.max(0, progress * PANEL_COUNT - index));
          return <article className={styles.craftsmanBoard} data-media="wide" data-panel-index={index + 1} data-carousel-position={carousel.getPosition(index + 1)} style={{ '--stack-index': index, transform: `translate3d(0, ${(1 - local) * entryDistance}px, 0)` } as React.CSSProperties} aria-label={`Habitat 0 项目画面 ${index + 1}`} key={index}>
            <BrowserBar />
            {panel}
          </article>;
        })}
        <MobileCardCarouselControls label="Habitat 0" onPrevious={() => carousel.select(carousel.index - 1)} onNext={() => carousel.select(carousel.index + 1)} />
      </div>
    </div>
  </div>;
}
