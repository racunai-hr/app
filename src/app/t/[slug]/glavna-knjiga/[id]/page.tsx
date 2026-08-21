'use client';

import { useParams } from 'next/navigation';

import { JournalEntryDetailView } from '@/components/journal/JournalEntryDetail';

export default function GlavnaKnjigaDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const entryId = Number(params.id);
  return <JournalEntryDetailView slug={params.slug} entryId={entryId} />;
}
