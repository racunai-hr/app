'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { fetchCostCenters, type CostCenterRef } from '@/lib/costCenters';
import { ExpensePostingInputs } from '@/components/finance/ExpensePostingInputs';
import { AccountPicker } from '@/components/finance/AccountPicker';
import { PostingPreviewLines } from '@/components/finance/PostingPreviewLines';
import { ApiError } from '@/lib/api';
import {
  fetchChartOfAccounts,
  fetchExpenseCategories,
  fetchExpensePostingPreview,
  type AccountRef,
  type ExpenseCategory,
  type ExpensePostingPreview,
} from '@/lib/expensePosting';
import {
  applyPartnerUpdates,
  applySupplier,
  confirmInvoiceImport,
  createPartnerFromImport,
  discardInvoiceImport,
  fetchInvoiceImport,
  PurchasingApiError,
  retryInvoiceImport,
  type IncomingInvoiceImport,
  type OcrParty,
  type PartyCandidate,
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

function partyLabel(party: OcrParty | PartyCandidate | undefined): string {
  if (!party?.name) return '—';
  const tax = party.oib || party.vat_number;
  return tax ? `${party.name} · ${tax}` : party.name;
}

function ownBadge(party: PartyCandidate): string {
  if (party.is_own_company) return 'vaša tvrtka';
  if (party.suspected_own_company) return 'vaša tvrtka?';
  return '';
}

function directionCopy(code: string): string {
  if (code === 'review_required') {
    return 'OCR konflikt: i izdavatelj i kupac imaju identifikator vaše tvrtke. Odaberite dobavljača ili odbacite nacrt.';
  }
  if (code === 'suspected_wrong_document_direction') {
    return 'Izdavatelj je vaša tvrtka. Ovo može biti izlazni račun, krivi dokument ili zamijenjene strane. Odaberite pravog dobavljača ili odbacite.';
  }
  if (code === 'tenant_not_on_document') {
    return 'Kupac nije prepoznat po OIB-u vaše tvrtke. Potvrdite da je izdavatelj stvarni dobavljač.';
  }
  return '';
}

function prepaidHint(description: string): boolean {
  return /uplata|prepaid|nadoplata/i.test(description);
}

function reviewLines(extracted: IncomingInvoiceImport['extracted']): Array<{
  position: number;
  description: string;
  net_amount: string;
  vat_amount: string;
  gross_amount: string;
}> {
  if (extracted.allocated_lines?.length) return extracted.allocated_lines;
  return (extracted.line_items || [])
    .filter((item) => String(item.description || '').trim())
    .map((item, index) => ({
      position: index + 1,
      description: String(item.description || ''),
      net_amount: '',
      vat_amount: '',
      gross_amount: String(item.amount || ''),
    }));
}

export function InvoiceReview({ slug, importId }: Props) {
  const { session, loading, error: sessionError } = usePurchasingSession(slug);
  const [run, setRun] = useState<IncomingInvoiceImport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(false);
  const [directionOverride, setDirectionOverride] = useState(false);
  const [editFields, setEditFields] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [costCenters, setCostCenters] = useState<CostCenterRef[]>([]);
  const [costCenterId, setCostCenterId] = useState<number | null>(null);
  const [expenseAccount, setExpenseAccount] = useState<AccountRef | null>(null);
  const [lineAccounts, setLineAccounts] = useState<Record<number, AccountRef | null>>({});
  const [remember, setRemember] = useState(false);
  const [preview, setPreview] = useState<ExpensePostingPreview | null>(null);

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

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const abort = new AbortController();
    fetchExpenseCategories(session.origin, session.token, abort.signal)
      .then((catList) => {
        if (cancelled) return;
        setCategories(catList.results);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Vrste troška nisu učitane.');
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [session]);

  // Cost centers are an optional dimension; a missing codebook must not block posting inputs.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const abort = new AbortController();
    fetchCostCenters(session.origin, session.token, abort.signal)
      .then((centers) => {
        if (!cancelled) setCostCenters(centers.results);
      })
      .catch(() => {
        if (!cancelled) setCostCenters([]);
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [session]);

  useEffect(() => {
    setLineAccounts({});
  }, [run?.id]);

  useEffect(() => {
    if (!session || !run?.confirmed_expense_id) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const abort = new AbortController();
    fetchExpensePostingPreview(
      session.origin,
      session.token,
      run.confirmed_expense_id,
      abort.signal,
    )
      .then((next) => {
        if (cancelled) return;
        setPreview(next);
        if (next.expense_account) setExpenseAccount(next.expense_account);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Prijedlog knjiženja nije učitan.');
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [session, run?.confirmed_expense_id]);

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
      const invoiceOverrides =
        editFields && typeof document !== 'undefined'
          ? {
              invoice_number: String(
                (document.querySelector('[name="invoice_number"]') as HTMLInputElement | null)?.value || '',
              ),
              issue_date: String(
                (document.querySelector('[name="issue_date"]') as HTMLInputElement | null)?.value || '',
              ),
              due_date:
                String((document.querySelector('[name="due_date"]') as HTMLInputElement | null)?.value || '') ||
                null,
              net_amount: String(
                (document.querySelector('[name="net_amount"]') as HTMLInputElement | null)?.value || '',
              ),
              tax_amount: String(
                (document.querySelector('[name="tax_amount"]') as HTMLInputElement | null)?.value || '',
              ),
              total_amount: String(
                (document.querySelector('[name="total_amount"]') as HTMLInputElement | null)?.value || '',
              ),
              iban: String((document.querySelector('[name="iban"]') as HTMLInputElement | null)?.value || ''),
            }
          : {};
      const lines = reviewLines(run.extracted);
      const next = await confirmInvoiceImport(session.origin, session.token, run.id, {
        duplicate_override: override,
        direction_override: directionOverride,
        category_id: categoryId,
        expense_account_id: expenseAccount?.id ?? null,
        cost_center_id: costCenterId,
        remember_category_for_partner: remember,
        ...(lines.length
          ? {
              line_accounts: lines.map((line) => ({
                position: line.position,
                posting_account_id: lineAccounts[line.position]?.id ?? null,
              })),
            }
          : {}),
        ...invoiceOverrides,
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

  async function handleRetry() {
    if (!session || !run) return;
    setBusy(true);
    setError('');
    try {
      const queued = await retryInvoiceImport(session.origin, session.token, run.id);
      setRun(queued);
      const polled = await pollInvoiceImport((signal) =>
        fetchInvoiceImport(session.origin, session.token, run.id, signal),
      );
      if (polled.outcome !== 'aborted') {
        setRun(polled.run);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ponovni OCR nije uspio.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSelectParty(source: 'issuer' | 'buyer') {
    if (!session || !run) return;
    setBusy(true);
    setError('');
    try {
      setRun(await applySupplier(session.origin, session.token, run.id, { source }));
      setManualOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Odabir dobavljača nije uspio.');
    } finally {
      setBusy(false);
    }
  }

  async function handleManualSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !run) return;
    const fd = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      setRun(
        await applySupplier(session.origin, session.token, run.id, {
          source: 'manual',
          supplier: {
            name: String(fd.get('name') || ''),
            oib: String(fd.get('tax_number') || ''),
            vat_number: String(fd.get('vat_number') || ''),
            address: String(fd.get('address') || ''),
            city: String(fd.get('city') || ''),
            postal_code: String(fd.get('postal_code') || ''),
            country: String(fd.get('country_code') || ''),
            country_code: String(fd.get('country_code') || ''),
            iban: String(fd.get('iban') || ''),
          },
        }),
      );
      setManualOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ručni unos dobavljača nije uspio.');
    } finally {
      setBusy(false);
    }
  }

  const extracted = run?.extracted;
  const supplier = extracted?.supplier;
  const direction = run?.direction;
  const partnerMissing = run?.partner.match === 'missing';
  const hasDiff = Boolean(run?.partner.diff?.length);
  const confirmed = run?.status === 'confirmed';
  const discarded = run?.status === 'discarded';
  const failed = run?.status === 'failed';
  const processing = run?.status === 'queued' || run?.status === 'processing';
  const canAct = run?.status === 'extracted' && !busy;
  const canRetry =
    Boolean(run) &&
    !busy &&
    (run?.status === 'extracted' || run?.status === 'discarded' || run?.status === 'failed');
  const unresolved = Boolean(direction?.unresolved);
  const overrideRequired = Boolean(direction?.override_required);
  const allocatedLines = extracted ? reviewLines(extracted) : [];
  const selectedLineCount = allocatedLines.filter((line) => lineAccounts[line.position]?.id != null).length;
  const mixedLineAccounts =
    allocatedLines.length > 0 && selectedLineCount > 0 && selectedLineCount < allocatedLines.length;
  const splitLinePosting =
    allocatedLines.length > 0 && selectedLineCount === allocatedLines.length;
  const searchAccounts = useCallback(
    (term: string, signal: AbortSignal) => {
      if (!session) return Promise.resolve({ count: 0, results: [] });
      return fetchChartOfAccounts(session.origin, session.token, term, signal);
    },
    [session],
  );
  const supplierCountry = (supplier?.country_code || '').toUpperCase();
  const supplierIsForeign = Boolean(supplierCountry && supplierCountry !== 'HR');
  const candidates = (direction?.party_candidates || []).filter((row) => !row.blank);
  const confirmBlocked =
    partnerMissing ||
    run?.duplicate.kind === 'hard' ||
    unresolved ||
    (overrideRequired && !directionOverride) ||
    mixedLineAccounts;

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
      {(loading || !run || processing) && !error && (
        <div className="loading">{processing ? 'OCR obrada…' : 'Učitavanje nacrta…'}</div>
      )}
      {run && extracted && !processing && (
        <div className="ocr-review">
          {directionCopy(direction?.code || '') && (
            <div className="disclaimer">
              <p>{directionCopy(direction?.code || '')}</p>
            </div>
          )}
          {failed && run.last_error && <p className="error">{run.last_error}</p>}

          <div className="ocr-panel">
            <h2>Račun</h2>
            <FieldRow label="Dobavljač" value={supplier?.name || ''} />
            {editFields ? (
              <>
                <label className="ocr-field">
                  <span className="ocr-field-label">Broj računa</span>
                  <input name="invoice_number" defaultValue={extracted.invoice_number} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">Datum</span>
                  <input name="issue_date" defaultValue={extracted.issue_date} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">Dospijeće</span>
                  <input name="due_date" defaultValue={extracted.due_date || ''} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">Osnovica</span>
                  <input name="net_amount" defaultValue={extracted.net_amount} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">PDV</span>
                  <input name="tax_amount" defaultValue={extracted.tax_amount} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">Ukupno</span>
                  <input name="total_amount" defaultValue={extracted.total_amount} />
                </label>
                <label className="ocr-field">
                  <span className="ocr-field-label">IBAN</span>
                  <input name="iban" defaultValue={extracted.iban} />
                </label>
              </>
            ) : (
              <>
                <FieldRow label="Broj računa" value={extracted.invoice_number} />
                <FieldRow label="Datum" value={formatHrInputDate(extracted.issue_date)} />
                <FieldRow label="Dospijeće" value={formatHrInputDate(extracted.due_date)} />
                <FieldRow
                  label="Osnovica"
                  value={formatHrMoney(extracted.net_amount, extracted.currency)}
                />
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
              </>
            )}
            {canAct && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditFields((value) => !value)}
              >
                {editFields ? 'Prikaži OCR vrijednosti' : 'Ispravi podatke'}
              </button>
            )}
            {allocatedLines.length > 0 ? (
              <div className="ocr-lines">
                <h3>Stavke</h3>
                {mixedLineAccounts ? (
                  <p className="error">Sve stavke moraju imati konto, ili nijedna.</p>
                ) : null}
                <div className="table-wrap">
                  <table className="docs-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Opis</th>
                        <th>Osnovica</th>
                        <th>PDV</th>
                        <th>Bruto</th>
                        <th>Konto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocatedLines.map((item) => (
                        <tr key={`${item.position}-${item.description}`}>
                          <td>{item.position}</td>
                          <td>
                            <div className="cell-stack">
                              <span>{item.description || '—'}</span>
                              {prepaidHint(item.description) ? (
                                <span className="muted-inline">Prepaid / unaprijed plaćeni trošak?</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="cell-amount">
                            {item.net_amount ? formatHrMoney(item.net_amount, extracted.currency) : '—'}
                          </td>
                          <td className="cell-amount">
                            {item.vat_amount ? formatHrMoney(item.vat_amount, extracted.currency) : '—'}
                          </td>
                          <td className="cell-amount">
                            {item.gross_amount ? formatHrMoney(item.gross_amount, extracted.currency) : '—'}
                          </td>
                          <td>
                            {canAct ? (
                              <AccountPicker
                                label={`Konto stavke ${item.position}`}
                                value={lineAccounts[item.position] ?? null}
                                onChange={(next) => {
                                  setLineAccounts((current) => ({
                                    ...current,
                                    [item.position]: next,
                                  }));
                                }}
                                search={searchAccounts}
                                placeholder="Header konto"
                                disabled={busy}
                              />
                            ) : lineAccounts[item.position] ? (
                              `${lineAccounts[item.position]?.code} · ${lineAccounts[item.position]?.name}`
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            <ExpensePostingInputs
              categories={categories}
              categoryId={categoryId}
              expenseAccount={expenseAccount}
              searchAccounts={searchAccounts}
              costCenters={costCenters}
              costCenterId={costCenterId}
              disabled={!canAct}
              allowEmptyCategory
              remember={remember}
              showRemember
              hideCategory={splitLinePosting}
              hideAccount={splitLinePosting}
              onCategoryChange={setCategoryId}
              onAccountChange={setExpenseAccount}
              onCostCenterChange={setCostCenterId}
              onRememberChange={setRemember}
            />
            {run.warnings.length > 0 && (
              <ul className="ocr-warnings">
                {run.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="ocr-panel">
            <h2>Strane na računu</h2>
            {candidates.length === 0 && <p className="muted">OCR nije raspoznao izdavatelja i kupca.</p>}
            {candidates.map((party) => {
              const selected = direction?.supplier_source === party.role;
              const blocked = party.is_own_company;
              return (
                <label key={party.role} className="ocr-party-option">
                  <input
                    type="radio"
                    name="supplier_party"
                    checked={selected}
                    disabled={!canAct || blocked}
                    onChange={() => {
                      if (party.role === 'issuer' || party.role === 'buyer') {
                        void handleSelectParty(party.role);
                      }
                    }}
                  />
                  <span>
                    <strong>{party.role === 'issuer' ? 'Izdavatelj' : 'Kupac'}</strong>
                    {' · '}
                    {partyLabel(party)}
                    {ownBadge(party) ? ` · ${ownBadge(party)}` : ''}
                  </span>
                </label>
              );
            })}
            {canAct && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setManualOpen((value) => !value)}
              >
                {manualOpen ? 'Sakrij ručni unos' : 'Ručni unos dobavljača'}
              </button>
            )}
            {manualOpen && canAct && (
              <form className="ocr-partner-form" onSubmit={handleManualSupplier}>
                <label>
                  Naziv
                  <input name="name" required defaultValue={supplier?.name || ''} />
                </label>
                <label>
                  OIB
                  <input name="tax_number" defaultValue={supplier?.oib || ''} />
                </label>
                <label>
                  VAT ID
                  <input name="vat_number" defaultValue={supplier?.vat_number || ''} />
                </label>
                <label>
                  Adresa
                  <input name="address" defaultValue={supplier?.address || ''} />
                </label>
                <label>
                  Grad
                  <input name="city" defaultValue={supplier?.city || ''} />
                </label>
                <label>
                  Poštanski broj
                  <input name="postal_code" defaultValue={supplier?.postal_code || ''} />
                </label>
                <label>
                  Država (ISO, npr. HR)
                  <input name="country_code" defaultValue={supplier?.country_code || ''} placeholder="HR" />
                </label>
                <label>
                  IBAN
                  <input name="iban" defaultValue={supplier?.iban || ''} />
                </label>
                <button type="submit" className="btn btn-primary" disabled={!canAct}>
                  Primijeni dobavljača
                </button>
              </form>
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

          {overrideRequired && canAct && (
            <label className="ocr-override">
              <input
                type="checkbox"
                checked={directionOverride}
                onChange={(event) => setDirectionOverride(event.target.checked)}
              />
              Potvrđujem da je izdavatelj stvarni dobavljač
            </label>
          )}

          {confirmed && (
            <div className="ocr-success">
              <p>
                Ulazni račun je potvrđen kao nacrt (#{run.confirmed_expense_id}). Nije knjižen ni
                ušao u saldakonto.
              </p>
              {preview ? (
                <div>
                  <h2>Prijedlog knjiženja</h2>
                  <p className="muted-inline">Linije dolaze s poslužitelja; sučelje ih ne računa.</p>
                  <PostingPreviewLines preview={preview} currency={extracted.currency} />
                </div>
              ) : null}
              {run.confirmed_expense_id ? (
                <Link
                  className="btn btn-primary"
                  href={`/t/${slug}/dokumenti/ulazni/${run.confirmed_expense_id}`}
                >
                  Otvori nalog
                </Link>
              ) : null}
              <Link className="btn btn-secondary" href={DOCUMENTS_OPERATIVE_HREFS.incomingReadyToPay(slug)}>
                Otvori ulazne račune
              </Link>
            </div>
          )}

          {discarded && <p className="muted">Nacrt je odbačen.</p>}

          <div className="ocr-actions">
            {canAct && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={confirmBlocked || busy}
                onClick={() => void handleConfirm()}
              >
                Potvrdi ulazni račun
              </button>
            )}
            {canAct && (
              <button type="button" className="btn btn-secondary" onClick={handleDiscard}>
                Odbaci
              </button>
            )}
            {canRetry && (
              <button type="button" className="btn btn-secondary" onClick={handleRetry}>
                Ponovi OCR
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
