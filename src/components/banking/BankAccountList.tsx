'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/lib/api';
import {
  fetchBankAccounts,
  maskIban,
  type BankAccountDto,
  type Paginated,
} from '@/lib/banking';

import { BalanceCell } from './BalanceCell';
import { BankingPager } from './BankingPager';

type Props = { slug: string; origin: string; token: string };

function queryFromSearch(params: URLSearchParams) {
  return {
    page: Number(params.get('page') || '1') || 1,
    page_size: 20,
  };
}

export function BankAccountList({ slug, origin, token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(() => queryFromSearch(searchParams), [searchKey, searchParams]);
  const [data, setData] = useState<Paginated<BankAccountDto> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function replaceQuery(next: { page?: number }) {
    const params = new URLSearchParams();
    const page = next.page ?? query.page;
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `/t/${slug}/bankarstvo/racuni?${qs}` : `/t/${slug}/bankarstvo/racuni`);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchBankAccounts(origin, token, query)
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Računi se nisu učitali.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, searchKey, query]);

  const pageCount = data ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1;

  return (
    <>
      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="loading">Učitavanje…</div>}
      {data && data.results.length === 0 && <p className="table-empty">Nema bankovnih računa.</p>}
      {data && data.results.length > 0 && (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Banka</th>
                <th>IBAN</th>
                <th>Valuta</th>
                <th>Veza</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr key={row.id}>
                  <td>{row.account_name}</td>
                  <td>{row.bank_name}</td>
                  <td>
                    <code>{maskIban(row.iban)}</code>
                  </td>
                  <td>{row.currency}</td>
                  <td>{row.connection ? row.connection.status : '—'}</td>
                  <td>
                    <BalanceCell balances={row.balances} />
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
