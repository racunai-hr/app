'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrMoney } from '@/lib/formatHr';
import {
  fetchPdvPeriods,
  formatPdvPeriodLabel,
  pdvPeriodStatusLabel,
  pdvReturnStatusLabel,
  type PdvPeriod,
} from '@/lib/pdv';
import { useRouter } from 'next/navigation';

type Props = { origin: string; token: string };

export function PdvPeriodList({ origin, token }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<PdvPeriod[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPdvPeriods(origin, token)
      .then((data) => {
        if (!cancelled) setRows(data.results);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'PDV razdoblja se nisu učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, router]);

  if (error) return <div className="error">{error}</div>;
  if (loading && !rows) return <div className="loading">Učitavanje…</div>;
  if (!rows?.length) {
    return <p className="docs-empty">Nema PDV razdoblja za ovu tvrtku.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Razdoblje</th>
            <th>Status</th>
            <th>Knjiga</th>
            <th>Prijava</th>
            <th className="cell-amount">PDV za uplatu</th>
            <th>Predano</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.period}>
              <td>{formatPdvPeriodLabel(row.period)}</td>
              <td>{pdvPeriodStatusLabel(row.period_status)}</td>
              <td>{row.has_ledger ? 'Da' : 'Ne'}</td>
              <td>
                {row.return_version != null
                  ? `v${row.return_version} · ${pdvReturnStatusLabel(row.return_status)}`
                  : '—'}
              </td>
              <td className="cell-amount">{formatHrMoney(row.vat_due, 'EUR')}</td>
              <td>{formatHrDateTime(row.submitted_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
