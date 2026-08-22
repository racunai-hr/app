'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

import { ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { documentsListHref } from '@/lib/documentListQuery';
import { controlLabel, DIRECTION_LABELS, noticeLabel, statusLabel } from '@/lib/documentLabels';
import {
  downloadDocumentPdf,
  downloadDocumentUbl,
  fetchDocument,
  type DocumentDetail,
  type DocumentDirection,
} from '@/lib/documents';
import { formatHrDateTime, formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import { provenanceText } from '@/lib/provenance';
import { ProvenanceBadge } from './ProvenanceBadge';

type Selection = {
  direction: DocumentDirection;
  id: number;
};

type Props = {
  selection: Selection;
  origin: string;
  /** Required for drawer; unused in page mode. */
  onClose?: () => void;
  mode?: 'drawer' | 'page';
  slug?: string;
};

function DetailBody({
  detail,
  slug,
  downloading,
  onDownload,
}: {
  detail: DocumentDetail;
  slug?: string;
  downloading: 'pdf' | 'ubl' | null;
  onDownload: (kind: 'pdf' | 'ubl') => void;
}) {
  const currency = detail.amounts.currency || 'EUR';

  return (
    <div className="docs-detail-body">
      <dl className="docs-detail-grid">
        <div>
          <dt>Partner</dt>
          <dd>
            {detail.partner_id && slug ? (
              <Link href={`/t/${slug}/partneri/${detail.partner_id}`}>
                {detail.partner_name || '—'}
              </Link>
            ) : (
              detail.partner_name || '—'
            )}
          </dd>
        </div>
        <div>
          <dt>OIB</dt>
          <dd>{detail.partner_oib || '—'}</dd>
        </div>
        <div>
          <dt>Datum</dt>
          <dd>{formatHrInputDate(detail.document_date)}</dd>
        </div>
        <div>
          <dt>Dospijeće</dt>
          <dd>{formatHrInputDate(detail.due_date)}</dd>
        </div>
        <div>
          <dt>Izvorni broj</dt>
          <dd>{detail.source_number || '—'}</dd>
        </div>
        <div>
          <dt>Interni broj</dt>
          <dd>{detail.internal_number || '—'}</dd>
        </div>
        <div>
          <dt>Neto</dt>
          <dd>{formatHrMoney(detail.amounts.net, currency)}</dd>
        </div>
        <div>
          <dt>PDV</dt>
          <dd>{formatHrMoney(detail.amounts.vat, currency)}</dd>
        </div>
        <div>
          <dt>Bruto</dt>
          <dd>{formatHrMoney(detail.amounts.gross, currency)}</dd>
        </div>
        <div>
          <dt>Status dokumenta</dt>
          <dd>
            {detail.document_status.value != null
              ? statusLabel(String(detail.document_status.value))
              : provenanceText(detail.document_status as Parameters<typeof provenanceText>[0])}
          </dd>
        </div>
        <div>
          <dt>Operativni status</dt>
          <dd>
            <ProvenanceBadge
              field={detail.operational_status as Parameters<typeof ProvenanceBadge>[0]['field']}
            />
          </dd>
        </div>
        <div>
          <dt>PDV lifecycle</dt>
          <dd>
            <ProvenanceBadge
              field={detail.vat.lifecycle as Parameters<typeof ProvenanceBadge>[0]['field']}
            />
          </dd>
        </div>
        <div>
          <dt>Knjiženje</dt>
          <dd>
            {provenanceText(detail.posting.state as Parameters<typeof provenanceText>[0])}
            {detail.posting.entry_number?.value != null
              ? ` · ${String(detail.posting.entry_number.value)}`
              : ''}
          </dd>
        </div>
        <div>
          <dt>Saldakonto</dt>
          <dd>
            {provenanceText(detail.subledger.state as Parameters<typeof provenanceText>[0])}
            {' · otvoreno '}
            {provenanceText(detail.subledger.open_amount as Parameters<typeof provenanceText>[0], (v) =>
              formatHrMoney(
                typeof v === 'number' || typeof v === 'string' ? v : String(v),
                currency,
              ),
            )}
          </dd>
        </div>
        <div>
          <dt>Banka</dt>
          <dd>
            {provenanceText(detail.bank.match_status as Parameters<typeof provenanceText>[0])}
          </dd>
        </div>
      </dl>

      {(detail.description || detail.notes) && (
        <section className="docs-detail-section">
          <h3>Opis</h3>
          {detail.description ? <p>{detail.description}</p> : null}
          {detail.notes ? <p className="muted-inline">{detail.notes}</p> : null}
        </section>
      )}

      {(detail.controls.length > 0 || detail.notices.length > 0) && (
        <section className="docs-detail-section">
          <h3>Kontrole</h3>
          <div className="chip-list">
            {detail.controls.map((code) => (
              <span key={code} className="chip chip-alert">
                {controlLabel(code)}
              </span>
            ))}
            {detail.notices.map((code) => (
              <span key={code} className="chip chip-notice">
                {noticeLabel(code)}
              </span>
            ))}
          </div>
        </section>
      )}

      {detail.items.length > 0 && (
        <section className="docs-detail-section">
          <h3>Stavke</h3>
          <ul className="docs-detail-items">
            {detail.items.map((item, index) => (
              <li key={`${item.item_name}-${index}`}>
                <span>{item.item_name}</span>
                <span className="muted-inline">{formatHrMoney(item.line_total, currency)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.journal_lines.length > 0 && (
        <section className="docs-detail-section">
          <h3>Stavke temeljnice</h3>
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Konto</th>
                  <th>Opis</th>
                  <th>Duguje</th>
                  <th>Potražuje</th>
                </tr>
              </thead>
              <tbody>
                {detail.journal_lines.map((line, index) => (
                  <tr key={`${line.account_code}-${index}`}>
                    <td>
                      {line.account_code}
                      {line.account_name ? ` · ${line.account_name}` : ''}
                    </td>
                    <td>{line.description || '—'}</td>
                    <td>{formatHrMoney(line.debit, currency)}</td>
                    <td>{formatHrMoney(line.credit, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {detail.payments.length > 0 && (
        <section className="docs-detail-section">
          <h3>Plaćanja</h3>
          <ul className="docs-detail-items">
            {detail.payments.map((pay) => (
              <li key={pay.id}>
                <span>
                  {pay.payment_number} · {pay.payment_method} · {pay.status}
                </span>
                <span className="muted-inline">
                  {formatHrMoney(pay.amount, currency)}
                  {pay.payment_date ? ` · ${formatHrInputDate(pay.payment_date)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.allocations.length > 0 && (
        <section className="docs-detail-section">
          <h3>Alokacije</h3>
          <ul className="docs-detail-items">
            {detail.allocations.map((alloc) => (
              <li key={alloc.id}>
                <span>#{alloc.id}</span>
                <span className="muted-inline">
                  {formatHrMoney(alloc.amount, currency)}
                  {alloc.created_at ? ` · ${formatHrDateTime(alloc.created_at)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.ledger_entries.length > 0 && (
        <section className="docs-detail-section">
          <h3>PDV knjiga</h3>
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Okvir</th>
                  <th>Stopa</th>
                  <th>Osnovica</th>
                  <th>PDV</th>
                </tr>
              </thead>
              <tbody>
                {detail.ledger_entries.map((row, index) => (
                  <tr key={`${row.ledger_type}-${row.vat_box}-${index}`}>
                    <td>{row.ledger_type}</td>
                    <td>{row.vat_box}</td>
                    <td>{row.vat_rate}</td>
                    <td>{formatHrMoney(row.base_amount, currency)}</td>
                    <td>{formatHrMoney(row.vat_amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {detail.attachments.length > 0 && (
        <section className="docs-detail-section">
          <h3>Privici</h3>
          <ul className="docs-detail-items">
            {detail.attachments.map((att) => (
              <li key={att.id}>
                <span>{att.original_filename || `Privitak #${att.id}`}</span>
                <span className="muted-inline">{att.kind || '—'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(detail.pdf_available || detail.ubl_available) && (
        <section className="docs-detail-section docs-detail-actions">
          <h3>Dokazi</h3>
          <div className="export-actions">
            {detail.pdf_available ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={downloading !== null}
                onClick={() => onDownload('pdf')}
              >
                {downloading === 'pdf' ? 'PDF…' : 'Preuzmi PDF'}
              </button>
            ) : null}
            {detail.ubl_available ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={downloading !== null}
                onClick={() => onDownload('ubl')}
              >
                {downloading === 'ubl' ? 'UBL…' : 'Preuzmi UBL'}
              </button>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

export function DocumentDetailPanel({
  selection,
  origin,
  onClose,
  mode = 'drawer',
  slug,
}: Props) {
  const titleId = useId();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'ubl' | null>(null);
  const isPage = mode === 'page';

  useEffect(() => {
    if (isPage || !onClose) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPage, onClose]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError('Prijava je istekla.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setDetail(null);
    fetchDocument(origin, token, selection.direction, selection.id)
      .then((body) => {
        if (!cancelled) setDetail(body);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Detalj se nije učitao.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, selection.direction, selection.id]);

  async function handleDownload(kind: 'pdf' | 'ubl') {
    const token = getAccessToken();
    if (!token || !detail) return;
    setDownloading(kind);
    setError('');
    try {
      if (kind === 'pdf') {
        await downloadDocumentPdf(origin, token, detail.direction, detail.id);
      } else {
        await downloadDocumentUbl(origin, token, detail.direction, detail.id);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Preuzimanje nije uspjelo.');
      }
    } finally {
      setDownloading(null);
    }
  }

  const title =
    detail?.internal_number ||
    detail?.source_number ||
    `${DIRECTION_LABELS[selection.direction]} #${selection.id}`;

  const header = (
    <header className="docs-detail-head">
      <div>
        <p className="docs-detail-kicker">{DIRECTION_LABELS[selection.direction]}</p>
        <h2 id={titleId}>{title}</h2>
      </div>
      {isPage && slug ? (
        <Link
          className="btn btn-secondary"
          href={documentsListHref(slug, { direction: selection.direction })}
        >
          Natrag na dokumente
        </Link>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Zatvori
        </button>
      )}
    </header>
  );

  const content = (
    <>
      {header}
      {loading && <div className="loading">Učitavanje detalja…</div>}
      {error && <div className="error">{error}</div>}
      {detail && (
        <DetailBody
          detail={detail}
          slug={slug}
          downloading={downloading}
          onDownload={handleDownload}
        />
      )}
    </>
  );

  if (isPage) {
    return (
      <div className="docs-shell">
        <article className="docs-detail-page" aria-labelledby={titleId}>
          {content}
        </article>
      </div>
    );
  }

  return (
    <div className="docs-detail-overlay" onClick={onClose} role="presentation">
      <aside
        className="docs-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </aside>
    </div>
  );
}
