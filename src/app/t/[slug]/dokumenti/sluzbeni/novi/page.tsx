'use client';

import { useParams } from 'next/navigation';

import { OfficialDocumentCreate } from '@/components/documents/OfficialDocumentCreate';

export default function OfficialDocumentCreatePage() {
  const params = useParams<{ slug: string }>();
  return <OfficialDocumentCreate slug={params.slug} />;
}
