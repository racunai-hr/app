'use client';

import { useParams } from 'next/navigation';

import { PdIpoReport } from '@/components/tax/PdIpoReport';

export default function PdIpoPage() {
  const params = useParams<{ slug: string }>();
  return <PdIpoReport slug={params.slug} />;
}
