export interface StickerPoint {
  x: number;
  y: number;
}

export interface StickerInstance {
  setOptions(options: Record<string, unknown>): void;
  resize(): void;
  setPeelProgress(
    progress: number,
    motion?: { origin: StickerPoint; target: StickerPoint },
  ): void;
  destroy(): void;
}

interface StickerForgeApi {
  createSticker(
    target: HTMLElement,
    options: Record<string, unknown>,
  ): Promise<StickerInstance>;
}

declare global {
  interface Window {
    StickerForge?: StickerForgeApi;
  }
}

let loader: Promise<StickerForgeApi> | null = null;

export function loadStickerForge(): Promise<StickerForgeApi> {
  if (window.StickerForge) return Promise.resolve(window.StickerForge);
  if (loader) return loader;

  loader = new Promise<StickerForgeApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/embed/sticker-forge.iife.js';
    script.async = true;
    script.dataset.stickerForge = 'true';
    script.onload = () =>
      window.StickerForge
        ? resolve(window.StickerForge)
        : reject(new Error('Sticker Forge loaded without exposing its API.'));
    script.onerror = () => reject(new Error('Sticker Forge failed to load.'));
    document.head.appendChild(script);
  }).catch((error) => {
    loader = null;
    throw error;
  });

  return loader;
}
