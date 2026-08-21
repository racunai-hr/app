'use client';

import type { ReactNode } from 'react';

import { bankingRoleCapabilityNote } from '@/lib/bankingLabels';

import { BankingSubnav } from './BankingSubnav';
import { useBankingSession } from './useBankingSession';

type Props = {
  slug: string;
  title: string;
  description: string;
  children: (ctx: {
    origin: string;
    token: string;
    tenantName: string;
    role: string;
  }) => ReactNode;
};

export function BankingPage({ slug, title, description, children }: Props) {
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

      <BankingSubnav slug={slug} />

      {session && (
        <p className="banking-role-note" role="note">
          {bankingRoleCapabilityNote(session.role)}
        </p>
      )}

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
