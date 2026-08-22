'use client';

import { type ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { parsePdvPeriod, razdobljaHref } from '@/lib/pdv';

export function RequirePdvPeriod({
  slug,
  children,
}: {
  slug: string;
  children: (period: string) => ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = parsePdvPeriod(searchParams.get('period'));

  useEffect(() => {
    if (!period) router.replace(razdobljaHref(slug));
  }, [period, router, slug]);

  if (!period) {
    return <div className="loading">Odaberite razdoblje…</div>;
  }
  return children(period);
}
