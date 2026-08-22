import { redirect } from 'next/navigation';

import { saldakontiToDokumentiUrl } from '@/lib/documentListQuery';

export default async function SaldakontiRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  redirect(saldakontiToDokumentiUrl(slug, await searchParams));
}
