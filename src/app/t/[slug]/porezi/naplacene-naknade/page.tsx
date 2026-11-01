'use client';

import { useParams } from 'next/navigation';

import { NaplaceneNaknadeReport } from '@/components/tax/NaplaceneNaknadeReport';

export default function NaplaceneNaknadePage() {
  const params = useParams<{ slug: string }>();
  return <NaplaceneNaknadeReport slug={params.slug} />;
}
