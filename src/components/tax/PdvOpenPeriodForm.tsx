'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { canWriteTax, parsePdvPeriod, pdvKontrolniHref, postPdvLedger } from '@/lib/pdv';

type Props = { slug: string; origin: string; token: string; role: string };

export function PdvOpenPeriodForm({ slug, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!writable) {
    return <p className="banking-role-note">Generiranje knjiga zahtijeva ulogu računovođe.</p>;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const period = parsePdvPeriod(String(data.get('period') || ''));
    if (!period) return;

    setBusy(true);
    setError('');
    try {
      await postPdvLedger(origin, token, period);
      router.push(pdvKontrolniHref(slug, period));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Knjige se nisu generirale.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="tax-evidence-form" onSubmit={(event) => void onSubmit(event)}>
      <h2>Otvori razdoblje</h2>
      <p className="app-placeholder-note">
        Ako razdoblje ne postoji, bit će otvoreno i generirat će se PDV knjige.
      </p>
      {error ? <div className="error">{error}</div> : null}
      <label>
        Razdoblje
        <input name="period" type="month" required disabled={busy} />
      </label>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Generiram…' : 'Generiraj knjige'}
      </button>
    </form>
  );
}
