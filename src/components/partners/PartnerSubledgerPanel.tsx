'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  shouldShowSubledgerItemBankClose,
  subledgerItemBankCloseHref,
  subledgerItemDocumentLink,
} from '@/lib/bankingReconcile';
import { AGING_BUCKET_LABELS, SUBLEDGER_LABELS } from '@/lib/documentLabels';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';
import { fetchPartnerSubledger, type PartnerSubledgerList } from '@/lib/partners';

type Props = {
  slug: string;
  origin: string;
  token: string;
  partnerId: number;
};

type SubledgerRow = PartnerSubledgerList['results'][number];

function sortByDueDateDesc(rows: SubledgerRow[]) {
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

function statusLabel(status: string): string {
  return SUBLEDGER_LABELS[status] || status;
}

function agingLabel(bucket: string): string {
  return AGING_BUCKET_LABELS[bucket] || bucket;
}

function SubledgerTable({
  slug,
  rows,
  loading,
  emptyMessage,
  showActions,
}: {
  slug: string;
  rows: SubledgerRow[];
  loading: boolean;
  emptyMessage: string;
  showActions: boolean;
}) {
  const colSpan = showActions ? 7 : 6;
  return (
    <div className="table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Smjer</th>
            <th>Dokument</th>
            <th>Dospijeće</th>
            <th>{showActions ? 'Otvoreno' : 'Iznos'}</th>
            <th>Bucket</th>
            <th>Status</th>
            {showActions ? <th>Akcije</th> : null}
          </tr>
        </thead>
        <tbody>
          {!rows.length && !loading ? (
            <tr>
              <td colSpan={colSpan} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const documentLink = subledgerItemDocumentLink(slug, {
                source_type: row.source_type,
                source_id: row.source_id,
                source_label: row.source_label,
              });
              const showBankClose =
                showActions && shouldShowSubledgerItemBankClose(row.status);
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
                  <td>
                    {formatHrAmount(showActions ? row.open_amount : row.original_amount)}
                  </td>
                  <td>{agingLabel(row.aging_bucket)}</td>
                  <td>{statusLabel(row.status)}</td>
                  {showActions ? (
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
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PartnerSubledgerPanel({ slug, origin, token, partnerId }: Props) {
  const [data, setData] = useState<PartnerSubledgerList | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPartnerSubledger(origin, token, partnerId, { includeClosed: true })
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

  const openRows = data ? sortByDueDateDesc(data.results) : [];
  const closedRows = data ? sortByDueDateDesc(data.closed_results) : [];
  const documentsHref = `/t/${slug}/partneri/${partnerId}/dokumenti`;

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      {loading ? <div className="loading">Učitavanje…</div> : null}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="partner-section-title">Otvorene stavke</h2>
        {!loading && openRows.length === 0 ? (
          <p role="status">
            Nema otvorenih potraživanja ni obveza.{' '}
            <Link href={documentsHref}>Pogledaj dokumente partnera</Link>
          </p>
        ) : null}
        {(loading || openRows.length > 0) && (
          <SubledgerTable
            slug={slug}
            rows={openRows}
            loading={loading}
            emptyMessage="Nema otvorenih potraživanja ni obveza."
            showActions
          />
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="partner-section-title">
          Zatvorene stavke{data != null ? ` (${data.closed_count})` : ''}
        </h2>
        <SubledgerTable
          slug={slug}
          rows={closedRows}
          loading={loading}
          emptyMessage="Nema zatvorenih stavki."
          showActions={false}
        />
      </section>
    </div>
  );
}
