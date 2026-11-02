'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { DateField } from '@/components/documents/DateField';
import { usePartnerSession } from '@/components/partners/usePartnerSession';
import { Pagination } from '@/components/ui/Pagination';
import { usePageBounds } from '@/components/ui/usePageBounds';
import { ApiError } from '@/lib/api';
import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import {
  fetchJournalEntries,
  journalSourceLabel,
  journalStatusLabel,
  type PaginatedJournalEntries,
} from '@/lib/journal';
import { pageCountOf, parsePage, parsePageSize, writePageParams } from '@/lib/pagination';

type Props = { slug: string };

function queryFromSearch(params: URLSearchParams) {
  return {
    status: params.get('status') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    search: params.get('search') || '',
    page: parsePage(params.get('page')),
    page_size: parsePageSize(params.get('page_size')),
  };
}

export function JournalEntryList({ slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(() => queryFromSearch(searchParams), [searchKey, searchParams]);
  const { session, loading: sessionLoading, error: sessionError } = usePartnerSession(slug);
  const [data, setData] = useState<PaginatedJournalEntries | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const replaceQuery = useCallback(
    (next: Partial<typeof query>) => {
      const merged = { ...query, ...next };
      const params = new URLSearchParams();
      if (merged.status) params.set('status', merged.status);
      if (merged.date_from) params.set('date_from', merged.date_from);
      if (merged.date_to) params.set('date_to', merged.date_to);
      if (merged.search) params.set('search', merged.search);
      writePageParams(params, merged.page, merged.page_size);
      const qs = params.toString();
      router.replace(qs ? `/t/${slug}/glavna-knjiga?${qs}` : `/t/${slug}/glavna-knjiga`);
    },
    [query, router, slug],
  );

  const onPage = useCallback((page: number) => replaceQuery({ page }), [replaceQuery]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchJournalEntries(session.origin, session.token, query)
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Temeljnice se nisu učitale.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, searchKey, query]);

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    replaceQuery({
      status: String(form.get('status') || ''),
      date_from: String(form.get('date_from') || ''),
      date_to: String(form.get('date_to') || ''),
      search: String(form.get('search') || ''),
      page: 1,
    });
  }

  const pageCount = data ? pageCountOf(data.count, query.page_size) : 1;
  usePageBounds({
    page: query.page,
    pageCount,
    ready: Boolean(data) && !loading && !error,
    onPage,
  });

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Glavna knjiga{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>Pregled knjiženih i nacrta temeljnica. Klik na broj otvara stavke.</p>
        </div>
      </header>

      <form className="filter-bar banking-filter-bar" onSubmit={handleFilter} key={searchKey}>
        <label className="filter-field">
          <span>Pretraži</span>
          <input name="search" defaultValue={query.search} placeholder="Broj, opis, referenca…" />
        </label>
        <label className="filter-field">
          <span>Status</span>
          <select name="status" defaultValue={query.status}>
            <option value="">Svi</option>
            <option value="draft">Nacrt</option>
            <option value="posted">Knjižena</option>
            <option value="reversed">Stornirana</option>
          </select>
        </label>
        <DateField name="date_from" label="Od datuma" defaultValue={query.date_from} />
        <DateField name="date_to" label="Do datuma" defaultValue={query.date_to} />
        <button type="submit" className="btn btn-primary filter-submit">
          Primijeni
        </button>
      </form>

      {data && (
        <p className="as-of">
          Presjek <time dateTime={data.as_of}>{formatHrDateTime(data.as_of)}</time> · {data.count}{' '}
          temeljnica
        </p>
      )}
      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(sessionLoading || (loading && !data)) && <div className="loading">Učitavanje…</div>}
      {data && data.results.length === 0 && (
        <p className="table-empty">Nema temeljnica za odabrani filter.</p>
      )}
      {data && data.results.length > 0 && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Broj</th>
                <th>Datum</th>
                <th>Opis</th>
                <th>Izvor</th>
                <th>Status</th>
                <th>Duguje</th>
                <th>Potražuje</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/t/${slug}/glavna-knjiga/${row.id}`}>{row.entry_number}</Link>
                  </td>
                  <td>{row.entry_date ? formatHrInputDate(row.entry_date) : '—'}</td>
                  <td>{row.description || '—'}</td>
                  <td>{journalSourceLabel(row.source_type)}</td>
                  <td>{journalStatusLabel(row.status)}</td>
                  <td className="cell-amount">{formatHrAmount(row.total_debit)}</td>
                  <td className="cell-amount">{formatHrAmount(row.total_credit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && (
        <Pagination
          page={query.page}
          pageCount={pageCount}
          count={data.count}
          pageSize={query.page_size}
          onPage={onPage}
          onPageSize={(page_size) => replaceQuery({ page_size, page: 1 })}
        />
      )}
    </section>
  );
}
