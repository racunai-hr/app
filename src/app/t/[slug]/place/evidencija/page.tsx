'use client';

import { useParams } from 'next/navigation';

import { WorkTimeGrid } from '@/components/payroll/WorkTimeGrid';

export default function WorkTimePage() {
  const params = useParams<{ slug: string }>();
  return <WorkTimeGrid slug={params.slug} />;
}
