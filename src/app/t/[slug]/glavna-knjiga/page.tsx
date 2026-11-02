'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { JournalEntryList } from '@/components/journal/JournalEntryList';

function GlavnaKnjigaPageInner() {
  const params = useParams<{ slug: string }>();
  return <JournalEntryList slug={params.slug} />;
}

export default function GlavnaKnjigaPage() {
  return (
    <Suspense fallback={<div className="loading">Učitavanje…</div>}>
      <GlavnaKnjigaPageInner />
    </Suspense>
  );
}
