import { redirect } from 'next/navigation';

import { dokumentiRedirectUrl } from '@/lib/documentListQuery';

export default async function SaldakontiRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  redirect(dokumentiRedirectUrl(slug, await searchParams));
}
