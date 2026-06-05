'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const EnVivoTab = dynamic(() => import('@/components/dashboard/EnVivoTab'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <Loader2 size={20} className="animate-spin text-emerald-500" />
    </div>
  ),
});

export default function EnVivoPage() {
  return <EnVivoTab />;
}
