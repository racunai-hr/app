'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  fetchDepreciationSchedule,
  formatDepreciationPeriod,
  type DepreciationScheduleItem,
} from '@/lib/assets';
import { formatHrAmount } from '@/lib/formatHr';

type Props = { slug: string; origin: string; token: string; assetId: number };

export function AssetDepreciationPanel({ slug, origin, token, assetId }: Props) {
  const [rows, setRows] = useState<DepreciationScheduleItem[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchDepreciationSchedule(origin, token, assetId)
      .then((data) => {
        if (!cancelled) setRows(data.results);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Plan amortizacije se nije učitao.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, assetId]);

  if (error) return <div className="error">{error}</div>;
  if (loading || rows === null) return <div className="loading">Učitavanje…</div>;
  if (rows.length === 0) return <p className="table-empty">Nema obračuna amortizacije.</p>;

  return (
    <div className="table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Razdoblje</th>
            <th>Iznos</th>
            <th>Akum. amort.</th>
            <th>Knjig. vr. nakon</th>
            <th>Status</th>
            <th>Temeljnica</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDepreciationPeriod(row.year, row.month)}</td>
              <td className="cell-amount">{formatHrAmount(row.depreciation_amount)}</td>
              <td className="cell-amount">{formatHrAmount(row.accumulated_depreciation)}</td>
              <td className="cell-amount">{formatHrAmount(row.book_value_after)}</td>
              <td>{row.posted ? 'Knjiženo' : 'Nije knjiženo'}</td>
              <td>
                {row.journal_entry_id != null ? (
                  <Link href={`/t/${slug}/glavna-knjiga/${row.journal_entry_id}`}>Temeljnica</Link>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
