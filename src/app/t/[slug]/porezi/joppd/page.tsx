'use client';

import { useParams } from 'next/navigation';

import { JoppdReportView } from '@/components/tax/JoppdReport';

export default function JoppdPage() {
  const params = useParams<{ slug: string }>();
  return <JoppdReportView slug={params.slug} />;
}
