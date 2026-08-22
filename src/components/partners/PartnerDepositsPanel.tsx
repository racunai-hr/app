'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  depositWorkflowLabel,
  fetchDeposits,
  type DepositDto,
} from '@/lib/finance';
import { formatHrAmount, formatHrInputDate, formatHrMoney } from '@/lib/formatHr';

type Props = {
  origin: string;
  token: string;
  partnerId: number;
  /** Present for shell compatibility; write controls are never shown here. */
  role?: string;
};

export function PartnerDepositsPanel({ origin, token, partnerId }: Props) {
  const [rows, setRows] = useState<DepositDto[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await fetchDeposits(origin, token, partnerId);
    setRows(list.results);
  }, [origin, token, partnerId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    reload()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Kaucije nisu učitane.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return (
    <div className="partner-deposits">
      <h2>Kaucije / depoziti</h2>
      <p className="banking-role-note">
        Pregled stanja na partneru — ne mjesto izvršenja workflowa (knjiženje, povrat, storno).
      </p>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Broj</th>
              <th>Datum</th>
              <th>Iznos</th>
              <th>Workflow</th>
              <th>Otvoreno</th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && !loading ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  Nema kaucija za ovog partnera.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.number}</td>
                  <td>{formatHrInputDate(row.deposit_date)}</td>
                  <td>{formatHrMoney(row.amount, row.currency)}</td>
                  <td>{depositWorkflowLabel(row.workflow_status)}</td>
                  <td>{formatHrAmount(row.open_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
