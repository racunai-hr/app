'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  canWritePartners,
  createPartner,
  PartnerApiError,
} from '@/lib/partners';

import { usePartnerSession } from './usePartnerSession';

type Props = { slug: string };

export function PartnerCreateForm({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = usePartnerSession(slug);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
          className="filter-bar"
          style={{ flexDirection: 'column', alignItems: 'stretch', maxWidth: 480 }}
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setSaving(true);
            setError('');
            try {
              const created = await createPartner(session.origin, session.token, {
                name: String(fd.get('name') || ''),
                partner_type: String(fd.get('partner_type') || 'customer'),
                tax_number: String(fd.get('tax_number') || ''),
                vat_number: String(fd.get('vat_number') || ''),
                address: String(fd.get('address') || ''),
                city: String(fd.get('city') || ''),
                postal_code: String(fd.get('postal_code') || ''),
                country: String(fd.get('country') || 'Hrvatska'),
                email: String(fd.get('email') || ''),
                phone: String(fd.get('phone') || ''),
              });
              router.replace(`/t/${slug}/partneri/${created.id}`);
            } catch (err) {
              if (err instanceof PartnerApiError && err.conflict?.code === 'partner_tax_number_conflict') {
                setError('Partner s ovim OIB-om već postoji.');
              } else {
                setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
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
            Tip
            <select name="partner_type" defaultValue="customer">
              <option value="customer">Kupac</option>
              <option value="supplier">Dobavljač</option>
              <option value="both">Kupac i dobavljač</option>
              <option value="other">Ostalo</option>
            </select>
          </label>
          <label>
            OIB
            <input name="tax_number" required />
          </label>
          <label>
            PDV broj
            <input name="vat_number" />
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
            Država
            <input name="country" defaultValue="Hrvatska" />
          </label>
          <label>
            E-mail
            <input name="email" type="email" />
          </label>
          <label>
            Telefon
            <input name="phone" />
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Spremi
          </button>
        </form>
      )}
    </section>
  );
}
