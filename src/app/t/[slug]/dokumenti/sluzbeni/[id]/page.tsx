'use client';

import { useParams } from 'next/navigation';

import { OfficialDocumentDetail } from '@/components/documents/OfficialDocumentDetail';

export default function OfficialDocumentDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const documentId = Number(params.id);
  if (!Number.isFinite(documentId) || documentId <= 0) {
    return (
      <div className="docs-shell">
        <div className="error">Neispravan identifikator dokumenta.</div>
      </div>
    );
  }
  return <OfficialDocumentDetail slug={params.slug} documentId={documentId} />;
}
