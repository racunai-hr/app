'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import {
  fetchPartner,
  partnerJurisdictionLabel,
  partnerStatusLabel,
  partnerTaxLabel,
  partnerTypeLabel,
  type PartnerDto,
} from '@/lib/partners';
import { useRouter } from 'next/navigation';

import { PartnerSubnav } from './PartnerSubnav';
import { usePartnerSession } from './usePartnerSession';

type Props = {
  slug: string;
  partnerId: number;
  children: (ctx: {
    origin: string;
    token: string;
    role: string;
    partner: PartnerDto;
    reloadPartner: () => Promise<void>;
  }) => ReactNode;
};

export function PartnerCardShell({ slug, partnerId, children }: Props) {
  const router = useRouter();
  const { session, loading: sessionLoading, error: sessionError } = usePartnerSession(slug);
  const [partner, setPartner] = useState<PartnerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (origin: string, token: string) => {
    const data = await fetchPartner(origin, token, partnerId);
    setPartner(data);
  };

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    load(session.origin, session.token)
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Partner se nije učitao.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, partnerId, router]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <p>
            <Link href={`/t/${slug}/partneri`}>← Partneri</Link>
          </p>
          <h1>{partner?.name || (loading ? 'Učitavanje…' : 'Partner')}</h1>
          {partner && (
            <p>
              {partnerTypeLabel(partner.partner_type)} · {partnerStatusLabel(partner.status)} ·{' '}
              {partnerJurisdictionLabel(partner.jurisdiction)} · {partnerTaxLabel(partner.jurisdiction)}{' '}
              {partner.tax_number || '—'}
            </p>
          )}
        </div>
      </header>

      <PartnerSubnav slug={slug} partnerId={partnerId} />

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(sessionLoading || loading) && !partner && <div className="loading">Učitavanje…</div>}

      {session && partner &&
        children({
          origin: session.origin,
          token: session.token,
          role: session.role,
          partner,
          reloadPartner: async () => {
            await load(session.origin, session.token);
          },
        })}
    </section>
  );
}
