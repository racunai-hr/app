'use client';

import { useEffect, useState } from 'react';

import { formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import {
  fetchPartnerFinancialSummary,
  type PartnerFinancialSummary,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  partnerId: number;
};

function netBalanceVerdict(summary: PartnerFinancialSummary): string {
  const net = Number(summary.net_balance);
  if (!Number.isFinite(net) || net === 0) {
    return `Nema neto duga (${formatHrMoney('0.00', summary.currency)}).`;
  }
  const amount = formatHrMoney(Math.abs(net), summary.currency);
  if (net > 0) {
    return `Partner nam duguje ${amount}.`;
  }
  return `Dugujemo partneru ${amount}.`;
}

export function PartnerFinancialSummaryStrip({ origin, token, partnerId }: Props) {
  const [summary, setSummary] = useState<PartnerFinancialSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPartnerFinancialSummary(origin, token, partnerId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Sažetak nije dostupan.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, partnerId]);

  if (error) {
    return <div className="error">{error}</div>;
  }
  if (loading && !summary) {
    return <div className="loading">Učitavanje…</div>;
  }
  if (!summary) {
    return null;
  }

  return (
    <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
      <p className="banking-role-note" role="status" style={{ marginTop: 0 }}>
        <strong>{netBalanceVerdict(summary)}</strong> Financijski sažetak je projekcija Finance
        domene (stanje na dan {formatHrInputDate(summary.as_of_date)}).
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Potraživanja</th>
            <th>Obveze</th>
            <th>Dospjelo (AR)</th>
            <th>Dospjelo (AP)</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{formatHrMoney(summary.receivables_open, summary.currency)}</td>
            <td>{formatHrMoney(summary.payables_open, summary.currency)}</td>
            <td>{formatHrMoney(summary.receivables_overdue, summary.currency)}</td>
            <td>{formatHrMoney(summary.payables_overdue, summary.currency)}</td>
            <td>{formatHrMoney(summary.net_balance, summary.currency)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
