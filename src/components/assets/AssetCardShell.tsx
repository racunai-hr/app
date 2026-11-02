'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import {
  assetOriginLabel,
  fetchFixedAsset,
  fixedAssetStatusLabel,
  type FixedAssetDetail,
} from '@/lib/assets';
import { clearTokens } from '@/lib/auth';

import { AssetSubnav } from './AssetSubnav';
import { useAssetsSession } from './useAssetsSession';

type Props = {
  slug: string;
  assetId: number;
  children: (ctx: { origin: string; token: string; asset: FixedAssetDetail }) => ReactNode;
};

export function AssetCardShell({ slug, assetId, children }: Props) {
  const router = useRouter();
  const { session, loading: sessionLoading, error: sessionError } = useAssetsSession(slug);
  const [asset, setAsset] = useState<FixedAssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session || !Number.isFinite(assetId) || assetId <= 0) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchFixedAsset(session.origin, session.token, assetId)
      .then((data) => {
        if (!cancelled) setAsset(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Imovina se nije učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, assetId, router]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <p>
            <Link href={`/t/${slug}/imovina`}>← Imovina</Link>
          </p>
          <h1>{asset?.name || (loading ? 'Učitavanje…' : 'Imovina')}</h1>
          {asset && (
            <p>
              {fixedAssetStatusLabel(asset.status)} · {assetOriginLabel(asset.origin)} ·{' '}
              {asset.inventory_number || '—'}
            </p>
          )}
        </div>
      </header>

      {Number.isFinite(assetId) && assetId > 0 && <AssetSubnav slug={slug} assetId={assetId} />}

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(sessionLoading || loading) && !asset && <div className="loading">Učitavanje…</div>}

      {session && asset && children({ origin: session.origin, token: session.token, asset })}
    </section>
  );
}
