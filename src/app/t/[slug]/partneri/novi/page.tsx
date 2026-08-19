'use client';

import { useParams } from 'next/navigation';

import { PartnerCreateForm } from '@/components/partners/PartnerCreateForm';

export default function NoviPartnerPage() {
  const params = useParams<{ slug: string }>();
  return <PartnerCreateForm slug={params.slug} />;
}
