'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import {
  downloadDocumentPdf,
  downloadDocumentUbl,
  fetchDocument,
  tenantApiOrigin,
  type DocumentDetail,
} from '@/lib/documents';
import { formatHrMoney } from '@/lib/formatHr';

type Props = {
  slug: string;
  expenseId: number;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}.`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return new Intl.DateTimeFormat('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function money(value: string | null | undefined, currency = 'EUR'): string {
  if (value == null || value === '') return '—';
  return formatHrMoney(value, currency);
}

const DOCUMENT_STATUS_LABEL: Record<string, string> = {
  received: 'Zaprimljen',
  cancelled: 'Storniran',
  rejected: 'Odbijen',
};

const WORKFLOW_STATUS_LABEL: Record<string, string> = {
  pending: 'U obradi',
  approved: 'Odobren',
  cancelled: 'Storniran',
  rejected: 'Odbijen',
};

const INTEGRATION_STATUS_LABEL: Record<string, string> = {
  received: 'Uspješno zaprimljen',
};

const POSTING_STATUS_LABEL: Record<string, string> = {
  posted: 'Proknjiženo',
  unposted: 'Nije proknjiženo',
  draft: 'Nacrt',
};

const VAT_STATUS_LABEL: Record<string, string> = {
  recorded: 'Evidentiran',
  absent: 'Nije evidentiran',
};

const SUBLEDGER_STATUS_LABEL: Record<string, string> = {
  open: 'Otvoreno',
  partial: 'Djelomično',
  closed: 'Zatvoreno',
  cancelled: 'Otkazano',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  matched: 'Usklađeno',
  unmatched: 'Neusklađeno',
  suggested: 'Prijedlog',
};

const REFERENCE_TYPE_LABEL: Record<string, string> = {
  originator: 'Oznaka izvornog dokumenta',
  additional: 'Dodatna referenca',
  order: 'Narudžbenica',
  billing: 'Prethodni račun',
  contract: 'Ugovor',
  despatch: 'Otpremnica',
  receipt: 'Primka',
  project: 'Projekt',
  buyer: 'Buyer reference',
  payment: 'Poziv na broj',
};

function statusLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return map[value] || value;
}

export function IncomingExpenseDetail({ slug, expenseId }: Props) {
  const router = useRouter();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [origin, setOrigin] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'ubl' | null>(null);
  const [technicalOpen, setTechnicalOpen] = useState(false);

  useEffect(() => {
    const access = getAccessToken();
    if (!access) {
      setLoading(false);
      router.replace('/');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setErrorStatus(null);
    setDetail(null);
    fetchMe(access)
      .then((me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) throw new ApiError('Tvrtka nije pronađena.', 404);
        const apiOrigin = tenantApiOrigin(found.admin_url);
        if (cancelled) return null;
        setOrigin(apiOrigin);
        setToken(access);
        return fetchDocument(apiOrigin, access, 'incoming', expenseId);
      })
      .then((body) => {
        if (cancelled || !body) return;
        setDetail(body);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        if (err instanceof ApiError) {
          setErrorStatus(err.status);
          setError(
            err.status === 404
              ? 'Dokument nije pronađen ili nemate pristup.'
              : err.message || 'Detalje dokumenta trenutno nije moguće učitati.',
          );
          return;
        }
        setError(err instanceof Error ? err.message : 'Detalje dokumenta trenutno nije moguće učitati.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, expenseId, router]);

  async function handleDownload(kind: 'pdf' | 'ubl') {
    if (!detail || !origin || !token) return;
    setDownloading(kind);
    setError('');
    try {
      if (kind === 'pdf') {
        await downloadDocumentPdf(origin, token, 'incoming', detail.id);
      } else {
        await downloadDocumentUbl(origin, token, 'incoming', detail.id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Preuzimanje nije uspjelo.');
    } finally {
      setDownloading(null);
    }
  }

  const title =
    detail?.number ||
    detail?.source_number ||
    detail?.internal_number ||
    `Ulazni #${expenseId}`;
  const currency = detail?.totals?.currency || detail?.amounts?.currency || 'EUR';
  const supplier = detail?.supplier;
  const meta = detail?.document;
  const lifecycle = detail?.status;
  const integration = detail?.integration;
  const externalUrl = integration?.external_view_url || null;
  const lines = detail?.lines || [];
  const charges = detail?.charges || [];
  const taxSummary = detail?.tax_summary || [];
  const references = detail?.references || [];
  const attachments = detail?.attachments || [];
  const partnerHref =
    supplier?.id != null ? `/t/${slug}/partneri/${supplier.id}` : null;
  const partnerSaldakontoHref =
    supplier?.id != null ? `/t/${slug}/partneri/${supplier.id}/saldakonto` : null;

  return (
    <div className="docs-shell incoming-detail">
      <nav className="incoming-detail-crumb" aria-label="Navigacija">
        <Link href={`/t/${slug}/saldakonti?direction=incoming`}>Ulazni računi</Link>
        <span aria-hidden="true"> / </span>
        <span>{title}</span>
      </nav>

      <header className="incoming-detail-header">
        <div>
          <p className="docs-detail-kicker">Detalji ulaznog računa</p>
          <h1 className="docs-heading">{title}</h1>
          {supplier?.name ? <p className="incoming-detail-subtitle">{supplier.name}</p> : null}
        </div>
        <div className="incoming-detail-actions">
          {detail?.pdf_available ? (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={downloading === 'pdf'}
              onClick={() => handleDownload('pdf')}
            >
              {downloading === 'pdf' ? 'PDF…' : 'Preuzmi PDF'}
            </button>
          ) : null}
          {detail?.ubl_available ? (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={downloading === 'ubl'}
              onClick={() => handleDownload('ubl')}
            >
              {downloading === 'ubl' ? 'XML…' : 'Izvorni XML'}
            </button>
          ) : null}
          {externalUrl ? (
            <a
              className="btn btn-secondary"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {integration?.source === 'super' ? 'Otvori u SUPER-u ↗' : 'Otvori izvorni dokument ↗'}
            </a>
          ) : null}
          <Link className="btn btn-secondary" href={`/t/${slug}/saldakonti?direction=incoming`}>
            Natrag
          </Link>
        </div>
      </header>

      {loading && (
        <div className="incoming-detail-skeleton" aria-busy="true" aria-label="Učitavanje detalja">
          <div className="incoming-skel-row" />
          <div className="incoming-skel-grid">
            <div className="incoming-skel-card" />
            <div className="incoming-skel-card" />
            <div className="incoming-skel-card" />
          </div>
          <div className="incoming-skel-table" />
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          {errorStatus !== 404 ? (
            <button type="button" className="btn btn-secondary" onClick={() => router.refresh()}>
              Pokušaj ponovno
            </button>
          ) : (
            <Link className="btn btn-secondary" href={`/t/${slug}/saldakonti?direction=incoming`}>
              Natrag na listu
            </Link>
          )}
        </div>
      )}

      {detail && !loading && (
        <div className="incoming-detail-body">
          <div className="incoming-top-grid">
            <section className="incoming-card">
              <h2>Dobavljač</h2>
              {partnerHref ? (
                <p className="incoming-card-title">
                  <Link href={partnerHref}>{supplier?.name || '—'}</Link>
                </p>
              ) : (
                <p className="incoming-card-title">{supplier?.name || '—'}</p>
              )}
              <dl className="incoming-dl">
                <div>
                  <dt>Adresa</dt>
                  <dd>
                    {[supplier?.address?.street, supplier?.address?.postal_code, supplier?.address?.city]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt>Država</dt>
                  <dd>{supplier?.country_code || '—'}</dd>
                </div>
                <div>
                  <dt>OIB</dt>
                  <dd>{supplier?.oib || '—'}</dd>
                </div>
                <div>
                  <dt>PDV ID</dt>
                  <dd>{supplier?.vat_id || '—'}</dd>
                </div>
                <div>
                  <dt>IBAN</dt>
                  <dd>{supplier?.primary_iban || '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="incoming-card">
              <h2>Podaci o računu</h2>
              <dl className="incoming-dl">
                <div>
                  <dt>Broj računa</dt>
                  <dd>{detail.number || detail.source_number || '—'}</dd>
                </div>
                <div>
                  <dt>Datum izdavanja</dt>
                  <dd>{formatDate(meta?.issue_date || detail.document_date)}</dd>
                </div>
                <div>
                  <dt>Datum isporuke</dt>
                  <dd>{formatDate(meta?.delivery_date)}</dd>
                </div>
                <div>
                  <dt>Datum dospijeća</dt>
                  <dd>{formatDate(meta?.due_date || detail.due_date)}</dd>
                </div>
                <div>
                  <dt>Datum zaprimanja</dt>
                  <dd>{formatDateTime(meta?.received_at)}</dd>
                </div>
                <div>
                  <dt>Valuta</dt>
                  <dd>{meta?.currency || currency}</dd>
                </div>
                <div>
                  <dt>Poslovni proces</dt>
                  <dd>{meta?.business_process || '—'}</dd>
                </div>
                <div>
                  <dt>Izvor</dt>
                  <dd>{meta?.source_label || '—'}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{meta?.format || '—'}</dd>
                </div>
                <div>
                  <dt>Referenca</dt>
                  <dd>{meta?.primary_reference || '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="incoming-card">
              <h2>Status</h2>
              <dl className="incoming-dl incoming-status-dl">
                <div>
                  <dt>Dokument</dt>
                  <dd>{statusLabel(DOCUMENT_STATUS_LABEL, lifecycle?.document)}</dd>
                </div>
                <div>
                  <dt>Obrada</dt>
                  <dd>{statusLabel(WORKFLOW_STATUS_LABEL, lifecycle?.workflow)}</dd>
                </div>
                <div>
                  <dt>eRačun</dt>
                  <dd>{statusLabel(INTEGRATION_STATUS_LABEL, lifecycle?.integration)}</dd>
                </div>
                <div>
                  <dt>Knjiženje</dt>
                  <dd>{statusLabel(POSTING_STATUS_LABEL, lifecycle?.posting)}</dd>
                </div>
                <div>
                  <dt>PDV</dt>
                  <dd>{statusLabel(VAT_STATUS_LABEL, lifecycle?.vat)}</dd>
                </div>
                <div>
                  <dt>Saldakonto</dt>
                  <dd>{statusLabel(SUBLEDGER_STATUS_LABEL, lifecycle?.subledger)}</dd>
                </div>
                <div>
                  <dt>Plaćanje</dt>
                  <dd>{statusLabel(PAYMENT_STATUS_LABEL, lifecycle?.payment)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {integration ? (
            <section className="incoming-card">
              <h2>eRačun</h2>
              <dl className="incoming-dl incoming-dl-inline">
                <div>
                  <dt>Izvor</dt>
                  <dd>{meta?.source_label || integration.source || '—'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statusLabel(INTEGRATION_STATUS_LABEL, integration.status)}</dd>
                </div>
                <div>
                  <dt>Zaprimljeno</dt>
                  <dd>{formatDateTime(integration.received_at)}</dd>
                </div>
              </dl>
              {externalUrl ? (
                <p>
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    {integration.source === 'super' ? 'Otvori u SUPER-u ↗' : 'Otvori izvorni dokument ↗'}
                  </a>
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="incoming-card">
            <h2>Knjiženje</h2>
            <dl className="incoming-dl incoming-dl-inline">
              <div>
                <dt>Temeljnica</dt>
                <dd>{detail.accounting?.entry_number || '—'}</dd>
              </div>
              <div>
                <dt>Datum</dt>
                <dd>{formatDate(detail.accounting?.entry_date)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{statusLabel(POSTING_STATUS_LABEL, detail.accounting?.status || lifecycle?.posting)}</dd>
              </div>
              <div>
                <dt>Duguje</dt>
                <dd>{money(detail.accounting?.debit_total, currency)}</dd>
              </div>
              <div>
                <dt>Potražuje</dt>
                <dd>{money(detail.accounting?.credit_total, currency)}</dd>
              </div>
            </dl>
            {(detail.accounting?.lines?.length ?? 0) > 0 ? (
              <div className="table-wrap incoming-table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Konto</th>
                      <th>Naziv</th>
                      <th>Opis</th>
                      <th>Duguje</th>
                      <th>Potražuje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.accounting?.lines || []).map((line, index) => (
                      <tr key={`${line.account_code || 'a'}-${index}`}>
                        <td>{line.account_code || '—'}</td>
                        <td>{line.account_name || '—'}</td>
                        <td>{line.description || '—'}</td>
                        <td className="cell-amount">{money(line.debit, currency)}</td>
                        <td className="cell-amount">{money(line.credit, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted-inline">Nema stavki temeljnice.</p>
            )}
          </section>

          <section className="incoming-card">
            <h2>PDV</h2>
            <dl className="incoming-dl incoming-dl-inline">
              <div>
                <dt>Razdoblje</dt>
                <dd>{detail.vat_context?.period || '—'}</dd>
              </div>
              <div>
                <dt>Evidentiran</dt>
                <dd>
                  {detail.vat_context == null
                    ? '—'
                    : detail.vat_context.recorded
                      ? 'Da'
                      : 'Ne'}
                </dd>
              </div>
              <div>
                <dt>Odbitak</dt>
                <dd>
                  {detail.vat_context?.deductible == null
                    ? '—'
                    : detail.vat_context.deductible
                      ? 'Da'
                      : 'Ne'}
                </dd>
              </div>
              <div>
                <dt>Osnovica</dt>
                <dd>{money(detail.vat_context?.total_base, currency)}</dd>
              </div>
              <div>
                <dt>PDV</dt>
                <dd>{money(detail.vat_context?.total_vat, currency)}</dd>
              </div>
            </dl>
            {(detail.vat_context?.rates?.length ?? 0) > 0 ? (
              <div className="table-wrap incoming-table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Stopa</th>
                      <th>Osnovica</th>
                      <th>PDV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.vat_context?.rates || []).map((row) => (
                      <tr key={`vat-ctx-${row.rate}`}>
                        <td>{row.rate != null ? `${row.rate}%` : '—'}</td>
                        <td className="cell-amount">{money(row.base, currency)}</td>
                        <td className="cell-amount">{money(row.vat, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted-inline">Nema PDV knjiženja u knjizi.</p>
            )}
          </section>

          <section className="incoming-card">
            <h2>Saldakonto</h2>
            <dl className="incoming-dl incoming-dl-inline">
              <div>
                <dt>Stanje</dt>
                <dd>{statusLabel(SUBLEDGER_STATUS_LABEL, detail.subledger_context?.state)}</dd>
              </div>
              <div>
                <dt>Izvorni iznos</dt>
                <dd>{money(detail.subledger_context?.original_amount, currency)}</dd>
              </div>
              <div>
                <dt>Alocirano</dt>
                <dd>{money(detail.subledger_context?.allocated_amount, currency)}</dd>
              </div>
              <div>
                <dt>Otvoreno</dt>
                <dd>{money(detail.subledger_context?.open_amount, currency)}</dd>
              </div>
              <div>
                <dt>Dospijeće</dt>
                <dd>{formatDate(detail.subledger_context?.due_date)}</dd>
              </div>
              <div>
                <dt>Partner</dt>
                <dd>
                  {partnerSaldakontoHref ? (
                    <Link href={partnerSaldakontoHref}>{supplier?.name || '—'}</Link>
                  ) : (
                    supplier?.name || '—'
                  )}
                </dd>
              </div>
            </dl>
            {(detail.subledger_context?.allocations?.length ?? 0) > 0 ? (
              <div className="table-wrap incoming-table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Iznos</th>
                      <th>Temeljnica</th>
                      <th>Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.subledger_context?.allocations || []).map((alloc) => (
                      <tr key={alloc.id}>
                        <td>{alloc.id}</td>
                        <td className="cell-amount">{money(alloc.amount, currency)}</td>
                        <td>{alloc.journal_entry_id ?? '—'}</td>
                        <td>{formatDateTime(alloc.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted-inline">Nema alokacija.</p>
            )}
          </section>

          <section className="incoming-card">
            <h2>Plaćanje</h2>
            <dl className="incoming-dl incoming-dl-inline">
              <div>
                <dt>Usklađeno</dt>
                <dd>
                  {detail.payment == null ? '—' : detail.payment.matched ? 'Da' : 'Ne'}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{statusLabel(PAYMENT_STATUS_LABEL, detail.payment?.reconcile_status)}</dd>
              </div>
              <div>
                <dt>Datum</dt>
                <dd>{formatDate(detail.payment?.date)}</dd>
              </div>
              <div>
                <dt>Iznos</dt>
                <dd>{money(detail.payment?.amount, currency)}</dd>
              </div>
              <div>
                <dt>Račun</dt>
                <dd>{detail.payment?.account_mask || '—'}</dd>
              </div>
              <div>
                <dt>Referenca</dt>
                <dd>{detail.payment?.reference || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="incoming-card">
            <h2>Stavke računa</h2>
            {lines.length === 0 ? (
              <p className="muted-inline">Nema strukturiranih stavki.</p>
            ) : (
              <div className="table-wrap incoming-table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Klasifikacija</th>
                      <th>Naziv</th>
                      <th>JM</th>
                      <th>Kol.</th>
                      <th>Cijena</th>
                      <th>PDV</th>
                      <th>Iznos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={`${line.position}-${line.name || ''}`}>
                        <td>{line.position}</td>
                        <td>
                          {line.classification?.code
                            ? `${line.classification.scheme === 'CG' ? 'KPD' : line.classification.scheme || ''} ${line.classification.code}`.trim()
                            : '—'}
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span>{line.name || '—'}</span>
                            {line.description ? (
                              <span className="muted-inline">{line.description}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>{line.unit || '—'}</td>
                        <td className="cell-amount">{line.quantity ?? '—'}</td>
                        <td className="cell-amount">{money(line.unit_price, currency)}</td>
                        <td className="cell-amount">
                          {line.vat_rate != null ? `${line.vat_rate}%` : '—'}
                        </td>
                        <td className="cell-amount">{money(line.net_amount, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="incoming-mid-grid">
            <section className="incoming-card">
              <h2>Posebne naknade</h2>
              {charges.length === 0 ? (
                <p className="muted-inline">Nema posebnih naknada.</p>
              ) : (
                <div className="table-wrap incoming-table-wrap">
                  <table className="docs-table">
                    <thead>
                      <tr>
                        <th>Šifra</th>
                        <th>Opis</th>
                        <th>Iznos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((charge, index) => (
                        <tr key={`${charge.code || 'c'}-${index}`}>
                          <td>{charge.code || '—'}</td>
                          <td>{charge.description || '—'}</td>
                          <td className="cell-amount">{money(charge.amount, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="incoming-card">
              <h2>Sažetak</h2>
              <dl className="incoming-dl incoming-totals">
                <div>
                  <dt>Vrijednost usluga</dt>
                  <dd>{money(detail.totals?.line_net, currency)}</dd>
                </div>
                <div>
                  <dt>Posebne naknade</dt>
                  <dd>{money(detail.totals?.charges_total, currency)}</dd>
                </div>
                {taxSummary.map((row) => (
                  <div key={`tax-${row.rate}`}>
                    <dt>PDV {row.rate != null ? `${row.rate}%` : ''}</dt>
                    <dd>{money(row.vat, currency)}</dd>
                  </div>
                ))}
                {taxSummary.length === 0 ? (
                  <div>
                    <dt>PDV</dt>
                    <dd>{money(detail.totals?.vat_total, currency)}</dd>
                  </div>
                ) : null}
                <div className="incoming-total-strong">
                  <dt>Sveukupno</dt>
                  <dd>{money(detail.totals?.grand_total, currency)}</dd>
                </div>
                <div>
                  <dt>Plaćeno unaprijed</dt>
                  <dd>{money(detail.totals?.prepaid, currency)}</dd>
                </div>
                <div>
                  <dt>Za platiti</dt>
                  <dd>{money(detail.totals?.payable, currency)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {(detail.notes || detail.description) && (
            <section className="incoming-card">
              <h2>Napomene</h2>
              {detail.description ? <p>{detail.description}</p> : null}
              {detail.notes ? (
                <pre className="incoming-notes">{detail.notes}</pre>
              ) : null}
            </section>
          )}

          <section className="incoming-card">
            <h2>Reference</h2>
            {references.length === 0 ? (
              <p className="muted-inline">Nema referenci.</p>
            ) : (
              <ul className="incoming-ref-list">
                {references.map((ref) => (
                  <li key={`${ref.type}-${ref.value}`}>
                    <strong>{REFERENCE_TYPE_LABEL[ref.type] || ref.type}:</strong> {ref.value}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="incoming-card">
            <h2>Privici</h2>
            <div className="table-wrap incoming-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Dokument</th>
                    <th>Vrsta</th>
                    <th>Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.ubl_available ? (
                    <tr>
                      <td>invoice.xml</td>
                      <td>Izvorni eRačun</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={downloading === 'ubl'}
                          onClick={() => handleDownload('ubl')}
                        >
                          Preuzmi
                        </button>
                      </td>
                    </tr>
                  ) : null}
                  {detail.pdf_available ? (
                    <tr>
                      <td>račun.pdf</td>
                      <td>PDF račun</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={downloading === 'pdf'}
                          onClick={() => handleDownload('pdf')}
                        >
                          Preuzmi
                        </button>
                      </td>
                    </tr>
                  ) : null}
                  {attachments.map((att) => (
                    <tr key={att.id}>
                      <td>{att.original_filename}</td>
                      <td>{att.kind || 'Prilog'}</td>
                      <td>
                        {att.download_available.value ? (
                          <span className="muted-inline">Dostupan</span>
                        ) : (
                          <span className="muted-inline">Nedostupan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!detail.ubl_available && !detail.pdf_available && attachments.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Nema privitaka.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          {detail.technical ? (
            <details
              className="incoming-card incoming-technical"
              open={technicalOpen}
              onToggle={(event) => setTechnicalOpen((event.target as HTMLDetailsElement).open)}
            >
              <summary>Tehnički podaci</summary>
              <dl className="incoming-dl">
                <div>
                  <dt>Message ID</dt>
                  <dd>{detail.technical.message_id || '—'}</dd>
                </div>
                <div>
                  <dt>External ID</dt>
                  <dd>{integration?.external_id || '—'}</dd>
                </div>
                <div>
                  <dt>Parser</dt>
                  <dd>{detail.technical.parser_version || '—'}</dd>
                </div>
                <div>
                  <dt>Imported at</dt>
                  <dd>{formatDateTime(detail.technical.imported_at)}</dd>
                </div>
              </dl>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
