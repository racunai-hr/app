'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  jurisdictionFromCountryCode,
  PARTNER_COUNTRY_OPTIONS,
} from '@/lib/partnerCountries';
import {
  canWritePartners,
  createPartner,
  getPartnerConflict,
  partnerErrorMessage,
  partnerTaxLabel,
  partnerVatLabel,
} from '@/lib/partners';

import { usePartnerSession } from './usePartnerSession';

type Props = { slug: string };

export function PartnerCreateForm({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = usePartnerSession(slug);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [countryCode, setCountryCode] = useState('HR');
  const jurisdiction = useMemo(() => jurisdictionFromCountryCode(countryCode), [countryCode]);
  const taxRequired = jurisdiction === 'HR';

  if (session && !canWritePartners(session.role)) {
    return <div className="error">Nemate ovlast za kreiranje partnera.</div>;
  }

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Novi partner</h1>
          <p>MDM kartica kupca / dobavljača.</p>
        </div>
      </header>
      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      {session && (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setSaving(true);
            setError('');
            try {
              const created = await createPartner(session.origin, session.token, {
                name: String(fd.get('name') || ''),
                short_name: String(fd.get('short_name') || ''),
                partner_type: String(fd.get('partner_type') || 'customer'),
                country_code: countryCode,
                tax_number: String(fd.get('tax_number') || ''),
                vat_number: String(fd.get('vat_number') || ''),
                registration_number: String(fd.get('registration_number') || ''),
                address: String(fd.get('address') || ''),
                city: String(fd.get('city') || ''),
                postal_code: String(fd.get('postal_code') || ''),
                email: String(fd.get('email') || ''),
                phone: String(fd.get('phone') || ''),
                mobile: String(fd.get('mobile') || ''),
                payment_terms: Number(fd.get('payment_terms') || 30),
              });
              router.replace(`/t/${slug}/partneri/${created.id}`);
            } catch (err) {
              const conflict = getPartnerConflict(err)?.code;
              if (conflict === 'partner_tax_number_conflict') {
                setError(`Partner s ovim ${partnerTaxLabel(jurisdiction)}om već postoji.`);
              } else if (conflict === 'partner_vat_number_conflict') {
                setError('Partner s ovim VAT ID-om već postoji.');
              } else {
                setError(partnerErrorMessage(err));
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <label>
            Naziv
            <input name="name" required />
          </label>
          <label>
            Kratki naziv
            <input name="short_name" />
          </label>
          <label>
            Tip
            <select name="partner_type" defaultValue="customer">
              <option value="customer">Kupac</option>
              <option value="supplier">Dobavljač</option>
              <option value="both">Kupac i dobavljač</option>
              <option value="other">Ostalo</option>
            </select>
          </label>
          <label>
            Država
            <select
              name="country_code"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              required
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
          </label>
          <label>
            {partnerTaxLabel(jurisdiction)}
            <input name="tax_number" required={taxRequired} />
          </label>
          <label>
            {partnerVatLabel(jurisdiction)}
            <input name="vat_number" />
          </label>
          <label>
            MB / MBS
            <input name="registration_number" />
          </label>
          <label>
            Adresa
            <input name="address" required />
          </label>
          <label>
            Grad
            <input name="city" required />
          </label>
          <label>
            Poštanski broj
            <input name="postal_code" required />
          </label>
          <label>
            E-mail
            <input name="email" type="email" />
          </label>
          <label>
            Telefon
            <input name="phone" />
          </label>
          <label>
            Mobitel
            <input name="mobile" />
          </label>
          <label>
            Uvjeti plaćanja (dani)
            <input name="payment_terms" type="number" defaultValue={30} />
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Spremi
          </button>
        </form>
      )}
    </section>
  );
}
