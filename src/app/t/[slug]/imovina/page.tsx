'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { FixedAssetList } from '@/components/assets/FixedAssetList';

function ImovinaPageInner() {
  const params = useParams<{ slug: string }>();
  return <FixedAssetList slug={params.slug} />;
}

export default function ImovinaPage() {
  return (
    <Suspense fallback={<div className="loading">Učitavanje…</div>}>
      <ImovinaPageInner />
    </Suspense>
  );
}
