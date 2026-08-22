'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  shouldShowSubledgerItemBankClose,
  subledgerItemBankCloseHref,
  subledgerItemDocumentLink,
} from '@/lib/bankingReconcile';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';
import { fetchPartnerSubledger, type PartnerSubledgerList } from '@/lib/partners';

type Props = {
  slug: string;
  origin: string;
  token: string;
  partnerId: number;
};

function sortSubledgerByDueDateDesc(rows: PartnerSubledgerList['results']) {
  return [...rows].sort((a, b) => {
    const aDue = a.due_date || '';
    const bDue = b.due_date || '';
    if (!aDue && !bDue) return b.item_id - a.item_id;
    if (!aDue) return 1;
    if (!bDue) return -1;
    if (aDue !== bDue) return bDue.localeCompare(aDue);
    return b.item_id - a.item_id;
  });
}

export function PartnerSubledgerPanel({ slug, origin, token, partnerId }: Props) {
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

  const rows = data ? sortSubledgerByDueDateDesc(data.results) : [];

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
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && !loading ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  Nema otvorenih stavki.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const documentLink = subledgerItemDocumentLink(slug, row);
                const showBankClose = shouldShowSubledgerItemBankClose(row.status);
                return (
                  <tr key={row.item_id}>
                    <td>{row.direction_label}</td>
                    <td>
                      {documentLink ? (
                        <Link href={documentLink.href}>{documentLink.label}</Link>
                      ) : (
                        row.source_label
                      )}
                    </td>
                    <td>{formatHrInputDate(row.due_date)}</td>
                    <td>{formatHrAmount(row.open_amount)}</td>
                    <td>{row.aging_bucket}</td>
                    <td>{row.status}</td>
                    <td className="banking-col-action">
                      {showBankClose ? (
                        <Link
                          className="btn btn-secondary"
                          href={subledgerItemBankCloseHref(slug, row.item_id)}
                        >
                          Zatvori bankom
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
