'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { resetNavState } from '@/lib/nav-visibility';
import ContentSection from './Content/ContentSection';
import Nav from './Nav/Nav';

/**
 * 首页的客户端外壳。只负责持有跨组件的 UI 状态，让 app/page.tsx
 * 保持 server component。
 *
 * 现在持有：Content 覆盖层的开关。
 */
export default function HomeShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* 从子页返回首页时把导航打回隐藏态。子页会把 stage 置成 'torn'、
   * curlProgress 置成 1（PageShell），而 nav-visibility 是模块级单例，
   * 不重置的话 Hero 的撕纸开场会被跳过，导航一进首页就全亮。
   * content.md §9：返回首页视为全新进入。 */
  useEffect(() => {
    resetNavState();
  }, []);

  return (
    <>
      <Nav menuOpen={menuOpen} onMenuToggle={toggleMenu} />
      {children}

      {/* 菜单向下切出的 Content 覆盖层（content.md §1、§8） */}
      <ContentSection variant="overlay" open={menuOpen} onClose={closeMenu} />
    </>
  );
}
