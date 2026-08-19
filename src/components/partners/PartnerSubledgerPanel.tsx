'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import { fetchPartnerSubledger, type PartnerSubledgerList } from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  partnerId: number;
};

export function PartnerSubledgerPanel({ origin, token, partnerId }: Props) {
  const [data, setData] = useState<PartnerSubledgerList | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPartnerSubledger(origin, token, partnerId)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Saldakonto nije učitan.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, partnerId]);

  return (
    <div>
      <p className="banking-role-note">Izvor: Finance API `/api/finance/partners/…/subledger/`.</p>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Smjer</th>
              <th>Dokument</th>
              <th>Dospijeće</th>
              <th>Otvoreno</th>
              <th>Bucket</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!data?.results.length && !loading ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  Nema otvorenih stavki.
                </td>
              </tr>
            ) : (
              data?.results.map((row) => (
                <tr key={row.item_id}>
                  <td>{row.direction_label}</td>
                  <td>{row.source_label}</td>
                  <td>{row.due_date || '—'}</td>
                  <td>{row.open_amount}</td>
                  <td>{row.aging_bucket}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
