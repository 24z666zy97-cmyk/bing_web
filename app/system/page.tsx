import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import SystemPageContent from '@/components/System/SystemPage';

export const metadata: Metadata = {
  title: '张雨冰Zhang Yubing | System',
  description: '产品体系 · 数据底座 · AI 工作流。我如何组织与落地复杂产品。',
};

export default function SystemPage() {
  return (
    <PageShell>
      <SystemPageContent />
    </PageShell>
  );
}
