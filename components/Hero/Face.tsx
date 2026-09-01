import Eyes from './Eyes';
import StickerTearFlap from './StickerTearFlap';
import styles from './Face.module.css';

/* Hero 三层结构的中层与顶层（hero-context.md §265）。
 *
 * 撕裂线在眼睛上方，把头分成两半：
 *   中层 肖像套 mask，只留撕裂线以下的脸 + 眼睛切片
 *   顶层 翻片（头顶那一片）+ 可见撕裂边缘
 *
 * 动画全在翻片上：progress 0 时头顶严丝合缝盖着，是一张完好
 * 的脸；progress→1 时头顶沿撕裂线向上掀开，露出脑内世界。
 * mask 保持静态，不需要逐帧改形状。
 *
 * tornpaper-shape 的 viewBox 与肖像、七张渲图同为 1068×1213，
 * 共用坐标系，不需要手工对位。
 */

interface FaceProps {
  /** 局部撕开进度 0..1 */
  progress: number;
  showShackFace?: boolean;
  forgeEnabled?: boolean;
  onFlapPrepared?: () => void;
  onEyesPrepared?: () => void;
}

export default function Face({
  progress,
  showShackFace = false,
  forgeEnabled = false,
  onFlapPrepared = () => {},
  onEyesPrepared = () => {},
}: FaceProps) {
  // Match the shader's curl-front mapping (uProgress * 1.08) so the
  // visible tear edge reaches the right side with the lifted flap.
  const edgeProgress = Math.min(1, progress * 1.08);
  return (
    <>
      <div className={styles.portrait} aria-hidden="true">
        <picture>
          <source
            type="image/avif"
            srcSet="/profile/avatar/hero-face-1-640w.avif 640w, /profile/avatar/hero-face-1.avif 1068w"
            sizes="(max-width: 640px) 100vw, 1068px"
          />
          <source
            type="image/webp"
            srcSet="/profile/avatar/hero-face-1-640w.webp 640w, /profile/avatar/hero-face-1.webp 1068w"
            sizes="(max-width: 640px) 100vw, 1068px"
          />
          <img
            src="/profile/avatar/hero-face-1.webp"
            alt=""
            width={1068}
            height={1213}
            /* 首屏主体，不能懒加载 */
            fetchPriority="high"
            decoding="async"
            className={styles.masked}
          />
        </picture>
      </div>

      <div
        className={styles.portrait}
        data-hidden={!showShackFace}
        aria-hidden="true"
      >
        <picture>
          <source
            type="image/avif"
            srcSet="/profile/avatar/shack-face-1-640w.avif 640w, /profile/avatar/shack-face-1.avif 1068w"
            sizes="(max-width: 640px) 100vw, 1068px"
          />
          <source
            type="image/webp"
            srcSet="/profile/avatar/shack-face-1-640w.webp 640w, /profile/avatar/shack-face-1.webp 1068w"
            sizes="(max-width: 640px) 100vw, 1068px"
          />
          <img
            src="/profile/avatar/shack-face-1.webp"
            alt=""
            width={1068}
            height={1213}
            loading="eager"
            decoding="async"
            className={styles.masked}
          />
        </picture>
      </div>

      {/* 眼睛必须夹在肖像和翻片之间：填进空眼窝，又要被掀起的
          头顶盖住。层序靠 DOM 顺序保证，别挪到 flap 后面。 */}
      <Eyes progress={progress} onPrepared={onEyesPrepared} />

      <StickerTearFlap
        enabled={forgeEnabled}
        progress={progress}
        onPrepared={onFlapPrepared}
      />

      {/* 可见撕裂边缘，盖住 mask 的硬边。内嵌 base64 的 SVG，
          当普通图片请求即可，不内联进 HTML。 */}
      <img
        src="/profile/tornpaper/tornpaper-visible-web-optimized.svg"
        alt=""
        width={1068}
        height={1213}
        decoding="async"
        className={styles.edge}
        style={
          {
            '--open': progress,
            '--edge-right': (1 - edgeProgress) * 100 + '%',
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
    </>
  );
}
