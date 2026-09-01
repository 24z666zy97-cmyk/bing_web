export function forceScrollToTop(): () => void {
  const root = document.documentElement;
  const previousValue = root.style.getPropertyValue('scroll-behavior');
  const previousPriority = root.style.getPropertyPriority('scroll-behavior');
  root.style.setProperty('scroll-behavior', 'auto', 'important');

  const reset = () => {
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  let restored = false;
  let secondFrame = 0;
  const restore = () => {
    if (restored) return;
    restored = true;
    if (previousValue) {
      root.style.setProperty('scroll-behavior', previousValue, previousPriority);
    } else {
      root.style.removeProperty('scroll-behavior');
    }
  };

  reset();
  const firstFrame = requestAnimationFrame(() => {
    reset();
    secondFrame = requestAnimationFrame(() => {
      reset();
      restore();
    });
  });

  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
    restore();
  };
}

export function smoothScrollToTop(duration = 480): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return forceScrollToTop();
  }

  const root = document.documentElement;
  const previousValue = root.style.getPropertyValue('scroll-behavior');
  const previousPriority = root.style.getPropertyPriority('scroll-behavior');
  root.style.setProperty('scroll-behavior', 'auto', 'important');

  const startY = window.scrollY;
  let frame = 0;
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    if (previousValue) {
      root.style.setProperty('scroll-behavior', previousValue, previousPriority);
    } else {
      root.style.removeProperty('scroll-behavior');
    }
  };

  if (startY <= 0) {
    restore();
    return () => {};
  }

  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY * (1 - eased));

    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      window.scrollTo(0, 0);
      restore();
    }
  };
  frame = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(frame);
    restore();
  };
}
