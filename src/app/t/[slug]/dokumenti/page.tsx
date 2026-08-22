'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentsPage } from '@/components/documents/DocumentsPage';

function DokumentiPageInner() {
  const params = useParams<{ slug: string }>();
  return (
    <DocumentsPage slug={params.slug}>
      <DocumentList slug={params.slug} basePath="dokumenti" showHeader={false} />
    </DocumentsPage>
  );
}

export default function DokumentiPage() {
  return (
    <Suspense fallback={<div className="loading">Učitavanje…</div>}>
      <DokumentiPageInner />
    </Suspense>
  );
}
