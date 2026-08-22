'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe, type TenantInfo } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { canWritePurchasing } from '@/lib/purchasing';

import { DocumentsSubnav } from './DocumentsSubnav';

type Props = {
  slug: string;
  children: ReactNode;
};

export function DocumentsPage({ slug, children }: Props) {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    setError('');
    fetchMe(token)
      .then((me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) {
          throw new ApiError('Tvrtka nije pronađena.', 404);
        }
        if (!cancelled) setTenant(found);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Podaci o tvrtki nisu učitani.');
      });
    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Dokumenti{tenant ? ` — ${tenant.name}` : ''}</h1>
          <p>Pregled svih ulaznih i izlaznih poslovnih dokumenata.</p>
        </div>
        <div className="export-actions">
          {tenant && canWritePurchasing(tenant.role) && (
            <Link className="btn btn-primary" href={`/t/${slug}/ulazni-racuni/ucitaj`}>
              Učitaj račun
            </Link>
          )}
        </div>
      </header>

      {error && <div className="error">{error}</div>}
      <DocumentsSubnav slug={slug} />
      {children}
    </section>
  );
}
