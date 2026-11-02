'use client';

import { useParams } from 'next/navigation';

import { GfiReport } from '@/components/reports/GfiReport';

export default function GfiPage() {
  const params = useParams<{ slug: string }>();
  return <GfiReport slug={params.slug} />;
}
