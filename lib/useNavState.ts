'use client';

import { useSyncExternalStore } from 'react';
import { getNavState, subscribeNav } from './nav-visibility';

/* getNavState 每次返回新对象，useSyncExternalStore 会因引用变化
 * 反复重渲染。这里缓存快照，只在真正 emit 时更新引用。
 */
let cached = getNavState();

subscribeNav((next) => {
  cached = next;
});

function getSnapshot() {
  return cached;
}

/* 服务端渲染固定返回初始态：导航全部隐藏。
 * 这样 SSR 输出和首次客户端渲染一致，不会 hydration 报错。
 */
const serverSnapshot = { stage: 'closed' as const, curlProgress: 0 };

function getServerSnapshot() {
  return serverSnapshot;
}

/** 订阅导航显隐状态。见 lib/nav-visibility.ts 的说明。 */
export function useNavState() {
  return useSyncExternalStore(subscribeNav, getSnapshot, getServerSnapshot);
}
