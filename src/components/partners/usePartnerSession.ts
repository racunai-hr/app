'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe, type TenantInfo } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { tenantApiOrigin } from '@/lib/partners';

export type PartnerSession = {
  tenant: TenantInfo;
  origin: string;
  token: string;
  role: string;
};

export function usePartnerSession(slug: string): {
  session: PartnerSession | null;
  loading: boolean;
  error: string;
} {
  const router = useRouter();
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      router.replace('/');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMe(token)
      .then((me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) throw new ApiError('Tvrtka nije pronađena.', 404);
        if (cancelled) return;
        setSession({
          tenant: found,
          origin: tenantApiOrigin(found.admin_url),
          token,
          role: found.role,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Sesija se nije učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  return { session, loading, error };
}
