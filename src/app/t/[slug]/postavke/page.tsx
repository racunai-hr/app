'use client';

import { useParams } from 'next/navigation';

import { ExpenseCategorySettings } from '@/components/settings/ExpenseCategorySettings';

export default function PostavkePage() {
  const params = useParams<{ slug: string }>();
  return <ExpenseCategorySettings slug={params.slug} />;
}
