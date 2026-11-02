'use client';

import { useParams } from 'next/navigation';

import { AssetCardShell } from '@/components/assets/AssetCardShell';
import { AssetJournalEntriesPanel } from '@/components/assets/AssetJournalEntriesPanel';

export default function ImovinaTemeljnicePage() {
  const params = useParams<{ slug: string; id: string }>();
  const assetId = Number(params.id);
  return (
    <AssetCardShell slug={params.slug} assetId={assetId}>
      {({ origin, token }) => (
        <AssetJournalEntriesPanel
          slug={params.slug}
          origin={origin}
          token={token}
          assetId={assetId}
        />
      )}
    </AssetCardShell>
  );
}
