'use client';

import { useParams } from 'next/navigation';

import { OutgoingInvoiceDetail } from '@/components/documents/OutgoingInvoiceDetail';

export default function OutgoingDocumentDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const invoiceId = Number(params.id);
  if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
    return (
      <div className="docs-shell">
        <div className="error">Neispravan identifikator dokumenta.</div>
      </div>
    );
  }
  return <OutgoingInvoiceDetail slug={params.slug} invoiceId={invoiceId} />;
}
