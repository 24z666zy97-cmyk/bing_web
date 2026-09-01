/**
 * 导航三件套的显隐状态。
 *
 * 为什么单独一个模块：三者的出现时机全部由 Hero 的撕纸进度驱动
 * （content.md §10），但 Hero 是最后做的一步。如果让导航组件直接
 * 读 Hero 内部状态，两边就互相依赖了。这里做一个中间层：
 *   - Hero 完成局部撕开后调 setNavStage('torn')
 *   - Hero 整张卷起时持续调 setCurlProgress(0..1)
 *   - 导航组件订阅，自己决定怎么渲染
 *
 * Hero 已接入，两个 setter 都由 Hero 调用。子页没有 Hero，
 * 需要自己把 stage 置为 'torn'，否则导航永远不出现。
 */

/** 撕纸阶段。菜单与 CONTACT 在 'torn' 之后才出现。 */
export type NavStage =
  /** 局部撕开未完成：三者全部隐藏 */
  | 'closed'
  /** 局部撕开完成：菜单 + CONTACT 切入，Indicator 仍隐藏 */
  | 'torn';

interface NavState {
  stage: NavStage;
  /** 整张卷起进度 0..1。Indicator 跟着它淡入淡出。 */
  curlProgress: number;
}

type Listener = (state: NavState) => void;

let state: NavState = { stage: 'closed', curlProgress: 0 };
const listeners = new Set<Listener>();

function emit(): void {
  // 复制一份再发，避免订阅者拿到可变引用后改坏内部状态
  const snapshot: NavState = { ...state };
  for (const listener of listeners) listener(snapshot);
}

export function getNavState(): NavState {
  return { ...state };
}

export function setNavStage(stage: NavStage): void {
  if (state.stage === stage) return;
  state = { ...state, stage };
  emit();
}

export function setCurlProgress(progress: number): void {
  const clamped = Math.min(1, Math.max(0, progress));
  if (state.curlProgress === clamped) return;
  state = { ...state, curlProgress: clamped };
  emit();
}

/**
 * 路由离开首页后再返回时重置（content.md §9：视为全新进入）。
 */
export function resetNavState(): void {
  state = { stage: 'closed', curlProgress: 0 };
  emit();
}

export function subscribeNav(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
