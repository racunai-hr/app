'use client';

import type { ReactNode } from 'react';

import { useBankingSession } from '@/components/banking/useBankingSession';

import { PdvSubnav } from './PdvSubnav';

type Props = {
  slug: string;
  title: string;
  description: string;
  period?: string | null;
  children: (ctx: { origin: string; token: string; tenantName: string }) => ReactNode;
};

export function PdvPage({ slug, title, description, period, children }: Props) {
  const { session, loading, error } = useBankingSession(slug);

  return (
    <section className="docs-shell banking-shell">
      <header className="docs-heading">
        <div>
          <h1>
            {title}
            {session ? ` — ${session.tenant.name}` : ''}
          </h1>
          <p>{description}</p>
        </div>
      </header>

      <PdvSubnav slug={slug} period={period} />

      {error && <div className="error">{error}</div>}
      {loading && !session && <div className="loading">Učitavanje…</div>}
      {session &&
        children({
          origin: session.origin,
          token: session.token,
          tenantName: session.tenant.name,
        })}
    </section>
  );
}
