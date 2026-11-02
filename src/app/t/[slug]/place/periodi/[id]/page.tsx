'use client';

import { useParams } from 'next/navigation';

import { PeriodWorkflow } from '@/components/payroll/PeriodWorkflow';

export default function PeriodDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  return <PeriodWorkflow slug={params.slug} periodId={Number(params.id)} />;
}
