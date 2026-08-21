'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { DocumentList } from '@/components/documents/DocumentList';

function SaldakontiPageInner() {
  const params = useParams<{ slug: string }>();
  return <DocumentList slug={params.slug} />;
}

export default function SaldakontiPage() {
  return (
    <Suspense fallback={<div className="loading">Učitavanje…</div>}>
      <SaldakontiPageInner />
    </Suspense>
  );
}
