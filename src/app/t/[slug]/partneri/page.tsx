'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { PartnerList } from '@/components/partners/PartnerList';

function PartneriPageInner() {
  const params = useParams<{ slug: string }>();
  return <PartnerList slug={params.slug} />;
}

export default function PartneriPage() {
  return (
    <Suspense fallback={<div className="loading">Učitavanje…</div>}>
      <PartneriPageInner />
    </Suspense>
  );
}
