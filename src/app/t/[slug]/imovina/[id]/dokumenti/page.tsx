'use client';

import { useParams } from 'next/navigation';

import { AssetCardShell } from '@/components/assets/AssetCardShell';
import { AssetDocumentsPanel } from '@/components/assets/AssetDocumentsPanel';

export default function ImovinaDokumentiPage() {
  const params = useParams<{ slug: string; id: string }>();
  const assetId = Number(params.id);
  return (
    <AssetCardShell slug={params.slug} assetId={assetId}>
      {({ origin, token }) => (
        <AssetDocumentsPanel
          slug={params.slug}
          origin={origin}
          token={token}
          assetId={assetId}
        />
      )}
    </AssetCardShell>
  );
}
