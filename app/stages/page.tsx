import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import StagesPageContent from '@/components/Stages/StagesPage';

export const metadata: Metadata = {
  title: '张雨冰Zhang Yubing | Stages',
  description: '项目叙事 · 展示设计 · 体验策划',
};

export default function StagesPage() {
  return <PageShell><StagesPageContent /></PageShell>;
}
