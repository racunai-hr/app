'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/Logo';
import { fetchMe, roleLabel, type MeResponse } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/');
      return;
    }

    fetchMe(token)
      .then(setData)
      .catch((err) => {
        clearTokens();
        setError(err instanceof Error ? err.message : 'Sesija je istekla.');
        setTimeout(() => router.replace('/'), 1500);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearTokens();
    router.replace('/');
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading">Učitavanje…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="error">{error}</div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="page">
      <div className="header-bar">
        <Logo size={36} showText />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="user">{data.user.username}</span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Odjava
          </button>
        </div>
      </div>

      <div className="card card-wide">
        <div className="brand">
          <h1>Odaberite tvrtku</h1>
          <p>Pristupite admin sučelju svog tenant profila</p>
        </div>

        {data.tenants.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Nemate dodijeljen pristup nijednoj tvrtki. Kontaktirajte administratora.
          </p>
        ) : (
          <div className="tenant-list">
            {data.tenants.map((tenant) => (
              <div key={tenant.slug} className="tenant-item">
                <div className="tenant-info">
                  <h3>{tenant.name}</h3>
                  <p>
                    {tenant.slug} · {roleLabel(tenant.role)}
                    {tenant.is_default ? ' · zadano' : ''}
                  </p>
                </div>
                <a href={tenant.admin_url} className="tenant-link">
                  Otvori admin
                </a>
              </div>
            ))}
          </div>
        )}

        {data.user.is_superuser && (
          <div className="platform-link">
            <Link href={data.platform_admin_url}>Platform admin →</Link>
          </div>
        )}
      </div>
    </main>
  );
}
