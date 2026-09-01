/**
 * 四个内容分类的唯一定义源。
 *
 * 为什么集中在这里：同一套分类要出现在至少三处（首页 Content 区块、
 * 菜单切出的全屏覆盖层、四个子页的页尾互跳），子页还要继承自己的
 * 强调色和代表素材（content.md §9）。分散写会导致改一个标题要改四处，
 * 迟早不一致。
 */

/** 子页强调色。子页继承所选项目的强调色（content.md §9）。
 *
 * 只用 design.md 已定的 6 色色板内的颜色，不新增色。四个分类分到
 * 蓝 / 粉 / 黄三色 + 粉（hot 仅装饰不可用于文字，故不进这里）。
 * SENSE 与 STAGES 都用粉，靠子页自身排版区分，不为凑四色破色板。
 */
export type SectionAccent = '--color-blue' | '--color-pink' | '--color-yellow';

export interface Section {
  /** 编号 01–04，显示用，不参与逻辑 */
  readonly num: string;
  /** 超大标题，必须严格为这四个词（content.md §13） */
  readonly title: string;
  /** hover 时从下侧切出的替换文字（content.md §7） */
  readonly tagline: string;
  readonly href: string;
  /** hover 时胶囊右侧浮现的代表素材，位于 /profile/7-items/ */
  readonly asset: string;
  readonly accent: SectionAccent;
}

export const SECTIONS: readonly Section[] = [
  {
    num: '01',
    title: 'SYSTEM',
    tagline: '产品体系 · 数据底座 · AI工作流',
    href: '/system',
    asset: 'molecularFormula',
    accent: '--color-blue',
  },
  {
    num: '02',
    title: 'SENSE',
    tagline: '用户研究 · 场景洞察 · 策略转化',
    href: '/sense',
    asset: 'analyticsClipboard',
    accent: '--color-pink',
  },
  {
    num: '03',
    title: 'SIGNALS',
    tagline: '视觉语言 · 信息设计 · 公共传播',
    href: '/signals',
    asset: 'glasses',
    accent: '--color-yellow',
  },
  {
    num: '04',
    title: 'STAGES',
    tagline: '项目叙事 · 展示设计 · 体验策划',
    href: '/stages',
    asset: 'voicemic',
    accent: '--color-pink',
  },
] as const;

/** 子页用：按路由取回自己的分类定义，用于继承标题与强调色。 */
export function getSection(href: string): Section | undefined {
  return SECTIONS.find((section) => section.href === href);
}
