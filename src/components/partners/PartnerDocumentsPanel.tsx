'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import { fetchDocuments, type DocumentSummary } from '@/lib/documents';

type Props = {
  origin: string;
  token: string;
  partnerId: number;
};

export function PartnerDocumentsPanel({ origin, token, partnerId }: Props) {
  const [rows, setRows] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDocuments(origin, token, { partner: partnerId, page_size: 50 })
      .then((data) => {
        if (!cancelled) setRows(data.results);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Dokumenti nisu učitani.');
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
      <p className="banking-role-note">Izvor: Documents API (`?partner=`), ne partners proxy.</p>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Smjer</th>
              <th>Broj</th>
              <th>Datum</th>
              <th>Iznos</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  Nema dokumenata za ovog partnera.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.direction}-${row.id}`}>
                  <td>{row.direction === 'outgoing' ? 'Izlazni' : 'Ulazni'}</td>
                  <td>{row.internal_number || row.source_number || row.id}</td>
                  <td>{row.document_date || '—'}</td>
                  <td>
                    {row.amounts.gross || '—'} {row.amounts.currency}
                  </td>
                  <td>{row.document_status.value || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
