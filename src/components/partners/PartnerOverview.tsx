'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  canWritePartners,
  fetchPartnerFinancialSummary,
  patchPartner,
  partnerTaxLabel,
  partnerVatLabel,
  type PartnerDto,
  type PartnerFinancialSummary,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  role: string;
  partner: PartnerDto;
  onSaved: () => Promise<void>;
};

function formatMoney(value: string, currency: string) {
  return `${value} ${currency}`;
}

export function PartnerOverview({ origin, token, role, partner, onSaved }: Props) {
  const [summary, setSummary] = useState<PartnerFinancialSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [status, setStatus] = useState(partner.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const writable = canWritePartners(role);

  useEffect(() => {
    setStatus(partner.status);
  }, [partner.status]);

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

  return (
    <div>
      {summaryError && <div className="error">{summaryError}</div>}
      {summary && (
        <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
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
          <p className="banking-role-note">
            Financijski sažetak je projekcija Finance domene (as of {summary.as_of_date}). Pozitivan
            saldo = partner duguje nama.
          </p>
        </div>
      )}

      <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
        <table className="docs-table">
          <tbody>
            <tr>
              <th>Šifra</th>
              <td>{partner.partner_code}</td>
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

      {writable && (
        <form
          className="filter-bar"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError('');
            setMessage('');
            try {
              await patchPartner(origin, token, partner.id, { status });
              await onSaved();
              setMessage('Status spremljen.');
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
            } finally {
              setSaving(false);
            }
          }}
        >
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Aktivan</option>
              <option value="inactive">Neaktivan</option>
              <option value="blocked">Blokiran</option>
              <option value="prospect">Potencijalni</option>
            </select>
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Spremi status
          </button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
