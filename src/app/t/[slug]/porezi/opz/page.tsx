'use client';

import { useParams } from 'next/navigation';

import { OpzReport } from '@/components/tax/OpzReport';

export default function OpzPage() {
  const params = useParams<{ slug: string }>();
  return <OpzReport slug={params.slug} />;
}
