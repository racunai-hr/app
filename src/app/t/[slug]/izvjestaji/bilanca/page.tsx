'use client';

import { useParams } from 'next/navigation';

import { PodBilReport } from '@/components/reports/PodBilReport';

export default function BilancaReportPage() {
  const params = useParams<{ slug: string }>();
  return <PodBilReport slug={params.slug} />;
}
