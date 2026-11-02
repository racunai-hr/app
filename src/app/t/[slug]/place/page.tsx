'use client';

import { useParams } from 'next/navigation';

import { PeriodList } from '@/components/payroll/PeriodList';

export default function PlacePage() {
  const params = useParams<{ slug: string }>();
  return <PeriodList slug={params.slug} />;
}
