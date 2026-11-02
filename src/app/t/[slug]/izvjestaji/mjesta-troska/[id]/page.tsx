'use client';

import { useParams } from 'next/navigation';

import { CostCenterCard } from '@/components/reports/CostCenterCard';

export default function MjestoTroskaCardPage() {
  const params = useParams<{ slug: string; id: string }>();
  return <CostCenterCard slug={params.slug} costCenterId={Number(params.id)} />;
}
