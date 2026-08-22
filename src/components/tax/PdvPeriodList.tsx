'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrMoney } from '@/lib/formatHr';
import {
  fetchPdvPeriods,
  formatPdvPeriodLabel,
  pdvKontrolniHref,
  pdvPeriodStatusLabel,
  pdvPrijavaHref,
  pdvReturnStatusLabel,
  pdvSHref,
  type PdvPeriod,
} from '@/lib/pdv';

type Props = { slug: string; origin: string; token: string };

export function PdvPeriodList({ slug, origin, token }: Props) {
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.period}>
              <td>
                <Link href={pdvPrijavaHref(slug, row.period)}>{formatPdvPeriodLabel(row.period)}</Link>
              </td>
              <td>{pdvPeriodStatusLabel(row.period_status)}</td>
              <td>{row.has_ledger ? 'Da' : 'Ne'}</td>
              <td>
                {row.return_version != null
                  ? `v${row.return_version} · ${pdvReturnStatusLabel(row.return_status)}`
                  : '—'}
              </td>
              <td className="cell-amount">{formatHrMoney(row.vat_due, 'EUR')}</td>
              <td>{formatHrDateTime(row.submitted_at)}</td>
              <td className="banking-col-action">
                <Link href={pdvKontrolniHref(slug, row.period)}>Pregledi</Link>
                {' · '}
                <Link href={pdvPrijavaHref(slug, row.period)}>Prijava</Link>
                {' · '}
                <Link href={pdvSHref(slug, row.period)}>PDV-S</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
