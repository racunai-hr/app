'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  fetchBankingOverview,
  maskIban,
  type BankingOverviewResponse,
} from '@/lib/banking';
import { formatHrMoney, formatHrSnapshot } from '@/lib/formatHr';

import { BalanceCell } from './BalanceCell';

type Props = { origin: string; token: string };

export function BankingOverview({ origin, token }: Props) {
  const [data, setData] = useState<BankingOverviewResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchBankingOverview(origin, token)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Pregled se nije učitao.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token]);

  if (loading && !data) return <div className="loading">Učitavanje pregleda…</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  const currencyLines = Object.entries(data.account_count_by_currency);

  return (
    <div className="dash banking-overview">
      <p className="as-of">
        Presjek <time dateTime={data.as_of}>{formatHrSnapshot(data.as_of)}</time>
      </p>

      <section className="dash-section" aria-labelledby="bank-kpi-heading">
        <h2 id="bank-kpi-heading">Sažetak</h2>
        <div className="dash-kpis">
          <div className="dash-kpi">
            <h3>Neusklađene transakcije</h3>
            <p>{data.unmatched_transaction_count}</p>
          </div>
          <div className="dash-kpi">
            <h3>Prijedlozi usklađivanja</h3>
            <p>{data.suggested_transaction_count}</p>
          </div>
          <div className="dash-kpi">
            <h3>Izvodi</h3>
            <p>{data.statement_count}</p>
          </div>
          <div className="dash-kpi">
            <h3>Aktivni računi</h3>
            <p>{data.accounts.length}</p>
          </div>
        </div>
        {currencyLines.length > 0 && (
          <p className="dash-lead">
            Broj računa po valuti:{' '}
            {currencyLines.map(([ccy, count]) => `${count} ${ccy}`).join(' · ')}
            {' '}
            (salda se ne zbrajaju preko valuta).
          </p>
        )}
      </section>

      <section className="dash-section" aria-labelledby="bank-acc-heading">
        <h2 id="bank-acc-heading">Salda po računu</h2>
        {data.accounts.length === 0 ? (
          <p className="table-empty">Nema aktivnih bankovnih računa.</p>
        ) : (
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Račun</th>
                  <th>IBAN</th>
                  <th>Valuta</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{account.account_name}</strong>
                        <span>{account.bank_name}</span>
                      </div>
                    </td>
                    <td>
                      <code>{maskIban(account.iban)}</code>
                    </td>
                    <td>{account.currency}</td>
                    <td>
                      <BalanceCell balances={account.balances} />
                      {!account.balances.length && (
                        <span className="text-muted">
                          {formatHrMoney(null, account.currency)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
