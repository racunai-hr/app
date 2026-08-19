'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import {
  canWritePartners,
  fetchPartners,
  partnerStatusLabel,
  partnerTypeLabel,
  type PartnerListItem,
} from '@/lib/partners';

import { usePartnerSession } from './usePartnerSession';

const FILTERS = [
  { id: '', label: 'Aktivni' },
  { id: 'all', label: 'Svi' },
  { id: 'customers', label: 'Kupci' },
  { id: 'suppliers', label: 'Dobavljači' },
  { id: 'both', label: 'Kupci i dobavljači' },
  { id: 'inactive', label: 'Neaktivni' },
] as const;

type Props = { slug: string };

export function PartnerList({ slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: sessionLoading, error: sessionError } = usePartnerSession(slug);
  const [rows, setRows] = useState<PartnerListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filter = searchParams.get('filter') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const setQuery = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      if (!('page' in patch)) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `/t/${slug}/partneri?${qs}` : `/t/${slug}/partneri`);
    },
    [router, searchParams, slug],
  );

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    const query =
      filter === 'customers' || filter === 'suppliers' || filter === 'both'
        ? {
            filter: '' as const,
            partner_type: filter === 'both' ? 'both' : filter,
            search,
            page,
          }
        : {
            filter: (filter === 'all' || filter === 'inactive' ? filter : '') as
              | 'all'
              | 'inactive'
              | '',
            search,
            page,
          };
    fetchPartners(session.origin, session.token, query)
      .then((data) => {
        if (cancelled) return;
        setRows(data.results);
        setCount(data.count);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Lista se nije učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, filter, search, page, router]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Partneri{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>Kupci i dobavljači (MDM). Financije i dokumenti ostaju u svojim domenama.</p>
        </div>
        {session && canWritePartners(session.role) && (
          <Link className="btn" href={`/t/${slug}/partneri/novi`}>
            Novi partner
          </Link>
        )}
      </header>

      <nav className="tabs" aria-label="Filter partnera">
        {FILTERS.map((item) => (
          <button
            key={item.id || 'active'}
            type="button"
            className={filter === item.id ? 'tab tab-active' : 'tab'}
            onClick={() => setQuery({ filter: item.id })}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          const fd = new FormData(event.currentTarget);
          setQuery({ search: String(fd.get('search') || '') });
        }}
      >
        <label>
          Pretraži
          <input name="search" defaultValue={search} placeholder="Naziv, OIB, šifra…" />
        </label>
        <button type="submit" className="btn btn-secondary">
          Traži
        </button>
      </form>

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(sessionLoading || loading) && <div className="loading">Učitavanje…</div>}

      {!loading && session && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Šifra</th>
                <th>Naziv</th>
                <th>Tip</th>
                <th>Status</th>
                <th>OIB</th>
                <th>Grad</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Nema partnera za odabrani filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.partner_code}</td>
                    <td>
                      <Link href={`/t/${slug}/partneri/${row.id}`}>{row.name}</Link>
                    </td>
                    <td>{partnerTypeLabel(row.partner_type)}</td>
                    <td>{partnerStatusLabel(row.status)}</td>
                    <td>{row.tax_number}</td>
                    <td>{row.city}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {count > pageSize && (
        <div className="filter-bar">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setQuery({ page: String(page - 1) })}
          >
            Prethodna
          </button>
          <span>
            Stranica {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setQuery({ page: String(page + 1) })}
          >
            Sljedeća
          </button>
        </div>
      )}
    </section>
  );
}
