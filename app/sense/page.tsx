import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import SensePageContent from '@/components/Sense/SensePage';

export const metadata: Metadata = {
  title: '张雨冰Zhang Yubing | Sense',
  description: '用户研究 · 场景洞察 · 策略转化',
};

export default function SensePage() {
  return (
    <PageShell>
      <SensePageContent />
    </PageShell>
  );
}
