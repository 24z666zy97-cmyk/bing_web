import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import SignalsPageContent from '@/components/Signals/SignalsPage';

export const metadata: Metadata = {
  title: '张雨冰Zhang Yubing | Signals',
  description: '视觉语言 · 信息设计 · 公共传播',
};

export default function SignalsPage() {
  return (
    <PageShell>
      <SignalsPageContent />
    </PageShell>
  );
}
