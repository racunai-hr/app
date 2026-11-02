'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/components/ui/Pagination';
import { usePageBounds } from '@/components/ui/usePageBounds';
import { ApiError } from '@/lib/api';
import { pageCountOf, parsePage, parsePageSize, writePageParams } from '@/lib/pagination';
import { clearTokens } from '@/lib/auth';
import {
  canWritePartners,
  fetchPartners,
  partnerStatusLabel,
  partnerTaxLabel,
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

const JURISDICTIONS = [
  { id: '', label: 'Sve zemlje' },
  { id: 'HR', label: 'Hrvatska' },
  { id: 'EU', label: 'EU' },
  { id: 'NON_EU', label: 'Ostale zemlje' },
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
  const jurisdiction = (searchParams.get('jurisdiction') || '') as '' | 'HR' | 'EU' | 'NON_EU';
  const search = searchParams.get('search') || '';
  const page = parsePage(searchParams.get('page'));
  const pageSize = parsePageSize(searchParams.get('page_size'));

  const setQuery = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (key === 'page' || key === 'page_size') continue;
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      const nextPage = 'page' in patch ? parsePage(patch.page) : 1;
      const nextPageSize = 'page_size' in patch ? parsePageSize(patch.page_size) : pageSize;
      writePageParams(next, nextPage, nextPageSize);
      const qs = next.toString();
      router.replace(qs ? `/t/${slug}/partneri?${qs}` : `/t/${slug}/partneri`);
    },
    [pageSize, router, searchParams, slug],
  );
  const onPage = useCallback((nextPage: number) => setQuery({ page: String(nextPage) }), [setQuery]);

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
            jurisdiction,
            search,
            page,
            page_size: pageSize,
          }
        : {
            filter: (filter === 'all' || filter === 'inactive' ? filter : '') as
              | 'all'
              | 'inactive'
              | '',
            jurisdiction,
            search,
            page,
            page_size: pageSize,
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
  }, [session, filter, jurisdiction, search, page, pageSize, router]);

  const totalPages = pageCountOf(count, pageSize);
  usePageBounds({
    page,
    pageCount: totalPages,
    ready: Boolean(session) && !sessionLoading && !sessionError && !loading && !error,
    onPage,
  });

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

      <nav className="tabs" aria-label="Jurisdikcija partnera">
        {JURISDICTIONS.map((item) => (
          <button
            key={item.id || 'all-jur'}
            type="button"
            className={jurisdiction === item.id ? 'tab tab-active' : 'tab'}
            onClick={() => setQuery({ jurisdiction: item.id })}
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
          <input name="search" defaultValue={search} placeholder="Naziv, porezni broj, šifra…" />
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
                <th>ID</th>
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
                    <td>
                      <span className="banking-role-note">{partnerTaxLabel(row.jurisdiction)}</span>{' '}
                      {row.tax_number || '—'}
                    </td>
                    <td>{row.city}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {session && (
        <Pagination
          page={page}
          pageCount={totalPages}
          count={count}
          pageSize={pageSize}
          onPage={onPage}
          onPageSize={(size) => setQuery({ page: '1', page_size: String(size) })}
        />
      )}
    </section>
  );
}
