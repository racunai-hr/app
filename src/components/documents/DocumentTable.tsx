import Link from 'next/link';

import { controlLabel, noticeLabel, DIRECTION_LABELS, statusLabel } from '@/lib/documentLabels';
import type { DocumentDirection, DocumentSummary } from '@/lib/documents';
import { formatHrAmount, formatHrMoney } from '@/lib/formatHr';
import { provenanceText } from '@/lib/provenance';
import { ProvenanceBadge } from './ProvenanceBadge';

type Props = {
  rows: DocumentSummary[];
  slug?: string;
  onOpenDocument?: (selection: { direction: DocumentDirection; id: number }) => void;
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}.`;
}

export function DocumentTable({ rows, slug, onOpenDocument }: Props) {
  if (rows.length === 0) {
    return <p className="table-empty">Nema dokumenata za odabrani filter.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Račun</th>
            <th>Partner</th>
            <th>Datumi</th>
            <th>Iznosi</th>
            <th>Status</th>
            <th>PDV</th>
            <th>Kontrole</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rawStatus = row.document_status.value;
            const period = row.vat.period;
            const label = `${DIRECTION_LABELS[row.direction]}${
              row.internal_number ? ` · ${row.internal_number}` : ''
            }`;
            const incomingHref =
              row.direction === 'incoming' && slug
                ? `/t/${slug}/dokumenti/ulazni/${row.id}`
                : null;
            return (
              <tr key={`${row.direction}-${row.id}`}>
                <td>
                  <div className="cell-stack">
                    {incomingHref ? (
                      <Link
                        href={incomingHref}
                        className="docs-row-open"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Detalji računa ${label}`}
                      >
                        {label}
                      </Link>
                    ) : onOpenDocument ? (
                      <button
                        type="button"
                        className="docs-row-open"
                        onClick={() => onOpenDocument({ direction: row.direction, id: row.id })}
                        aria-label={`Detalji računa ${label}`}
                      >
                        {label}
                      </button>
                    ) : (
                      <span>{label}</span>
                    )}
                    <span className="muted-inline">
                      {row.source_number ? `Izvorni broj: ${row.source_number}` : 'Izvorni broj: —'}
                    </span>
                  </div>
                </td>
                <td>{row.partner_name || '—'}</td>
                <td>
                  <div className="cell-stack">
                    <span>{formatDate(row.document_date)}</span>
                    <span className="muted-inline">Dospijeće: {formatDate(row.due_date)}</span>
                  </div>
                </td>
                <td className="cell-amount">
                  <div className="cell-stack">
                    <span>{formatHrMoney(row.amounts.gross, row.amounts.currency)}</span>
                    <span className="muted-inline">
                      Otvoreno:{' '}
                      {provenanceText(row.subledger.open_amount, (value) =>
                        formatHrAmount(typeof value === 'number' || typeof value === 'string' ? value : String(value)),
                      )}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="cell-stack">
                    <ProvenanceBadge field={row.operational_status} />
                    {rawStatus != null && (
                      <span className="raw-status">Status dokumenta: {statusLabel(rawStatus)}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="cell-stack">
                    <ProvenanceBadge field={row.vat.lifecycle} />
                    <span className="muted-inline">
                      Razdoblje:{' '}
                      {period
                        ? provenanceText(period, (value) => String(value))
                        : 'nije evidentirano'}
                    </span>
                    {row.vat.disclaimer && (
                      <span className="muted-inline">Predaja ne potvrđuje obuhvat</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="chip-list">
                    {row.controls.map((code) => (
                      <span key={code} className="chip chip-alert">
                        {controlLabel(code)}
                      </span>
                    ))}
                    {row.notices.map((code) => (
                      <span key={code} className="chip chip-notice">
                        {noticeLabel(code)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
