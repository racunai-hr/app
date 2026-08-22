'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  applyPartnerUpdates,
  confirmInvoiceImport,
  createPartnerFromImport,
  discardInvoiceImport,
  fetchInvoiceImport,
  PurchasingApiError,
  type IncomingInvoiceImport,
} from '@/lib/purchasing';
import { pollInvoiceImport } from '@/lib/purchasingImport';
import { DOCUMENTS_OPERATIVE_HREFS } from '@/lib/documentListQuery';
import { formatHrInputDate, formatHrMoney } from '@/lib/formatHr';

import { usePurchasingSession } from './usePurchasingSession';

type Props = { slug: string; importId: number };

function FieldRow({
  label,
  value,
  tone = 'ok',
}: {
  label: string;
  value: string;
  tone?: 'ok' | 'warn';
}) {
  return (
    <div className="ocr-field">
      <span className="ocr-field-label">{label}</span>
      <span className={tone === 'warn' ? 'ocr-warn' : 'ocr-ok'}>
        {value || '—'} {tone === 'warn' ? '⚠' : '✓'}
      </span>
    </div>
  );
}

export function InvoiceReview({ slug, importId }: Props) {
  const { session, loading, error: sessionError } = usePurchasingSession(slug);
  const [run, setRun] = useState<IncomingInvoiceImport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(false);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const abort = new AbortController();
    setError('');
    fetchInvoiceImport(session.origin, session.token, importId, abort.signal)
      .then(async (initial) => {
        if (cancelled) return;
        if (initial.status === 'queued' || initial.status === 'processing') {
          const polled = await pollInvoiceImport(
            (signal) => fetchInvoiceImport(session.origin, session.token, importId, signal),
            { signal: abort.signal },
          );
          if (cancelled || polled.outcome === 'aborted') return;
          setRun(polled.run);
          return;
        }
        setRun(initial);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Nacrt se nije učitao.');
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [session, importId]);

  async function refresh() {
    if (!session) return;
    const next = await fetchInvoiceImport(session.origin, session.token, importId);
    setRun(next);
  }

  async function handleCreatePartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !run) return;
    const fd = new FormData(event.currentTarget);
    const countryCode = String(fd.get('country_code') || '').trim().toUpperCase();
    const isHr = countryCode === 'HR';
    setBusy(true);
    setError('');
    try {
      const next = await createPartnerFromImport(session.origin, session.token, run.id, {
        name: String(fd.get('name') || ''),
        tax_number: isHr ? String(fd.get('tax_number') || '') : '',
        vat_number: String(fd.get('vat_number') || ''),
        address: String(fd.get('address') || ''),
        city: String(fd.get('city') || ''),
        postal_code: String(fd.get('postal_code') || ''),
        country_code: countryCode,
        iban: String(fd.get('iban') || ''),
        partner_type: 'supplier',
      });
      setRun(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kreiranje partnera nije uspjelo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleApplyPartner() {
    if (!session || !run) return;
    setBusy(true);
    setError('');
    try {
      setRun(await applyPartnerUpdates(session.origin, session.token, run.id));
    } catch (err) {
      if (err instanceof PurchasingApiError && err.conflict?.code === 'partner_changed') {
        setError('Partner je u međuvremenu izmijenjen. Diff je osvježen.');
        await refresh();
      } else {
        setError(err instanceof ApiError ? err.message : 'Ažuriranje partnera nije uspjelo.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!session || !run) return;
    setBusy(true);
    setError('');
    try {
      const next = await confirmInvoiceImport(session.origin, session.token, run.id, {
        duplicate_override: override,
      });
      setRun(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Potvrda nije uspjela.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDiscard() {
    if (!session || !run) return;
    setBusy(true);
    setError('');
    try {
      setRun(await discardInvoiceImport(session.origin, session.token, run.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Odbacivanje nije uspjelo.');
    } finally {
      setBusy(false);
    }
  }

  const extracted = run?.extracted;
  const supplier = extracted?.supplier;
  const partnerMissing = run?.partner.match === 'missing';
  const hasDiff = Boolean(run?.partner.diff?.length);
  const confirmed = run?.status === 'confirmed';
  const discarded = run?.status === 'discarded';
  const canAct = run?.status === 'extracted' && !busy;
  const supplierCountry = (supplier?.country_code || '').toUpperCase();
  const supplierIsForeign = Boolean(supplierCountry && supplierCountry !== 'HR');

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Ulazni račun — nacrt</h1>
          <p>Pregledajte OCR podatke prije potvrde. AI ne knjiži ni ne mijenja MDM bez vas.</p>
        </div>
        <Link className="btn btn-secondary" href={DOCUMENTS_OPERATIVE_HREFS.incomingReadyToPay(slug)}>
          Natrag na ulazne
        </Link>
      </header>
      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(loading || !run) && !error && <div className="loading">Učitavanje nacrta…</div>}
      {run && extracted && (
        <div className="ocr-review">
          <div className="ocr-panel">
            <h2>Račun</h2>
            <FieldRow label="Dobavljač" value={supplier?.name || ''} />
            <FieldRow label="Broj računa" value={extracted.invoice_number} />
            <FieldRow label="Datum" value={formatHrInputDate(extracted.issue_date)} />
            <FieldRow label="Dospijeće" value={formatHrInputDate(extracted.due_date)} />
            <FieldRow label="Osnovica" value={formatHrMoney(extracted.net_amount, extracted.currency)} />
            <FieldRow label="PDV" value={formatHrMoney(extracted.tax_amount, extracted.currency)} />
            <FieldRow
              label="Ukupno"
              value={formatHrMoney(extracted.total_amount, extracted.currency)}
            />
            <FieldRow
              label="IBAN"
              value={extracted.iban}
              tone={hasDiff && run.partner.diff.some((row) => row.field === 'iban') ? 'warn' : 'ok'}
            />
            <FieldRow label="Kontiranje" value="nije potvrđeno" tone="warn" />
            {run.warnings.length > 0 && (
              <ul className="ocr-warnings">
                {run.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="ocr-panel">
            <h2>Dobavljač</h2>
            {partnerMissing ? (
              <>
                <p>
                  <strong>Novi dobavljač pronađen</strong>
                </p>
                <p>
                  {supplier?.name}
                  {supplierIsForeign
                    ? ` · VAT ID ${supplier?.vat_number || '—'}`
                    : ` · OIB ${supplier?.oib || '—'}`}
                </p>
                <form className="ocr-partner-form" onSubmit={handleCreatePartner}>
                  <label>
                    Naziv
                    <input name="name" required defaultValue={supplier?.name || ''} />
                  </label>
                  {!supplierIsForeign && (
                    <label>
                      OIB
                      <input name="tax_number" required defaultValue={supplier?.oib || ''} />
                    </label>
                  )}
                  <label>
                    VAT ID
                    <input
                      name="vat_number"
                      required={supplierIsForeign}
                      defaultValue={supplier?.vat_number || ''}
                    />
                  </label>
                  <label>
                    Adresa
                    <input name="address" required defaultValue={supplier?.address || ''} />
                  </label>
                  <label>
                    Grad
                    <input name="city" required defaultValue={supplier?.city || ''} />
                  </label>
                  <label>
                    Poštanski broj
                    <input name="postal_code" required defaultValue={supplier?.postal_code || ''} />
                  </label>
                  <label>
                    Država (ISO, npr. HR)
                    <input
                      name="country_code"
                      required
                      defaultValue={supplier?.country_code || ''}
                      placeholder="HR"
                    />
                  </label>
                  <label>
                    IBAN
                    <input name="iban" defaultValue={supplier?.iban || ''} />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={!canAct}>
                    Kreiraj partnera
                  </button>
                </form>
              </>
            ) : (
              <>
                <p>
                  {run.partner.name}
                  {run.partner.tax_number
                    ? ` · OIB ${run.partner.tax_number}`
                    : run.partner.match === 'vat'
                      ? ' · VAT match'
                      : ''}
                  {run.partner.match === 'iban_candidate' ? ' · spojeno preko IBAN-a ⚠' : ''}
                </p>
                {hasDiff ? (
                  <>
                    <table className="ocr-diff">
                      <thead>
                        <tr>
                          <th>Polje</th>
                          <th>Postojeći podaci</th>
                          <th>Račun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {run.partner.diff.map((row) => (
                          <tr key={row.field}>
                            <td>{row.field}</td>
                            <td>{row.existing || '—'}</td>
                            <td>{row.extracted || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p>Pronađeno je {run.partner.diff.length} novih podataka.</p>
                    <div className="ocr-actions">
                      <button type="button" className="btn btn-primary" disabled={!canAct} onClick={handleApplyPartner}>
                        Ažuriraj partnera
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canAct}
                        onClick={() => setError('')}
                      >
                        Ne mijenjaj
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="ocr-ok">Partner povezan, bez novih MDM polja.</p>
                )}
              </>
            )}
          </div>

          {run.duplicate.kind !== 'none' && (
            <div className="disclaimer">
              {run.duplicate.kind === 'hard' ? (
                <p>Hard duplicate: ova datoteka je već potvrđena. Potvrda je blokirana.</p>
              ) : (
                <>
                  <p>Mogući duplikat računa: {run.duplicate.label || 'postojeći zapis'}</p>
                  <label className="ocr-override">
                    <input
                      type="checkbox"
                      checked={override}
                      onChange={(event) => setOverride(event.target.checked)}
                      disabled={!canAct}
                    />
                    Eksplicitno potvrđujem da ovo nije duplikat
                  </label>
                </>
              )}
            </div>
          )}

          {confirmed && (
            <div className="ocr-success">
              <p>
                Ulazni račun je potvrđen kao nacrt (#{run.confirmed_expense_id}). Nije knjižen ni
                ušao u saldakonto.
              </p>
              <Link className="btn btn-primary" href={DOCUMENTS_OPERATIVE_HREFS.incomingReadyToPay(slug)}>
                Otvori ulazne račune
              </Link>
            </div>
          )}

          {discarded && <p className="muted">Nacrt je odbačen.</p>}

          {canAct && (
            <div className="ocr-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={partnerMissing || run.duplicate.kind === 'hard'}
                onClick={handleConfirm}
              >
                Potvrdi ulazni račun
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleDiscard}>
                Odbaci
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
