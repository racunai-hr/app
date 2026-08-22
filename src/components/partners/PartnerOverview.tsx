'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  jurisdictionFromCountryCode,
  PARTNER_COUNTRY_OPTIONS,
} from '@/lib/partnerCountries';
import {
  canWritePartners,
  fetchPartnerFinancialSummary,
  getPartnerConflict,
  getPartnerFieldError,
  partnerErrorMessage,
  partnerJurisdictionLabel,
  partnerStatusLabel,
  partnerTaxLabel,
  partnerTypeLabel,
  partnerVatLabel,
  patchPartner,
  pickDirtyFields,
  type PartnerDto,
  type PartnerFinancialSummary,
} from '@/lib/partners';
import { formatHrInputDate } from '@/lib/formatHr';

type Props = {
  origin: string;
  token: string;
  role: string;
  partner: PartnerDto;
  onSaved: () => Promise<void>;
};

type OverviewDraft = {
  name: string;
  short_name: string;
  partner_type: string;
  status: string;
  country_code: string;
  tax_number: string;
  vat_number: string;
  registration_number: string;
  address: string;
  city: string;
  postal_code: string;
  email: string;
  phone: string;
  mobile: string;
  payment_terms: string;
  credit_limit: string;
  notes: string;
};

const EDIT_KEYS = [
  'name',
  'short_name',
  'partner_type',
  'status',
  'country_code',
  'tax_number',
  'vat_number',
  'registration_number',
  'address',
  'city',
  'postal_code',
  'email',
  'phone',
  'mobile',
  'payment_terms',
  'credit_limit',
  'notes',
] as const;

function draftFromPartner(partner: PartnerDto): OverviewDraft {
  return {
    name: partner.name || '',
    short_name: partner.short_name || '',
    partner_type: partner.partner_type || 'customer',
    status: partner.status || 'active',
    country_code: partner.country_code || 'HR',
    tax_number: partner.tax_number || '',
    vat_number: partner.vat_number || '',
    registration_number: partner.registration_number || '',
    address: partner.address || '',
    city: partner.city || '',
    postal_code: partner.postal_code || '',
    email: partner.email || '',
    phone: partner.phone || '',
    mobile: partner.mobile || '',
    payment_terms: String(partner.payment_terms ?? 30),
    credit_limit: partner.credit_limit || '0.00',
    notes: partner.notes || '',
  };
}

function formatMoney(value: string, currency: string) {
  return `${value} ${currency}`;
}

function netBalanceVerdict(summary: PartnerFinancialSummary): string {
  const net = Number(summary.net_balance);
  if (!Number.isFinite(net) || net === 0) {
    return `Nema neto duga (${formatMoney('0.00', summary.currency)}).`;
  }
  const amount = formatMoney(Math.abs(net).toFixed(2), summary.currency);
  if (net > 0) {
    return `Partner nam duguje ${amount}.`;
  }
  return `Dugujemo partneru ${amount}.`;
}

function mapPartnerSaveError(err: unknown): { field?: string; message: string } {
  const conflict = getPartnerConflict(err);
  if (conflict?.code === 'partner_tax_number_conflict') {
    return { field: 'tax_number', message: 'Partner s ovim poreznim brojem već postoji.' };
  }
  if (conflict?.code === 'partner_vat_number_conflict') {
    return { field: 'vat_number', message: 'Partner s ovim VAT ID-om već postoji.' };
  }
  const fieldError = getPartnerFieldError(err);
  if (fieldError) {
    return { field: fieldError.field, message: fieldError.detail || partnerErrorMessage(err) };
  }
  return { message: partnerErrorMessage(err) };
}

export function PartnerOverview({ origin, token, role, partner, onSaved }: Props) {
  const [summary, setSummary] = useState<PartnerFinancialSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [draft, setDraft] = useState<OverviewDraft>(() => draftFromPartner(partner));
  const [baseline, setBaseline] = useState<OverviewDraft>(() => draftFromPartner(partner));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const writable = canWritePartners(role);
  const jurisdiction = useMemo(
    () => jurisdictionFromCountryCode(draft.country_code),
    [draft.country_code],
  );

  useEffect(() => {
    const next = draftFromPartner(partner);
    setDraft(next);
    setBaseline(next);
    setFieldErrors({});
    setError('');
    setMessage('');
  }, [partner]);

  useEffect(() => {
    let cancelled = false;
    fetchPartnerFinancialSummary(origin, token, partner.id)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : 'Sažetak nije dostupan.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, partner.id]);

  const setField = <K extends keyof OverviewDraft>(key: K, value: OverviewDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {summaryError && <div className="error">{summaryError}</div>}
      {summary && (
        <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
          <p className="banking-role-note" role="status" style={{ marginTop: 0 }}>
            <strong>{netBalanceVerdict(summary)}</strong> Financijski sažetak je projekcija Finance
            domene (stanje na dan {formatHrInputDate(summary.as_of_date)}).
          </p>
          <table className="docs-table">
            <thead>
              <tr>
                <th>Potraživanja</th>
                <th>Obveze</th>
                <th>Dospjelo (AR)</th>
                <th>Dospjelo (AP)</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatMoney(summary.receivables_open, summary.currency)}</td>
                <td>{formatMoney(summary.payables_open, summary.currency)}</td>
                <td>{formatMoney(summary.receivables_overdue, summary.currency)}</td>
                <td>{formatMoney(summary.payables_overdue, summary.currency)}</td>
                <td>{formatMoney(summary.net_balance, summary.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!writable && (
        <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
          <table className="docs-table">
            <tbody>
              <tr>
                <th>Šifra</th>
                <td>{partner.partner_code}</td>
              </tr>
              <tr>
                <th>Naziv</th>
                <td>{partner.name}</td>
              </tr>
              <tr>
                <th>Tip / status</th>
                <td>
                  {partnerTypeLabel(partner.partner_type)} · {partnerStatusLabel(partner.status)}
                </td>
              </tr>
              <tr>
                <th>Jurisdikcija</th>
                <td>{partnerJurisdictionLabel(partner.jurisdiction)}</td>
              </tr>
              <tr>
                <th>Adresa</th>
                <td>
                  {partner.address}, {partner.postal_code} {partner.city}, {partner.country} (
                  {partner.country_code})
                </td>
              </tr>
              <tr>
                <th>{partnerTaxLabel(partner.jurisdiction)}</th>
                <td>{partner.tax_number || '—'}</td>
              </tr>
              <tr>
                <th>{partnerVatLabel(partner.jurisdiction)}</th>
                <td>{partner.vat_number || '—'}</td>
              </tr>
              <tr>
                <th>MB / MBS</th>
                <td>{partner.registration_number || '—'}</td>
              </tr>
              <tr>
                <th>E-mail / telefon</th>
                <td>
                  {partner.email || '—'} / {partner.phone || '—'}
                </td>
              </tr>
              <tr>
                <th>Uvjeti plaćanja</th>
                <td>{partner.payment_terms} dana</td>
              </tr>
              <tr>
                <th>Kreditni limit</th>
                <td>{partner.credit_limit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {writable && (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError('');
            setFieldErrors({});
            setMessage('');
            const dirty = pickDirtyFields(baseline, draft, EDIT_KEYS);
            if (Object.keys(dirty).length === 0) {
              setMessage('Nema promjena za spremanje.');
              setSaving(false);
              return;
            }
            const payload: Record<string, unknown> = { ...dirty };
            if ('payment_terms' in payload) {
              payload.payment_terms = Number(payload.payment_terms);
            }
            try {
              await patchPartner(origin, token, partner.id, payload);
              await onSaved();
              setMessage('Partner spremljen.');
            } catch (err) {
              const mapped = mapPartnerSaveError(err);
              if (mapped.field) {
                setFieldErrors({ [mapped.field]: mapped.message });
              } else {
                setError(mapped.message);
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <p className="banking-role-note">
            Šifra {partner.partner_code} · {partnerJurisdictionLabel(jurisdiction)} (derivirano)
          </p>
          <label>
            Naziv
            <input
              value={draft.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
          </label>
          <label>
            Kratki naziv
            <input
              value={draft.short_name}
              onChange={(e) => setField('short_name', e.target.value)}
            />
          </label>
          <label>
            Tip
            <select
              value={draft.partner_type}
              onChange={(e) => setField('partner_type', e.target.value)}
            >
              <option value="customer">Kupac</option>
              <option value="supplier">Dobavljač</option>
              <option value="both">Kupac i dobavljač</option>
              <option value="other">Ostalo</option>
            </select>
          </label>
          <label>
            Status
            <select value={draft.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="active">Aktivan</option>
              <option value="inactive">Neaktivan</option>
              <option value="blocked">Blokiran</option>
              <option value="prospect">Potencijalni</option>
            </select>
          </label>
          <label>
            Država
            <select
              value={draft.country_code}
              onChange={(e) => setField('country_code', e.target.value)}
              aria-invalid={Boolean(fieldErrors.country_code)}
            >
              <optgroup label="Hrvatska">
                {PARTNER_COUNTRY_OPTIONS.filter((row) => row.group === 'HR').map((row) => (
                  <option key={row.code} value={row.code}>
                    {row.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="EU">
                {PARTNER_COUNTRY_OPTIONS.filter((row) => row.group === 'EU').map((row) => (
                  <option key={row.code} value={row.code}>
                    {row.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ostale zemlje">
                {PARTNER_COUNTRY_OPTIONS.filter((row) => row.group === 'NON_EU').map((row) => (
                  <option key={row.code} value={row.code}>
                    {row.label}
                  </option>
                ))}
              </optgroup>
            </select>
            {fieldErrors.country_code && (
              <span className="error">{fieldErrors.country_code}</span>
            )}
          </label>
          <label>
            {partnerTaxLabel(jurisdiction)}
            <input
              value={draft.tax_number}
              onChange={(e) => setField('tax_number', e.target.value)}
              aria-invalid={Boolean(fieldErrors.tax_number)}
            />
            {fieldErrors.tax_number && <span className="error">{fieldErrors.tax_number}</span>}
          </label>
          <label>
            {partnerVatLabel(jurisdiction)}
            <input
              value={draft.vat_number}
              onChange={(e) => setField('vat_number', e.target.value)}
              aria-invalid={Boolean(fieldErrors.vat_number)}
            />
            {fieldErrors.vat_number && <span className="error">{fieldErrors.vat_number}</span>}
          </label>
          <label>
            MB / MBS
            <input
              value={draft.registration_number}
              onChange={(e) => setField('registration_number', e.target.value)}
            />
          </label>
          <label>
            Adresa
            <input
              value={draft.address}
              onChange={(e) => setField('address', e.target.value)}
              required
            />
          </label>
          <label>
            Grad
            <input value={draft.city} onChange={(e) => setField('city', e.target.value)} required />
          </label>
          <label>
            Poštanski broj
            <input
              value={draft.postal_code}
              onChange={(e) => setField('postal_code', e.target.value)}
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          </label>
          <label>
            Telefon
            <input value={draft.phone} onChange={(e) => setField('phone', e.target.value)} />
          </label>
          <label>
            Mobitel
            <input value={draft.mobile} onChange={(e) => setField('mobile', e.target.value)} />
          </label>
          <label>
            Uvjeti plaćanja (dani)
            <input
              type="number"
              value={draft.payment_terms}
              onChange={(e) => setField('payment_terms', e.target.value)}
            />
          </label>
          <label>
            Kreditni limit
            <input
              value={draft.credit_limit}
              onChange={(e) => setField('credit_limit', e.target.value)}
            />
          </label>
          <label>
            Napomene
            <textarea
              value={draft.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={3}
            />
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Spremi promjene
          </button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
