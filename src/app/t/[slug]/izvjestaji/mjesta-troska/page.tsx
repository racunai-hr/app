'use client';

import { useParams } from 'next/navigation';

import { CostCenterReportView } from '@/components/reports/CostCenterReport';

export default function MjestaTroskaReportPage() {
  const params = useParams<{ slug: string }>();
  return <CostCenterReportView slug={params.slug} />;
}
