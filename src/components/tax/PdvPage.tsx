'use client';

import type { ReactNode } from 'react';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { formatPdvPeriodLabel } from '@/lib/pdv';

import { PdvSubnav } from './PdvSubnav';

type Props = {
  slug: string;
  title: string;
  description: string;
  period?: string | null;
  periodKind?: 'PDV' | 'PDV-S';
  showSubnav?: boolean;
  children: (ctx: {
    origin: string;
    token: string;
    tenantName: string;
    role: string;
  }) => ReactNode;
};

export function PdvPage({
  slug,
  title,
  description,
  period,
  periodKind = 'PDV',
  showSubnav = true,
  children,
}: Props) {
  const { session, loading, error } = useBankingSession(slug);
  const periodLabel = formatPdvPeriodLabel(period);
  const periodContext = period && periodLabel !== '—' ? periodLabel : null;

  return (
    <section className="docs-shell banking-shell">
      <header className="docs-heading">
        <div>
          <h1>
            {title}
            {session ? ` — ${session.tenant.name}` : ''}
          </h1>
          {periodContext ? (
            <p className="tax-period-context">
              {periodKind} · {periodContext}
            </p>
          ) : null}
          <p>{description}</p>
        </div>
      </header>

      {showSubnav ? <PdvSubnav slug={slug} period={period} /> : null}

      {error && <div className="error">{error}</div>}
      {loading && !session && <div className="loading">Učitavanje…</div>}
      {session &&
        children({
          origin: session.origin,
          token: session.token,
          tenantName: session.tenant.name,
          role: session.role,
        })}
    </section>
  );
}
