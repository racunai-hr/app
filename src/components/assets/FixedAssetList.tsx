'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import {
  assetOriginLabel,
  fetchFixedAssets,
  fixedAssetStatusLabel,
  type FixedAssetListItem,
} from '@/lib/assets';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';

import { useAssetsSession } from './useAssetsSession';

const STATUS_TABS = [
  { id: '', label: 'Svi' },
  { id: 'in_preparation', label: 'U pripremi' },
  { id: 'active', label: 'Aktivno' },
  { id: 'disposed', label: 'Otpisano' },
] as const;

const ORIGIN_OPTIONS = [
  { id: '', label: 'Sva porijekla' },
  { id: 'purchase', label: 'Nabava' },
  { id: 'opening_balance', label: 'Početno stanje' },
] as const;

type Props = { slug: string };

export function FixedAssetList({ slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: sessionLoading, error: sessionError } = useAssetsSession(slug);
  const [rows, setRows] = useState<FixedAssetListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const status = searchParams.get('status') || '';
  const origin = searchParams.get('origin') || '';
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
      router.replace(qs ? `/t/${slug}/imovina?${qs}` : `/t/${slug}/imovina`);
    },
    [router, searchParams, slug],
  );

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchFixedAssets(session.origin, session.token, { status, origin, search, page })
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
  }, [session, status, origin, search, page, router]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Imovina{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>Registar dugotrajne imovine. Knjiženja ostaju u glavnoj knjizi.</p>
        </div>
      </header>

      <nav className="tabs" aria-label="Status imovine">
        {STATUS_TABS.map((item) => (
          <button
            key={item.id || 'all'}
            type="button"
            className={status === item.id ? 'tab tab-active' : 'tab'}
            onClick={() => setQuery({ status: item.id })}
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
          setQuery({
            search: String(fd.get('search') || ''),
            origin: String(fd.get('origin') || ''),
          });
        }}
      >
        <label>
          Pretraži
          <input name="search" defaultValue={search} placeholder="Naziv, VIN, inventarni broj…" />
        </label>
        <label>
          Porijeklo
          <select name="origin" defaultValue={origin}>
            {ORIGIN_OPTIONS.map((item) => (
              <option key={item.id || 'all-origin'} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
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
                <th>Inventarni broj</th>
                <th>Naziv</th>
                <th>Status</th>
                <th>Porijeklo</th>
                <th>Nabava</th>
                <th>Aktivacija</th>
                <th>Nabavna vr.</th>
                <th>Akum. amort.</th>
                <th>Knjig. vr.</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    Nema imovine za odabrani filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.inventory_number || '—'}</td>
                    <td>
                      <Link href={`/t/${slug}/imovina/${row.id}`}>{row.name}</Link>
                    </td>
                    <td>{fixedAssetStatusLabel(row.status)}</td>
                    <td>{assetOriginLabel(row.origin)}</td>
                    <td>{row.purchase_date ? formatHrInputDate(row.purchase_date) : '—'}</td>
                    <td>{row.activation_date ? formatHrInputDate(row.activation_date) : '—'}</td>
                    <td className="cell-amount">{formatHrAmount(row.acquisition_cost)}</td>
                    <td className="cell-amount">{formatHrAmount(row.accumulated_depreciation)}</td>
                    <td className="cell-amount">{formatHrAmount(row.current_book_value)}</td>
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
