'use client';

import { useParams } from 'next/navigation';

import { IzjaveReport } from '@/components/tax/IzjaveReport';

export default function IzjavePage() {
  const params = useParams<{ slug: string }>();
  return <IzjaveReport slug={params.slug} />;
}
