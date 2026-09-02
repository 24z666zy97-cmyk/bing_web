'use client';

import { useEffect, useRef, useState } from 'react';
import { MobileCardCarouselControls, useMobileCardCarousel } from '@/components/MobileCardCarousel';
import { BrowserBar, ContentItem, PlayIcon } from './CraftsmanPathPractice';
import styles from './StagesPage.module.css';

const MEDIA_ROOT = '/portfolio/stages/light';
const pages = [
  { name: 'cover', alt: 'Light Studio 封面', english: ['Light', 'Studio'], chinese: '项目封面', label: 'Overview', copy: '以光为媒介，把自然现象转化为一段可以进入、观察并亲手触发的体验。' },
  { name: 'contents', alt: 'Light Studio 目录与场景', english: ['Concept', 'System'], chinese: '概念构思', label: 'Concept', copy: '梳理自然光的类型、情绪与材料关系，让不同光效能够被拆解并重新组合。' },
  { name: 'structure', alt: 'Light Studio 结构展示', english: ['Modular', 'Structure'], chinese: '结构展示', label: 'Structure', copy: '通过模块化框架、光源盒与可替换介质，形成便于操作和持续扩展的装置结构。' },
  { name: 'construction', alt: 'Light Studio 制作过程', english: ['Making', 'Process'], chinese: '制作过程', label: 'Process', copy: '从概念推演、光效模拟到结构建模与实体搭建，逐步校准光线、材料和交互方式。' },
  { name: 'analysis', alt: 'Light Studio 理论与细节分析', english: ['Light', 'Analysis'], chinese: '理论分析', label: 'Analysis', copy: '以光谱和介质实验验证不同自然场景的视觉特征，并把分析结果落实到构件细节中。' },
  { name: 'realization', alt: 'Light Studio 成果表现', english: ['Final', 'Outcome'], chinese: '成果表现', label: 'Result', copy: '不同模块共同生成可切换的光影状态，让使用者在操作中重新感受自然光的变化。' },
] as const;
const PANEL_COUNT = pages.length;

function LightImage({ name, alt }: { name: string; alt: string }) {
  const widths = [960, 1440, 1920];
  const set = (extension: 'avif' | 'webp') => widths.map((width) => `${MEDIA_ROOT}/${name}-${width}.${extension} ${width}w`).join(', ');
  return <picture>
    <source type="image/avif" srcSet={set('avif')} sizes="(max-width: 767px) 88vw, 62vw" />
    <source type="image/webp" srcSet={set('webp')} sizes="(max-width: 767px) 88vw, 62vw" />
    <img src={`${MEDIA_ROOT}/${name}-1920.webp`} alt={alt} loading="lazy" decoding="async" />
  </picture>;
}

function IndependentImage({ name, alt }: { name: string; alt: string }) {
  const widths = [480, 720, 960];
  const set = (extension: 'avif' | 'webp') => widths.map((width) => `${MEDIA_ROOT}/${name}-${width}.${extension} ${width}w`).join(', ');
  return <picture>
    <source type="image/avif" srcSet={set('avif')} sizes="(max-width: 1100px) 88vw, 16vw" />
    <source type="image/webp" srcSet={set('webp')} sizes="(max-width: 1100px) 88vw, 16vw" />
    <img src={`${MEDIA_ROOT}/${name}-960.webp`} alt={alt} loading="lazy" decoding="async" />
  </picture>;
}

function LightEditorialCopy({ page }: { page: (typeof pages)[number] }) {
  return <aside className={styles.craftsmanEditorialCopy} aria-label={`${page.english.join(' ')} ${page.chinese}`}>
    <header>
      <h3>{page.english.map((line) => <span key={line}>{line}</span>)}</h3>
      <h4>{page.chinese}</h4>
    </header>
    <p><em>{page.label}</em><span aria-hidden="true"> —— </span>{page.copy}</p>
  </aside>;
}

export default function LightStudioPractice() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [entryDistance, setEntryDistance] = useState(720);
  const [activePanel, setActivePanel] = useState(0);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const carousel = useMobileCardCarousel(PANEL_COUNT + 1, rootRef, mediaPlaying);
  const displayedPanel = carousel.enabled ? carousel.index : activePanel;

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1100px)');
    const update = () => setMobileLayout(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
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
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [mobileLayout]);

  useEffect(() => {
    if (!mobileLayout) return;
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-panel-index]'));
    const update = () => {
      const center = window.innerHeight / 2;
      const closest = cards.reduce((best, card) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        return distance < best.distance ? { card, distance } : best;
      }, { card: cards[0], distance: Number.POSITIVE_INFINITY });
      if (closest.card) setActivePanel(Number(closest.card.dataset.panelIndex));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [mobileLayout]);

  useEffect(() => { if (displayedPanel !== 0) videoRef.current?.pause(); }, [displayedPanel]);

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

  const group = displayedPanel === 0 ? 0 : displayedPanel <= 2 ? 1 : displayedPanel <= 4 ? 2 : 3;
  const conceptIndependentEntry = Math.min(1, Math.max(0, progress * PANEL_COUNT));
  const structureIndependentEntry = Math.min(1, Math.max(0, progress * PANEL_COUNT - 2));
  const conceptIndependentTransform = `translate3d(0, ${(1 - conceptIndependentEntry) * entryDistance}px, 0)`;
  const structureIndependentTransform = `translate3d(0, ${(1 - structureIndependentEntry) * entryDistance}px, 0)`;
  // Keep the video nearly solid at the start, then accelerate its fade as the
  // first editorial card approaches its resting position.
  const videoOpacity = mobileLayout ? 1 : conceptIndependentEntry >= .99 ? 0 : 1 - Math.pow(conceptIndependentEntry, 3);
  return <div ref={rootRef} className={`${styles.craftsmanPractice} ${styles.lightStudioPractice}`} aria-label="Light Studio 交互内容舞台">
    <div ref={stickyRef} className={styles.craftsmanSticky}>
      <aside className={styles.craftsmanFeatureCard} aria-label="Light Studio 内容接口">
        <div className={styles.craftsmanFeatureStage}>
          <ul className={styles.craftsmanContentList}>
            <ContentItem active={group === 0} chinese="动态光景" icon="scene" onSelect={() => selectPanel(0)} />
            <ContentItem active={group === 1} chinese="光感采样" icon="sample" onSelect={() => selectPanel(1)} />
            <ContentItem active={group === 2} chinese="系统解构" icon="deconstruct" onSelect={() => selectPanel(3)} />
            <ContentItem active={group === 3} chinese="光影配方" icon="formula" onSelect={() => selectPanel(5)} />
          </ul>
        </div>
        <div className={styles.craftsmanFeatureCopy}>
          <h4><span>Process</span><span>into Story</span></h4>
          <p>与其把成果按顺序摊开，不如重新“剪辑”一次——把关于 Light Studio 的概念、材料、构造与光效讲成一串故事。</p>
        </div>
      </aside>
      <div className={styles.lightStudioMediaStage}>
      <div className={styles.craftsmanBoardStack} data-mobile-carousel={carousel.enabled || undefined} data-carousel-direction={carousel.direction ?? undefined} onPointerDown={carousel.onPointerDown} onPointerUp={carousel.onPointerUp} aria-label="Light Studio 项目媒体">
        <article className={`${styles.craftsmanBoard} ${styles.craftsmanBoardBase}`} data-media="wide" data-panel-index="0" data-carousel-position={carousel.getPosition(0)} style={{ opacity: videoOpacity, pointerEvents: videoOpacity < .01 ? 'none' : undefined }} aria-label="Light Studio 视频">
          <BrowserBar />
          <div className={styles.craftsmanVideoFrame}>
            {videoRequested ? <video ref={videoRef} src={`${MEDIA_ROOT}/light-studio.mp4`} controls playsInline preload="metadata" onPlay={() => setMediaPlaying(true)} onPause={() => setMediaPlaying(false)} onEnded={() => setMediaPlaying(false)} /> : <button className={styles.craftsmanVideoPoster} type="button" onClick={requestVideo} aria-label="播放 Light Studio 视频">
              <video src={`${MEDIA_ROOT}/light-studio.mp4#t=0.01`} muted playsInline preload="auto" aria-hidden="true" />
              <span className={styles.craftsmanPlayButton}><PlayIcon /></span>
            </button>}
          </div>
        </article>
        <aside className={`${styles.lightStudioFixedVisual} ${styles.lightStudioFixedConcept}`} style={{ opacity: mobileLayout || conceptIndependentEntry > .001 ? 1 : 0, transform: conceptIndependentTransform }} aria-label="Light Studio 概念构思固定图">
          <BrowserBar />
          <div className={styles.lightStudioFixedFrame}>
            <IndependentImage name="independent-concept" alt="Light Studio 概念构思独立图" />
          </div>
        </aside>
        <aside className={`${styles.lightStudioFixedVisual} ${styles.lightStudioFixedStructure}`} style={{ opacity: mobileLayout || structureIndependentEntry > .001 ? 1 : 0, transform: structureIndependentTransform }} aria-label="Light Studio 结构制作与分析成果固定图">
          <BrowserBar />
          <div className={styles.lightStudioFixedFrame}>
            <IndependentImage name="independent" alt="Light Studio 结构制作与分析成果独立图" />
          </div>
        </aside>
        {pages.map((page, index) => {
          const local = Math.min(1, Math.max(0, progress * PANEL_COUNT - index));
          return <article className={styles.craftsmanBoard} data-media="editorial" data-panel-index={index + 1} data-carousel-position={carousel.getPosition(index + 1)} style={{ '--stack-index': index, transform: `translate3d(0, ${(1 - local) * entryDistance}px, 0)` } as React.CSSProperties} aria-label={page.alt} key={page.name}>
            <BrowserBar />
            <div className={styles.craftsmanEditorialLayout}>
              <div className={`${styles.craftsmanEditorialImage} ${styles.lightStudioPage}`}><LightImage name={page.name} alt={page.alt} /></div>
              <LightEditorialCopy page={page} />
            </div>
          </article>;
        })}
        <MobileCardCarouselControls label="Light Studio" onPrevious={() => carousel.select(carousel.index - 1)} onNext={() => carousel.select(carousel.index + 1)} />
      </div>
      </div>
    </div>
  </div>;
}
