'use client';

import { useParams } from 'next/navigation';

import { ObrazacTzReport } from '@/components/tax/ObrazacTzReport';

export default function ObrazacTzPage() {
  const params = useParams<{ slug: string }>();
  return <ObrazacTzReport slug={params.slug} />;
}
