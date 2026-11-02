'use client';

import { useEffect, useState } from 'react';

import { DocumentTable } from '@/components/documents/DocumentTable';
import { ApiError } from '@/lib/api';
import { fetchDocuments, type DocumentSummary } from '@/lib/documents';

type Props = {
  slug: string;
  origin: string;
  token: string;
  assetId: number;
};

export function AssetDocumentsPanel({ slug, origin, token, assetId }: Props) {
  const [rows, setRows] = useState<DocumentSummary[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchDocuments(origin, token, { fixed_asset: assetId, page_size: 50 })
      .then((data) => {
        if (!cancelled) setRows(data.results);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Dokumenti nisu učitani.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, assetId]);

  if (error) return <div className="error">{error}</div>;
  if (loading || rows === null) return <div className="loading">Učitavanje…</div>;

  return (
    <div>
      <p className="banking-role-note">
        Dokumenti vezani na ovo vozilo ili OS (`?fixed_asset=`). Knjiženi RDG po mjestu troška je na
        kartici MT.
      </p>
      <DocumentTable rows={rows} slug={slug} />
    </div>
  );
}
