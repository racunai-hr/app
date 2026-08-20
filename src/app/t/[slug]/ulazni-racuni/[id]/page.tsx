'use client';

import { useParams } from 'next/navigation';

import { InvoiceReview } from '@/components/purchasing/InvoiceReview';

export default function UlazniRacunNacrtPage() {
  const params = useParams<{ slug: string; id: string }>();
  const importId = Number(params.id);
  if (!Number.isFinite(importId)) {
    return <div className="error">Nevaljani identifikator nacrta.</div>;
  }
  return <InvoiceReview slug={params.slug} importId={importId} />;
}
