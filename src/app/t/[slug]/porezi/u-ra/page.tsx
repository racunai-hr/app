'use client';

import { useParams } from 'next/navigation';

import { UraReport } from '@/components/tax/UraReport';

export default function UraPage() {
  const params = useParams<{ slug: string }>();
  return <UraReport slug={params.slug} />;
}
