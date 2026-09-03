import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';

const archivo = localFont({
  src: [
    {
      path: '../prepare/fonts/archivo/Archivo-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../prepare/fonts/archivo/Archivo-Italic-Variable.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-archivo',
  display: 'swap',
});

const anybody = localFont({
  src: '../prepare/fonts/anybody/Anybody-Variable-latin.woff2',
  variable: '--font-anybody',
  display: 'swap',
  weight: '100 900',
  style: 'normal',
});

const sourceHan = localFont({
  src: [
    {
      path: '../public/fonts/source-han-home-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/source-han-home-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-source-han',
  display: 'swap',
  fallback: ['Microsoft YaHei', 'sans-serif'],
});

export const metadata: Metadata = {
  title: '张雨冰Zhang Yubing',
  description: '空间智能产品经理。产品体系、用户研究、视觉语言与项目叙事。',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={[archivo.variable, anybody.variable, sourceHan.variable].join(' ')}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
