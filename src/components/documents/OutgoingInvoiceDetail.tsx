'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { tenantApiOrigin } from '@/lib/documents';

import { DocumentDetailPanel } from './DocumentDetailPanel';

type Props = {
  slug: string;
  invoiceId: number;
};

export function OutgoingInvoiceDetail({ slug, invoiceId }: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    fetchMe(token)
      .then((me) => {
        if (cancelled) return;
        const tenant = me.tenants.find((row) => row.slug === slug) || me.tenants[0];
        if (!tenant) {
          setError('Tenant nije dostupan.');
          return;
        }
        setOrigin(tenantApiOrigin(tenant.admin_url));
      })
      .catch((err) => {
        if (cancelled) return;
        clearTokens();
        setError(err instanceof ApiError ? err.message : 'Sesija je istekla.');
        window.setTimeout(() => router.replace('/'), 1200);
      });
    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  if (error) {
    return (
      <div className="docs-shell">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!origin) {
    return (
      <div className="docs-shell">
        <div className="loading">Učitavanje…</div>
      </div>
    );
  }

  return (
    <DocumentDetailPanel
      mode="page"
      slug={slug}
      selection={{ direction: 'outgoing', id: invoiceId }}
      origin={origin}
    />
  );
}
