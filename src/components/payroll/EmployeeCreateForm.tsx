'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { canWritePayroll, createEmployee, employeeHref, employeesHref } from '@/lib/payroll';

type Props = { slug: string };

export function EmployeeCreateForm({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (session && !canWritePayroll(session.role)) {
    return <div className="error">Nemate ovlast za unos zaposlenika.</div>;
  }

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Novi zaposlenik</h1>
          <p>Matični podaci — ugovor o radu unosite na kartici zaposlenika.</p>
        </div>
      </header>
      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      {session ? (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setSaving(true);
            setError('');
            try {
              const created = await createEmployee(session.origin, session.token, {
                first_name: String(fd.get('first_name') || ''),
                last_name: String(fd.get('last_name') || ''),
                oib: String(fd.get('oib') || ''),
                date_of_birth: String(fd.get('date_of_birth') || '') || null,
                street: String(fd.get('street') || ''),
                city: String(fd.get('city') || ''),
                municipality_code: String(fd.get('municipality_code') || ''),
                work_location: String(fd.get('work_location') || ''),
                iban: String(fd.get('iban') || ''),
                bank_name: String(fd.get('bank_name') || ''),
                mio_pillar: (fd.get('mio_pillar') as 'both' | 'first_only') || 'both',
                citizenship: String(fd.get('citizenship') || ''),
                occupation: String(fd.get('occupation') || ''),
                work_permit_number: String(fd.get('work_permit_number') || ''),
              });
              router.replace(employeeHref(slug, created.id));
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Zaposlenik se nije mogao spremiti.');
            } finally {
              setSaving(false);
            }
          }}
        >
          <label>
            Ime
            <input name="first_name" required />
          </label>
          <label>
            Prezime
            <input name="last_name" required />
          </label>
          <label>
            OIB
            <input name="oib" required pattern="\d{11}" title="11 znamenki" />
          </label>
          <label>
            Datum rođenja
            <input name="date_of_birth" type="date" />
          </label>
          <label>
            Ulica i kućni broj
            <input name="street" />
          </label>
          <label>
            Mjesto prebivališta
            <input name="city" />
          </label>
          <label>
            Šifra JLS prebivališta
            <input name="municipality_code" pattern="\d{5}" title="5 znamenki" />
          </label>
          <label>
            Mjesto rada
            <input name="work_location" />
          </label>
          <label>
            IBAN
            <input name="iban" />
          </label>
          <label>
            Banka
            <input name="bank_name" />
          </label>
          <label>
            Državljanstvo
            <input name="citizenship" />
          </label>
          <label>
            Zanimanje
            <input name="occupation" />
          </label>
          <label>
            Dozvola za rad
            <input name="work_permit_number" />
          </label>
          <label>
            Mirovinski stup
            <select name="mio_pillar" defaultValue="both">
              <option value="both">I. i II. stup</option>
              <option value="first_only">Samo I. stup (generacijska solidarnost)</option>
            </select>
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Spremi
          </button>
        </form>
      ) : null}
      <p className="app-placeholder-note">
        <a href={employeesHref(slug)}>← Zaposlenici</a>
      </p>
    </section>
  );
}
