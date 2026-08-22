'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrMoney } from '@/lib/formatHr';
import {
  canWriteTax,
  fetchPdvWorkspace,
  pdvPeriodStatusLabel,
  pdvPrijavaHref,
  pdvSHref,
  pdvXmlIntegrityLabel,
  postPdvLedger,
  razdobljaHref,
  type PdvPeriodWorkspace,
} from '@/lib/pdv';

type Props = { slug: string; period: string; origin: string; token: string; role: string };

export function PdvKontrolniPregledi({ slug, period, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [workspace, setWorkspace] = useState<PdvPeriodWorkspace | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setError('');
    return fetchPdvWorkspace(origin, token, period)
      .then(setWorkspace)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          router.replace(razdobljaHref(slug));
          return;
        }
        setError(err instanceof Error ? err.message : 'Stanje razdoblja se nije učitalo.');
      });
  }

  useEffect(() => {
    let cancelled = false;
    fetchPdvWorkspace(origin, token, period)
      .then((data) => {
        if (!cancelled) setWorkspace(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          router.replace(razdobljaHref(slug));
          return;
        }
        setError(err instanceof Error ? err.message : 'Stanje razdoblja se nije učitalo.');
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, period, router, slug]);

  async function rebuild() {
    setBusy(true);
    setError('');
    try {
      await postPdvLedger(origin, token, period);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Knjige se nisu generirale.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !workspace) return <div className="error">{error}</div>;
  if (!workspace) return <div className="loading">Učitavanje…</div>;

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <dl className="tax-status-grid">
        <div>
          <dt>Status razdoblja</dt>
          <dd>{pdvPeriodStatusLabel(workspace.period_status)}</dd>
        </div>
        <div>
          <dt>Knjiga</dt>
          <dd>{workspace.has_ledger ? 'Da' : 'Ne'}</dd>
        </div>
        <div>
          <dt>PDV za uplatu</dt>
          <dd>{formatHrMoney(workspace.vat_due, 'EUR')}</dd>
        </div>
        <div>
          <dt>XML usklađenost</dt>
          <dd>{pdvXmlIntegrityLabel(workspace.xml_integrity)}</dd>
        </div>
      </dl>
      <p className="app-placeholder-note">
        Redovi I-RA / U-RA nisu izloženi ovim API-jem. Ovdje je samo stvarno stanje razdoblja, bez
        izmišljenih knjiga.
      </p>
      <div className="tax-action-row">
        {writable ? (
          <button type="button" className="btn" onClick={() => void rebuild()} disabled={busy}>
            {busy ? 'Generiranje…' : 'Generiraj knjige'}
          </button>
        ) : (
          <p className="banking-role-note">Generiranje knjiga zahtijeva ulogu računovođe.</p>
        )}
        <Link className="btn" href={pdvPrijavaHref(slug, period)}>
          Prijava
        </Link>
        <Link className="btn" href={pdvSHref(slug, period)}>
          PDV-S
        </Link>
      </div>
    </div>
  );
}
