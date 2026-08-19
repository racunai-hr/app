'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import {
  fetchTransactions,
  maskIban,
  type Paginated,
  type TransactionDto,
} from '@/lib/banking';
import {
  MATCH_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
  labelOrRaw,
} from '@/lib/bankingLabels';
import { formatHrMoney, formatHrSnapshot } from '@/lib/formatHr';
import { DateField } from '@/components/documents/DateField';

import { BankingPager } from './BankingPager';

type Props = {
  origin: string;
  token: string;
  /** Base path for URL filters, e.g. /t/x/bankarstvo/transakcije */
  basePath: string;
  /** When set, force match_status and show status tabs. */
  reconcileMode?: boolean;
};

function matchTone(status: string): string {
  if (status === 'matched') return 'success';
  if (status === 'suggested') return 'warning';
  return 'unknown';
}

function queryFromSearch(params: URLSearchParams, reconcileMode?: boolean) {
  const defaultMatch = reconcileMode ? 'unmatched' : '';
  return {
    bank_account: params.get('bank_account') || '',
    statement: params.get('statement') || '',
    match_status: params.get('match_status') || defaultMatch,
    transaction_type: params.get('transaction_type') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    page: Number(params.get('page') || '1') || 1,
    page_size: 20,
  };
}

export function TransactionList({ origin, token, basePath, reconcileMode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(
    () => queryFromSearch(searchParams, reconcileMode),
    [searchKey, searchParams, reconcileMode],
  );
  const [data, setData] = useState<Paginated<TransactionDto> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function replaceQuery(next: Partial<typeof query>) {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();
    if (merged.bank_account) params.set('bank_account', merged.bank_account);
    if (merged.statement) params.set('statement', merged.statement);
    if (merged.match_status) params.set('match_status', merged.match_status);
    if (merged.transaction_type) params.set('transaction_type', merged.transaction_type);
    if (merged.date_from) params.set('date_from', merged.date_from);
    if (merged.date_to) params.set('date_to', merged.date_to);
    if (merged.page > 1) params.set('page', String(merged.page));
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchTransactions(origin, token, query)
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Transakcije se nisu učitale.');
        }
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
      statement: String(form.get('statement') || ''),
      match_status: reconcileMode
        ? query.match_status
        : String(form.get('match_status') || ''),
      transaction_type: String(form.get('transaction_type') || ''),
      date_from: String(form.get('date_from') || ''),
      date_to: String(form.get('date_to') || ''),
      page: 1,
    });
  }

  const pageCount = data ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1;
  const statusTabs = [
    { value: 'unmatched', label: 'Neusklađeno' },
    { value: 'suggested', label: 'Prijedlozi' },
    { value: 'matched', label: 'Usklađeno' },
  ];

  return (
    <>
      {reconcileMode && (
        <nav className="tabs" aria-label="Status usklađivanja">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={query.match_status === tab.value ? 'tab tab-active' : 'tab'}
              onClick={() => replaceQuery({ match_status: tab.value, page: 1 })}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <form className="filter-bar banking-filter-bar" onSubmit={handleFilter} key={searchKey}>
        <label className="filter-field">
          <span>ID računa</span>
          <input name="bank_account" defaultValue={query.bank_account} inputMode="numeric" />
        </label>
        <label className="filter-field">
          <span>ID izvoda</span>
          <input name="statement" defaultValue={query.statement} inputMode="numeric" />
        </label>
        {!reconcileMode && (
          <label className="filter-field">
            <span>Usklađivanje</span>
            <select name="match_status" defaultValue={query.match_status}>
              <option value="">Svi</option>
              <option value="unmatched">Neusklađeno</option>
              <option value="suggested">Prijedlog</option>
              <option value="matched">Usklađeno</option>
            </select>
          </label>
        )}
        <label className="filter-field">
          <span>Tip</span>
          <select name="transaction_type" defaultValue={query.transaction_type}>
            <option value="">Svi</option>
            <option value="credit">Odobrenje</option>
            <option value="debit">Terećenje</option>
          </select>
        </label>
        <DateField name="date_from" label="Od datuma" defaultValue={query.date_from} />
        <DateField name="date_to" label="Do datuma" defaultValue={query.date_to} />
        <button type="submit" className="btn btn-primary filter-submit">
          Primijeni
        </button>
      </form>

      {reconcileMode && (
        <p className="disclaimer" role="note">
          Usklađivanje ovdje znači vezu stavke s plaćanjem ili temeljnicom — nije knjiženje ni
          zatvaranje saldakonta. Akcije match/unmatch dolaze u sljedećem koraku.
        </p>
      )}

      {data && (
        <p className="as-of">
          Presjek <time dateTime={data.as_of}>{formatHrSnapshot(data.as_of)}</time> · {data.count}{' '}
          transakcija
        </p>
      )}
      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="loading">Učitavanje…</div>}
      {data && data.results.length === 0 && (
        <p className="table-empty">Nema transakcija za odabrani filter.</p>
      )}
      {data && data.results.length > 0 && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Tip</th>
                <th>Iznos</th>
                <th>Opis</th>
                <th>Protustrana</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr key={row.id}>
                  <td>{row.transaction_date}</td>
                  <td>{labelOrRaw(TRANSACTION_TYPE_LABELS, row.transaction_type)}</td>
                  <td>{formatHrMoney(row.amount, row.currency)}</td>
                  <td>
                    <div className="cell-stack">
                      <span>{row.description || '—'}</span>
                      {row.reference ? <span>PNB {row.reference}</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <span>{row.counterparty_name || '—'}</span>
                      <code>{maskIban(row.counterparty_iban)}</code>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${matchTone(row.match_status)}`}>
                      {labelOrRaw(MATCH_STATUS_LABELS, row.match_status)}
                    </span>
                  </td>
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
