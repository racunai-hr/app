'use client';

import { useParams } from 'next/navigation';

import { AssetCardShell } from '@/components/assets/AssetCardShell';
import { AssetDepreciationPanel } from '@/components/assets/AssetDepreciationPanel';

export default function ImovinaAmortizacijaPage() {
  const params = useParams<{ slug: string; id: string }>();
  const assetId = Number(params.id);
  return (
    <AssetCardShell slug={params.slug} assetId={assetId}>
      {({ origin, token }) => (
        <AssetDepreciationPanel
          slug={params.slug}
          origin={origin}
          token={token}
          assetId={assetId}
        />
      )}
    </AssetCardShell>
  );
}
