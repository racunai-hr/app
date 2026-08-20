'use client';

import { useEffect, useId, useState } from 'react';

import { ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { controlLabel, DIRECTION_LABELS, noticeLabel, statusLabel } from '@/lib/documentLabels';
import {
  downloadDocumentPdf,
  downloadDocumentUbl,
  fetchDocument,
  type DocumentDetail,
  type DocumentDirection,
} from '@/lib/documents';
import { formatHrMoney } from '@/lib/formatHr';
import { provenanceText } from '@/lib/provenance';
import { ProvenanceBadge } from './ProvenanceBadge';

type Selection = {
  direction: DocumentDirection;
  id: number;
};

type Props = {
  selection: Selection;
  origin: string;
  onClose: () => void;
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}.`;
}

export function DocumentDetailPanel({ selection, origin, onClose }: Props) {
  const titleId = useId();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'ubl' | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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

  return (
    <div className="docs-detail-overlay" onClick={onClose} role="presentation">
      <aside
        className="docs-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="docs-detail-head">
          <div>
            <p className="docs-detail-kicker">{DIRECTION_LABELS[selection.direction]}</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Zatvori
          </button>
        </header>

        {loading && <div className="loading">Učitavanje detalja…</div>}
        {error && <div className="error">{error}</div>}

        {detail && (
          <div className="docs-detail-body">
            <dl className="docs-detail-grid">
              <div>
                <dt>Partner</dt>
                <dd>{detail.partner_name || '—'}</dd>
              </div>
              <div>
                <dt>OIB</dt>
                <dd>{detail.partner_oib || '—'}</dd>
              </div>
              <div>
                <dt>Datum</dt>
                <dd>{formatDate(detail.document_date)}</dd>
              </div>
              <div>
                <dt>Dospijeće</dt>
                <dd>{formatDate(detail.due_date)}</dd>
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
                <dd>{formatHrMoney(detail.amounts.net, detail.amounts.currency)}</dd>
              </div>
              <div>
                <dt>PDV</dt>
                <dd>{formatHrMoney(detail.amounts.vat, detail.amounts.currency)}</dd>
              </div>
              <div>
                <dt>Bruto</dt>
                <dd>{formatHrMoney(detail.amounts.gross, detail.amounts.currency)}</dd>
              </div>
              <div>
                <dt>Status dokumenta</dt>
                <dd>
                  {detail.document_status.value != null
                    ? statusLabel(detail.document_status.value)
                    : provenanceText(detail.document_status)}
                </dd>
              </div>
              <div>
                <dt>Operativni status</dt>
                <dd>
                  <ProvenanceBadge field={detail.operational_status} />
                </dd>
              </div>
              <div>
                <dt>PDV lifecycle</dt>
                <dd>
                  <ProvenanceBadge field={detail.vat.lifecycle} />
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
                      <span className="muted-inline">
                        {formatHrMoney(item.line_total, detail.amounts.currency)}
                      </span>
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
                      onClick={() => handleDownload('pdf')}
                    >
                      {downloading === 'pdf' ? 'PDF…' : 'Preuzmi PDF'}
                    </button>
                  ) : null}
                  {detail.ubl_available ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={downloading !== null}
                      onClick={() => handleDownload('ubl')}
                    >
                      {downloading === 'ubl' ? 'UBL…' : 'Preuzmi UBL'}
                    </button>
                  ) : null}
                </div>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
