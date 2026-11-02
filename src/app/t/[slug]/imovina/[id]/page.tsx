'use client';

import { useParams } from 'next/navigation';

import { AssetCardShell } from '@/components/assets/AssetCardShell';
import { AssetOverview } from '@/components/assets/AssetOverview';

export default function ImovinaPregledPage() {
  const params = useParams<{ slug: string; id: string }>();
  const assetId = Number(params.id);
  return (
    <AssetCardShell slug={params.slug} assetId={assetId}>
      {({ asset }) => <AssetOverview slug={params.slug} asset={asset} />}
    </AssetCardShell>
  );
}
