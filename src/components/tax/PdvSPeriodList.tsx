'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrMoney } from '@/lib/formatHr';
import {
  fetchPdvPeriods,
  fetchPdvSPeriod,
  formatPdvPeriodLabel,
  pdvSHref,
  pdvSSubmissionLabel,
  sumPdvSTotals,
  type PdvPeriod,
} from '@/lib/pdv';

type Props = { slug: string; origin: string; token: string };

type ListRow = PdvPeriod & {
  total_goods: string | null;
  total_services: string | null;
  predano_label: string | null;
  submitted_at: string | null;
};

export function PdvSPeriodList({ slug, origin, token }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPdvPeriods(origin, token)
      .then(async (data) => {
        const withTotals = await Promise.all(
          data.results.map(async (row) => {
            try {
              const pdvS = await fetchPdvSPeriod(origin, token, row.period);
              return {
                ...row,
                total_goods: pdvS.total_goods,
                total_services: pdvS.total_services,
                predano_label: pdvSSubmissionLabel(pdvS.current_submission),
                submitted_at: pdvS.current_submission?.submitted_at ?? null,
              };
            } catch (err) {
              if (err instanceof ApiError && err.status === 401) throw err;
              return {
                ...row,
                total_goods: null,
                total_services: null,
                predano_label: null,
                submitted_at: null,
              };
            }
          }),
        );
        if (!cancelled) setRows(withTotals);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'PDV-S razdoblja se nisu učitala.');
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
    return <p className="docs-empty">Nema razdoblja za PDV-S.</p>;
  }

  const totals = sumPdvSTotals(rows);

  return (
    <div className="tax-workflow">
      <dl className="tax-status-grid">
        <div>
          <dt>Ukupno dobra</dt>
          <dd>{formatHrMoney(totals.total_goods, 'EUR')}</dd>
        </div>
        <div>
          <dt>Ukupno usluge</dt>
          <dd>{formatHrMoney(totals.total_services, 'EUR')}</dd>
        </div>
      </dl>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Razdoblje</th>
              <th>Knjiga</th>
              <th className="cell-amount">Dobra</th>
              <th className="cell-amount">Usluge</th>
              <th>Predano</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period}>
                <td>
                  <Link href={pdvSHref(slug, row.period)}>{formatPdvPeriodLabel(row.period)}</Link>
                </td>
                <td>{row.has_ledger ? 'Da' : 'Ne'}</td>
                <td className="cell-amount">{formatHrMoney(row.total_goods, 'EUR')}</td>
                <td className="cell-amount">{formatHrMoney(row.total_services, 'EUR')}</td>
                <td>
                  {row.predano_label && row.predano_label !== '—'
                    ? `${row.predano_label} · ${formatHrDateTime(row.submitted_at)}`
                    : '—'}
                </td>
                <td className="banking-col-action">
                  <Link href={pdvSHref(slug, row.period)}>Otvori PDV-S</Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>Ukupno</th>
              <th className="cell-amount">{formatHrMoney(totals.total_goods, 'EUR')}</th>
              <th className="cell-amount">{formatHrMoney(totals.total_services, 'EUR')}</th>
              <th></th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
