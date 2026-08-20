'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { fetchPaymentOrders, formatIban, type Paginated, type PaymentOrderDto } from '@/lib/banking';
import { PAYMENT_ORDER_STATUS_LABELS, labelOrRaw } from '@/lib/bankingLabels';
import { formatHrMoney, formatHrSnapshot } from '@/lib/formatHr';
import { DateField } from '@/components/documents/DateField';

import { BankingPager } from './BankingPager';

type Props = { slug: string; origin: string; token: string };

function queryFromSearch(params: URLSearchParams) {
  return {
    status: params.get('status') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    page: Number(params.get('page') || '1') || 1,
    page_size: 20,
  };
}

export function PaymentOrderList({ slug, origin, token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(() => queryFromSearch(searchParams), [searchKey, searchParams]);
  const [data, setData] = useState<Paginated<PaymentOrderDto> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function replaceQuery(next: Partial<typeof query>) {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();
    if (merged.status) params.set('status', merged.status);
    if (merged.date_from) params.set('date_from', merged.date_from);
    if (merged.date_to) params.set('date_to', merged.date_to);
    if (merged.page > 1) params.set('page', String(merged.page));
    const qs = params.toString();
    router.replace(qs ? `/t/${slug}/bankarstvo/nalozi?${qs}` : `/t/${slug}/bankarstvo/nalozi`);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPaymentOrders(origin, token, query)
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Nalozi se nisu učitali.');
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
      status: String(form.get('status') || ''),
      date_from: String(form.get('date_from') || ''),
      date_to: String(form.get('date_to') || ''),
      page: 1,
    });
  }

  const pageCount = data ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1;

  return (
    <>
      <p className="disclaimer" role="note">
        Platni nalozi su samo za pregled. Slanje PIS naloga i SCA nisu dostupni u ovom sučelju.
      </p>

      <form className="filter-bar banking-filter-bar" onSubmit={handleFilter} key={searchKey}>
        <label className="filter-field">
          <span>Status</span>
          <input name="status" defaultValue={query.status} placeholder="npr. draft" />
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
          naloga
        </p>
      )}
      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="loading">Učitavanje…</div>}
      {data && data.results.length === 0 && <p className="table-empty">Nema platnih naloga.</p>}
      {data && data.results.length > 0 && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Iznos</th>
                <th>Dužnik</th>
                <th>Primatelj</th>
                <th>Referenca</th>
                <th>Kreiran</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <span className="badge badge-neutral">
                      {labelOrRaw(PAYMENT_ORDER_STATUS_LABELS, row.status)}
                    </span>
                  </td>
                  <td>{formatHrMoney(row.amount, row.currency)}</td>
                  <td>
                    <code>{formatIban(row.debtor_iban)}</code>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <span>{row.creditor_name}</span>
                      <code>{formatIban(row.creditor_iban)}</code>
                    </div>
                  </td>
                  <td>{row.reference || '—'}</td>
                  <td>
                    {row.created_at ? (
                      <time dateTime={row.created_at}>{formatHrSnapshot(row.created_at)}</time>
                    ) : (
                      '—'
                    )}
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
