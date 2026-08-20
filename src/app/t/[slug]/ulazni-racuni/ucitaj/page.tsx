'use client';

import { useParams } from 'next/navigation';

import { InvoiceUpload } from '@/components/purchasing/InvoiceUpload';

export default function UcitajUlazniRacunPage() {
  const params = useParams<{ slug: string }>();
  return <InvoiceUpload slug={params.slug} />;
}
