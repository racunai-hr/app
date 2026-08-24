'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/components/ui/Pagination';
import { usePageBounds } from '@/components/ui/usePageBounds';
import { ApiError } from '@/lib/api';
import {
  fetchBankAccounts,
  formatIban,
  type BankAccountDto,
  type Paginated,
} from '@/lib/banking';
import { pageCountOf, parsePage, parsePageSize, writePageParams } from '@/lib/pagination';

import { BalanceCell } from './BalanceCell';

type Props = { slug: string; origin: string; token: string };

function queryFromSearch(params: URLSearchParams) {
  return {
    page: parsePage(params.get('page')),
    page_size: parsePageSize(params.get('page_size')),
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

  const replaceQuery = useCallback(
    (next: Partial<typeof query>) => {
      const merged = { ...query, ...next };
      const params = new URLSearchParams();
      writePageParams(params, merged.page, merged.page_size);
      const qs = params.toString();
      router.replace(qs ? `/t/${slug}/bankarstvo/racuni?${qs}` : `/t/${slug}/bankarstvo/racuni`);
    },
    [query, router, slug],
  );
  const onPage = useCallback((page: number) => replaceQuery({ page }), [replaceQuery]);

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

  const pageCount = data ? pageCountOf(data.count, query.page_size) : 1;
  usePageBounds({
    page: query.page,
    pageCount,
    ready: Boolean(data) && !loading && !error,
    onPage,
  });

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
                    <code>{formatIban(row.iban)}</code>
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
    </>
  );
}
