'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { fetchStatements, type Paginated, type StatementDto } from '@/lib/banking';
import { STATEMENT_STATUS_LABELS, labelOrRaw } from '@/lib/bankingLabels';
import { formatHrMoney, formatHrSnapshot } from '@/lib/formatHr';
import { DateField } from '@/components/documents/DateField';

import { BankingPager } from './BankingPager';

type Props = { slug: string; origin: string; token: string };

function queryFromSearch(params: URLSearchParams) {
  return {
    bank_account: params.get('bank_account') || '',
    status: params.get('status') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    page: Number(params.get('page') || '1') || 1,
    page_size: 20,
  };
}

export function StatementList({ slug, origin, token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(() => queryFromSearch(searchParams), [searchKey, searchParams]);
  const [data, setData] = useState<Paginated<StatementDto> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function replaceQuery(next: Partial<typeof query>) {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();
    if (merged.bank_account) params.set('bank_account', merged.bank_account);
    if (merged.status) params.set('status', merged.status);
    if (merged.date_from) params.set('date_from', merged.date_from);
    if (merged.date_to) params.set('date_to', merged.date_to);
    if (merged.page > 1) params.set('page', String(merged.page));
    const qs = params.toString();
    router.replace(qs ? `/t/${slug}/bankarstvo/izvodi?${qs}` : `/t/${slug}/bankarstvo/izvodi`);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchStatements(origin, token, query)
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Izvodi se nisu učitali.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, searchKey, query]);

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    replaceQuery({
      bank_account: String(form.get('bank_account') || ''),
      status: String(form.get('status') || ''),
      date_from: String(form.get('date_from') || ''),
      date_to: String(form.get('date_to') || ''),
      page: 1,
    });
  }

  const pageCount = data ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1;

  return (
    <>
      <form className="filter-bar banking-filter-bar" onSubmit={handleFilter} key={searchKey}>
        <label className="filter-field">
          <span>ID računa</span>
          <input name="bank_account" defaultValue={query.bank_account} inputMode="numeric" />
        </label>
        <label className="filter-field">
          <span>Status</span>
          <select name="status" defaultValue={query.status}>
            <option value="">Svi</option>
            <option value="imported">Uvezen</option>
            <option value="reconciled">Usklađen</option>
            <option value="archived">Arhiviran</option>
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
          Presjek <time dateTime={data.as_of}>{formatHrSnapshot(data.as_of)}</time> · {data.count}{' '}
          izvoda
        </p>
      )}
      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="loading">Učitavanje…</div>}
      {data && data.results.length === 0 && <p className="table-empty">Nema izvoda za odabrani filter.</p>}
      {data && data.results.length > 0 && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Broj</th>
                <th>Datum</th>
                <th>Račun</th>
                <th>Otvaranje</th>
                <th>Zatvaranje</th>
                <th>Status</th>
                <th>Stavke</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr key={row.id}>
                  <td>{row.statement_number}</td>
                  <td>{row.statement_date}</td>
                  <td>{row.bank_account_id}</td>
                  <td>{formatHrMoney(row.opening_balance, row.currency || 'EUR')}</td>
                  <td>{formatHrMoney(row.closing_balance, row.currency || 'EUR')}</td>
                  <td>
                    <span className="badge badge-neutral">
                      {labelOrRaw(STATEMENT_STATUS_LABELS, row.status)}
                    </span>
                  </td>
                  <td>{row.transaction_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.count > data.page_size && (
        <BankingPager page={data.page} pageCount={pageCount} onPage={(page) => replaceQuery({ page })} />
      )}
    </>
  );
}
