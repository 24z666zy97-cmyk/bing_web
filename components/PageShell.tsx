'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { setCurlProgress, setNavStage } from '@/lib/nav-visibility';
import ContentSection from './Content/ContentSection';
import Nav from './Nav/Nav';

/**
 * 四个子页的客户端外壳，和 HomeShell 平级。
 *
 * 子页没有 Hero，所以没有撕纸进度去驱动导航。这里在挂载时直接把
 * 导航置成完成态：
 *   stage='torn'      菜单 + CONTACT 立即可见，否则子页进去出不来
 *   curlProgress=1    Indicator 常显。它的 opacity 绑在卷起进度上，
 *                     子页不置 1 的话身份标识和「回到顶部」永远不出现。
 *
 * 首页的 Hero 会在入场时把这两个值改回去（nav-visibility 是模块级
 * 单例，跨路由共享），所以这里不需要在卸载时重置。
 */
export default function PageShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setNavStage('torn');
    setCurlProgress(1);
  }, []);

  return (
    <>
      <Nav menuOpen={menuOpen} onMenuToggle={toggleMenu} indicatorHref="/" />
      {children}

      <ContentSection variant="overlay" open={menuOpen} onClose={closeMenu} />
    </>
  );
}
