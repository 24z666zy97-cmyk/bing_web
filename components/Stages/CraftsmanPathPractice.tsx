'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StagesPage.module.css';

const PANEL_COUNT = 3;
const MEDIA_ROOT = '/portfolio/stages/craftsman';

type ResponsiveImageProps = {
  alt: string;
  name: 'overview' | 'front' | 'back';
  widths: number[];
};

function ResponsiveImage({ alt, name, widths }: ResponsiveImageProps) {
  const sourceSet = (extension: 'avif' | 'webp') => widths.map((width) => `${MEDIA_ROOT}/${name}-${width}.${extension} ${width}w`).join(', ');
  const fallbackWidth = widths.at(-1);
  return <picture>
    <source type="image/avif" srcSet={sourceSet('avif')} sizes="(max-width: 767px) 88vw, 62vw" />
    <source type="image/webp" srcSet={sourceSet('webp')} sizes="(max-width: 767px) 88vw, 62vw" />
    <img src={`${MEDIA_ROOT}/${name}-${fallbackWidth}.webp`} alt={alt} loading="lazy" decoding="async" />
  </picture>;
}

export function PlayIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 13 36 24 16 35Z" /></svg>;
}

export function BrowserBar() {
  return <div className={styles.craftsmanBrowserBar} aria-hidden="true">
    <span className={styles.craftsmanTraffic}><i /><i /><i /></span>
    <span className={styles.craftsmanBrowserPlus}><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
  </div>;
}

function EditorialCopy({ english, chinese, side, children }: { english: string[]; chinese: string; side: string; children: React.ReactNode }) {
  return <aside className={styles.craftsmanEditorialCopy} aria-label={`${english.join(' ')} ${chinese}`}>
    <header>
      <h3>{english.map((line) => <span key={line}>{line}</span>)}</h3>
      <h4>{chinese}</h4>
    </header>
    <p><em>Flyer {side}</em><span aria-hidden="true"> —— </span>{children}</p>
  </aside>;
}

export type ContentIconType = 'mic' | 'guide' | 'map' | 'team' | 'scene' | 'sample' | 'deconstruct' | 'formula' | 'preview' | 'route' | 'expand';

function ContentIcon({ type }: { type: ContentIconType }) {
  if (type === 'mic') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6" /></svg>;
  if (type === 'guide') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5A3.5 3.5 0 0 1 8 4h4v15H8a3.5 3.5 0 0 0-3.5 1.5zM19.5 5.5A3.5 3.5 0 0 0 16 4h-4v15h4a3.5 3.5 0 0 1 3.5 1.5z" /><path d="M7.5 8h2M14.5 8h2M7.5 11h2M14.5 11h2" /></svg>;
  if (type === 'map') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 6 5-2 7 2 5-2v14l-5 2-7-2-5 2zM8.5 4v14M15.5 6v14" /><path d="M11 9.5c1.4-1.2 3.3-1.2 4.7 0M14.8 8.8l.9.7-.9.8" /></svg>;
  if (type === 'team') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13h.5a5.5 5.5 0 0 1 5.5 5.5V20M14 14.2a4.8 4.8 0 0 1 6.5 4.5V20" /></svg>;
  if (type === 'scene') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="10" r="3.2" /><path d="M9 3.5v2M9 14.5v2M2.5 10h2M13.5 10h2M4.4 5.4l1.4 1.4M12.2 13.2l1.4 1.4M15.5 6.5c2.5.5 4 2.1 4.5 4.5M15.5 3c4.4.6 7 3.2 7.5 7.5" /></svg>;
  if (type === 'sample') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 4 5.5 5.5-9.2 9.2a3 3 0 0 1-2.1.8H5v-3.7a3 3 0 0 1 .9-2.1zM12.6 5.9l5.5 5.5M5 19.5h14" /><circle cx="8.2" cy="16.2" r=".8" /></svg>;
  if (type === 'deconstruct') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4" /><path d="M7.5 10.2v3.6M16.5 10.2v3.6" /></svg>;
  if (type === 'formula') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3" /><circle cx="13" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></svg>;
  if (type === 'preview') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 12s3.4-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.6" /><path d="m17.5 4.5 1.8-1.8M19.5 7h2.5M16 2v2.5" /></svg>;
  if (type === 'route') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="18" r="2" /><circle cx="19" cy="6" r="2" /><path d="M7 18h3a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h3M15 9l3-3-3-3" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="3" y="16" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M6 16v-4h12v4" /></svg>;
}

export function ContentItem({ active, chinese, icon, onSelect }: { active: boolean; chinese: string; icon: ContentIconType; onSelect: () => void }) {
  return <li className={styles.craftsmanContentItem} data-active={active}>
    <button type="button" onClick={onSelect} aria-pressed={active} aria-label={chinese}>
      <ContentIcon type={icon} />
      <strong><small>{chinese}</small></strong>
    </button>
  </li>;
}

export default function CraftsmanPathPractice() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [entryDistance, setEntryDistance] = useState(720);
  const [videoRequested, setVideoRequested] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const [mobileLayout, setMobileLayout] = useState(false);

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
      const root = rootRef.current, sticky = stickyRef.current;
      if (!root || !sticky) return;
      const rect = root.getBoundingClientRect();
      const travel = root.offsetHeight - window.innerHeight;
      const next = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
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
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [mobileLayout]);

  useEffect(() => {
    if (activePanel !== 0) videoRef.current?.pause();
  }, [activePanel]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mediaFrames = Array.from(root.querySelectorAll<HTMLElement>('[data-editorial-media]'));
    const syncHeight = (media: HTMLElement) => {
      media.parentElement?.style.setProperty('--craftsman-editorial-media-height', `${media.getBoundingClientRect().height}px`);
    };
    const observer = new ResizeObserver((entries) => entries.forEach((entry) => syncHeight(entry.target as HTMLElement)));
    mediaFrames.forEach((media) => { syncHeight(media); observer.observe(media); });
    return () => observer.disconnect();
  }, []);

  const requestVideo = () => {
    setVideoRequested(true);
    requestAnimationFrame(() => videoRef.current?.play().catch(() => undefined));
  };

  const selectPanel = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    if (mobileLayout) {
      root.querySelector<HTMLElement>(`[data-panel-index="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, root.offsetHeight - window.innerHeight);
    window.scrollTo({ top: rootTop + travel * (index / PANEL_COUNT), behavior: 'smooth' });
  };

  const panels = [
    <div className={styles.craftsmanOverviewFrame} key="overview">
      <ResponsiveImage name="overview" widths={[960, 1440, 1920]} alt="Craftsman’s Path 项目全景图" />
    </div>,
    <div className={styles.craftsmanEditorialLayout} key="front">
      <div className={styles.craftsmanEditorialImage} data-editorial-media><ResponsiveImage name="front" widths={[900, 1400, 1800]} alt="Craftsman’s Path 正面设计" /></div>
      <EditorialCopy english={["Journey", "Map"]} chinese="解密地图" side="正面">
        一张路线图，也是一份 Craftsman’s Path 的线索集合。沿着节点一路解锁场地、背景与故事，最终拼出一条连接过去与未来的完整路径。
      </EditorialCopy>
    </div>,
    <div className={styles.craftsmanEditorialLayout} key="back">
      <div className={styles.craftsmanEditorialImage} data-editorial-media><ResponsiveImage name="back" widths={[900, 1400, 1800]} alt="Craftsman’s Path 反面设计" /></div>
      <EditorialCopy english={["Meet", "the Team"]} chinese="伙伴介绍" side="反面">
        用角色、身份与分工，把一次正式汇报变成“结伴同行”。Presenter 不再只是讲述者，也成为旅程里的 Guide 与伙伴。
      </EditorialCopy>
    </div>,
  ];

  return <div ref={rootRef} className={styles.craftsmanPractice} aria-label="Craftsman’s Path 交互内容舞台">
    <div ref={stickyRef} className={styles.craftsmanSticky}>
      <aside className={styles.craftsmanFeatureCard} aria-label="左侧内容接口">
        <div className={styles.craftsmanFeatureStage}>
          <ul className={styles.craftsmanContentList}>
            <ContentItem active={activePanel === 0} chinese="开麦时刻" icon="mic" onSelect={() => selectPanel(0)} />
            <ContentItem active={activePanel === 1} chinese="活动宣传册" icon="guide" onSelect={() => selectPanel(1)} />
            <ContentItem active={activePanel === 2} chinese="解密地图" icon="map" onSelect={() => selectPanel(2)} />
            <ContentItem active={activePanel === 3} chinese="伙伴介绍" icon="team" onSelect={() => selectPanel(3)} />
          </ul>
        </div>
        <div className={styles.craftsmanFeatureCopy}>
          <h4><span>Presentation</span><span>as Experience</span></h4>
          <p>既然是 Craftsman’s Path，那就别只坐着听——尝试把一次 Pre 变成一场参观体验，邀请所有人一起走进故事。</p>
        </div>
      </aside>
      <div className={styles.craftsmanBoardStack} aria-label="Craftsman’s Path 项目媒体">
        <article className={`${styles.craftsmanBoard} ${styles.craftsmanBoardBase}`} data-media="wide" data-panel-index="0" aria-label="Craftsman’s Path 视频">
          <BrowserBar />
          <div className={styles.craftsmanVideoFrame}>
            {videoRequested ? <video ref={videoRef} src={`${MEDIA_ROOT}/craftsman-path.mp4`} controls playsInline preload="metadata" /> : <button className={styles.craftsmanVideoPoster} type="button" onClick={requestVideo} aria-label="播放 Craftsman’s Path 视频">
              <img className={styles.craftsmanVideoPosterImage} src={`${MEDIA_ROOT}/video-poster.webp`} alt="" loading="lazy" decoding="async" />
              <span className={styles.craftsmanPlayButton}><PlayIcon /></span>
            </button>}
          </div>
        </article>
        {Array.from({ length: PANEL_COUNT }, (_, index) => {
          const local = Math.min(1, Math.max(0, progress * PANEL_COUNT - index));
          return <article className={styles.craftsmanBoard} data-media={index === 0 ? 'wide' : 'editorial'} data-panel-index={index + 1} style={{ '--stack-index': index, transform: `translate3d(0, ${(1 - local) * entryDistance}px, 0)` } as React.CSSProperties} aria-label={`Craftsman’s Path 项目画面 ${index + 1}`} key={index}><BrowserBar />{panels[index]}</article>;
        })}
      </div>
    </div>
  </div>;
}
