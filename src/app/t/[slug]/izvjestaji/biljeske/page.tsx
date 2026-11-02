'use client';

import { useParams } from 'next/navigation';

import { BiljeskeReport } from '@/components/reports/BiljeskeReport';

export default function BiljeskePage() {
  const params = useParams<{ slug: string }>();
  return <BiljeskeReport slug={params.slug} />;
}
