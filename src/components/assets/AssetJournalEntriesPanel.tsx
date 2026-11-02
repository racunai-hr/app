'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  assetJournalRoleLabel,
  fetchAssetJournalEntries,
  journalAuditStatusLabel,
  type AssetJournalEntry,
  type CapitalizationReconciliation,
} from '@/lib/assets';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';

type Props = { slug: string; origin: string; token: string; assetId: number };

export function AssetJournalEntriesPanel({ slug, origin, token, assetId }: Props) {
  const [rows, setRows] = useState<AssetJournalEntry[] | null>(null);
  const [reconciliation, setReconciliation] = useState<CapitalizationReconciliation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAssetJournalEntries(origin, token, assetId)
      .then((data) => {
        if (cancelled) return;
        setRows(data.results);
        setReconciliation(data.reconciliation);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Temeljnice se nisu učitale.');
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
  if (loading || rows === null || reconciliation === null) {
    return <div className="loading">Učitavanje…</div>;
  }

  return (
    <>
      <section className="asset-recon" aria-label="Usklađenje">
        <h2>Usklađenje</h2>
        <dl className="incoming-dl incoming-dl-inline">
          <div>
            <dt>Kapitalizirano</dt>
            <dd>{formatHrAmount(reconciliation.capitalized_net)}</dd>
          </div>
          <div>
            <dt>Nabavna vrijednost</dt>
            <dd>{formatHrAmount(reconciliation.acquisition_cost)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{reconciliation.balanced ? 'Usklađeno' : `Razlika ${formatHrAmount(reconciliation.difference)}`}</dd>
          </div>
        </dl>
        {!reconciliation.balanced && (
          <p className="warning" role="status">
            Kapitalizirani promet i nabavna vrijednost se razlikuju za{' '}
            {formatHrAmount(reconciliation.difference)}.
          </p>
        )}
        <p className="muted">
          Usklađenje zbraja samo nabavu i ovisne troškove. Tablica ispod prikazuje i ostale
          povezane temeljnice.
        </p>
      </section>

      {rows.length === 0 ? (
        <p className="table-empty">Nema povezanih temeljnica.</p>
      ) : (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Broj</th>
                <th>Opis</th>
                <th>Vrsta</th>
                <th>Status</th>
                <th>Iznos</th>
                <th>Kapitalizirano</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.journal_entry_id}>
                  <td>{row.entry_date ? formatHrInputDate(row.entry_date) : '—'}</td>
                  <td>
                    <Link href={`/t/${slug}/glavna-knjiga/${row.journal_entry_id}`}>
                      {row.entry_number}
                    </Link>
                  </td>
                  <td>{row.description || '—'}</td>
                  <td>{assetJournalRoleLabel(row.role)}</td>
                  <td>{journalAuditStatusLabel(row.audit_kind, row.status)}</td>
                  <td className="cell-amount">{formatHrAmount(row.total_amount)}</td>
                  <td className="cell-amount">
                    {row.capitalized_amount == null ? '—' : formatHrAmount(row.capitalized_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
