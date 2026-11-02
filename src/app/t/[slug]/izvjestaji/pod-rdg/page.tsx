'use client';

import { useParams } from 'next/navigation';

import { PodRdgReport } from '@/components/reports/PodRdgReport';

export default function PodRdgReportPage() {
  const params = useParams<{ slug: string }>();
  return <PodRdgReport slug={params.slug} />;
}
