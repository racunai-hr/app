'use client';

import { useParams } from 'next/navigation';

import { IncomingExpenseDetail } from '@/components/documents/IncomingExpenseDetail';

export default function IncomingDocumentDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const expenseId = Number(params.id);
  if (!Number.isFinite(expenseId) || expenseId <= 0) {
    return (
      <div className="docs-shell">
        <div className="error">Neispravan identifikator dokumenta.</div>
      </div>
    );
  }
  return <IncomingExpenseDetail slug={params.slug} expenseId={expenseId} />;
}
