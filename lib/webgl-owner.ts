/**
 * WebGL 上下文占用者 —— 全站同时最多 1 个上下文。
 *
 * 首页 hero 的 sticker-forge 占一个，四个子页各自的 3D viewer 占一个。
 * 浏览器上下文上限约 8–16 个，超出后最旧的被强制丢弃，所以不能各页面随便开。
 *
 * 为什么要模块级单例（requirements.md §8.8）：客户端路由切换时，新旧页面的
 * 挂载/卸载顺序不保证干净 —— 新页面可能在旧页面卸载完成前就已挂载，两个上下文
 * 同时存在就超额。如果各组件在自己的 useEffect 里 destroy/dispose 碰运气，
 * 这个 bug 单独测某一页永远测不出来，只在跳转时概率性出现。
 *
 * 用法：
 *   const release = await acquireWebGL('home-sticker', () => sticker.destroy());
 *   // 拿到许可后才创建 canvas 和 renderer
 *   ...
 *   release();   // 卸载时调用
 *
 * 申请方拿不到许可就排队等待，等待期间页面应显示降级静态图，不留空白。
 */

type ReleaseFn = () => void;
type DisposeFn = () => void | Promise<void>;

interface Owner {
  /** 占用者标识，用于调试。例如 'home-sticker'、'system-viewer' */
  id: string;
  /** 释放上下文时调用：sticker.destroy() 或 viewer.dispose() + materials.dispose() */
  dispose: DisposeFn;
}

let current: Owner | null = null;

/** 等待队列。先申请的先拿到。 */
const queue: Array<() => void> = [];

/** 正在释放中。避免释放过程里又有人插队创建。 */
let releasing = false;

function drainQueue(): void {
  if (current || releasing) return;
  const next = queue.shift();
  if (next) next();
}

/**
 * 申请 WebGL 上下文。当前无人占用时立即返回，否则等待前一个释放。
 *
 * @param id 占用者标识
 * @param dispose 释放回调。必须完整销毁上下文，不能只隐藏 canvas。
 * @returns 释放函数。重复调用无副作用。
 */
export function acquireWebGL(id: string, dispose: DisposeFn): Promise<ReleaseFn> {
  return new Promise<ReleaseFn>((resolve) => {
    const grant = () => {
      current = { id, dispose };

      let released = false;
      const release: ReleaseFn = () => {
        // 幂等：React 严格模式下 effect 清理可能跑两次
        if (released) return;
        released = true;

        // 只有仍然持有许可时才真的释放。若已被 forceRelease 抢走，直接返回。
        if (current?.id !== id) return;

        releasing = true;
        const owner = current;
        current = null;

        void (async () => {
          try {
            await owner.dispose();
          } catch (error) {
            // 释放失败不能卡住队列，否则后续页面永远拿不到上下文
            console.error(`[webgl-owner] 释放 "${id}" 时出错`, error);
          } finally {
            releasing = false;
            drainQueue();
          }
        })();
      };

      resolve(release);
    };

    if (!current && !releasing) {
      grant();
    } else {
      queue.push(grant);
    }
  });
}

/** 当前占用者标识，无人占用时返回 null。仅用于调试和降级判断。 */
export function currentOwner(): string | null {
  return current?.id ?? null;
}

/** 是否有人正在占用或正在释放。等待中的页面用它决定是否显示降级图。 */
export function isWebGLBusy(): boolean {
  return current !== null || releasing;
}

/**
 * 强制释放当前占用者。
 *
 * 仅用于兜底：某个页面异常卸载没调 release，导致上下文泄漏。
 * 正常流程一律用 acquireWebGL 返回的 release 函数。
 */
export async function forceRelease(): Promise<void> {
  if (!current) return;
  const owner = current;
  current = null;
  releasing = true;
  try {
    await owner.dispose();
  } catch (error) {
    console.error(`[webgl-owner] 强制释放 "${owner.id}" 时出错`, error);
  } finally {
    releasing = false;
    drainQueue();
  }
}

/**
 * 检测 WebGL 可用性。不可用时页面走 CSS 降级分支。
 *
 * 用后即弃：探测本身会创建一个上下文，必须立刻丢掉，
 * 否则白占一个额度。
 */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
