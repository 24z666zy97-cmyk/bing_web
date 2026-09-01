import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 全站 SSG，跑在 Vercel 上。不用 ISR / SSR / Server Actions。
  reactStrictMode: true,
  // 生成可直接上传到普通静态 Web Hosting 的文件包。
  output: 'export',
  trailingSlash: true,
  // 开发服务器与生产导出使用不同缓存目录，避免同时运行时互相覆盖资源。
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',

  // 原生 View Transitions 做页面转场（requirements.md §14 第 7 条已定）。
  // 不支持的浏览器自动降级为直接切换，不报错、不需要 polyfill。
  experimental: {
    viewTransition: true,
  },

  images: {
    // 只用本地素材，不接远程图片（agent.md 红线 3）。
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
};

export default nextConfig;
