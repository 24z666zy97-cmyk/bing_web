/**
 * 滚动锁 —— 计数式，全站共用一个计数器。
 *
 * 站里有三处需要锁滚动：
 *   1. Loading 开场动画期间
 *   2. Hero 局部撕纸自动播放期间
 *   3. Content 全屏覆盖层 / Contact 面板打开时
 *
 * 为什么必须计数而不是布尔开关：如果各自写各自的 lock/unlock，
 * 后解锁的那个会把还需要锁定的状态一起解开。例如 Loading 结束时解锁，
 * 而局部撕纸还在播放中，页面就提前能滚了。
 *
 * 计数器保证：任意时刻只要还有一个持有者，就保持锁定；全部释放才解锁。
 *
 * 用法：
 *   const unlock = lockScroll('hero-local-tear');
 *   ...
 *   unlock();   // 幂等，重复调用无副作用
 *
 * 重要：局部撕纸的 requirements.md §7.0.1.1 要求 —— 正常完成、
 * reduced-motion 直接完成、异常超时降级，三种情况都必须解锁，
 * 禁止因资源或脚本失败永久锁页。所以调用方要用 try/finally 或超时兜底。
 */

type UnlockFn = () => void;

/** 当前持有者标识集合。用 Map 记数量，同一 id 可重复持有。 */
const holders = new Map<string, number>();

function totalHolders(): number {
  let sum = 0;
  for (const count of holders.values()) sum += count;
  return sum;
}

function applyLock(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (totalHolders() > 0) {
    if (root.dataset.scrollLocked === 'true') return;

    // 锁定前记录滚动条宽度，补偿到 padding-right，避免布局横跳
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    root.dataset.scrollLocked = 'true';
  } else {
    delete root.dataset.scrollLocked;
    root.style.removeProperty('--scrollbar-width');
  }
}

/**
 * 申请滚动锁。
 *
 * @param id 持有者标识，用于调试。例如 'loading'、'hero-local-tear'、'content-overlay'
 * @returns 释放函数。幂等。
 */
export function lockScroll(id: string): UnlockFn {
  holders.set(id, (holders.get(id) ?? 0) + 1);
  applyLock();

  let released = false;
  return () => {
    // 幂等：React 严格模式下 effect 清理可能跑两次
    if (released) return;
    released = true;

    const count = holders.get(id);
    if (count === undefined) return;

    if (count <= 1) {
      holders.delete(id);
    } else {
      holders.set(id, count - 1);
    }
    applyLock();
  };
}

/** 当前是否锁定。 */
export function isScrollLocked(): boolean {
  return totalHolders() > 0;
}

/** 当前持有者标识列表。仅用于调试永久锁页问题。 */
export function scrollLockHolders(): string[] {
  return [...holders.keys()];
}

/**
 * 强制解除全部滚动锁。
 *
 * 仅用于兜底：某个持有者异常退出没调 unlock，页面永久锁死。
 * 正常流程一律用 lockScroll 返回的函数。
 */
export function forceUnlockAll(): void {
  holders.clear();
  applyLock();
}
