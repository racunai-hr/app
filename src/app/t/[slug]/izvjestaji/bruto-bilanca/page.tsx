'use client';

import { useParams } from 'next/navigation';

import { BrutoBilancaReport } from '@/components/reports/BrutoBilancaReport';

export default function BrutoBilancaPage() {
  const params = useParams<{ slug: string }>();
  return <BrutoBilancaReport slug={params.slug} />;
}
