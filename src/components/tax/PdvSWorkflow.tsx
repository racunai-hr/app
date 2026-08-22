'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrMoney } from '@/lib/formatHr';
import {
  canWriteTax,
  downloadPdvSXml,
  fetchPdvSPeriod,
  postPdvSSubmit,
  postSubmissionConfirmation,
  razdobljaHref,
  type PdvSPeriod,
} from '@/lib/pdv';

import { TaxSubmitEvidenceForm } from './TaxSubmitEvidenceForm';

type Props = { slug: string; period: string; origin: string; token: string; role: string };

export function PdvSWorkflow({ slug, period, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [data, setData] = useState<PdvSPeriod | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [eventUuid, setEventUuid] = useState<string | null>(null);
  const [hasConfirmation, setHasConfirmation] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const next = await fetchPdvSPeriod(origin, token, period);
      setData(next);
      if (next.event_uuid) setEventUuid(next.event_uuid);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(razdobljaHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'PDV-S se nije učitao.');
    }
  }, [origin, token, period, router, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Radnja nije uspjela.');
    } finally {
      setBusy('');
    }
  }

  if (error && !data) return <div className="error">{error}</div>;
  if (!data) return <div className="loading">Učitavanje…</div>;

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p>
        <Link href={razdobljaHref(slug)}>← Razdoblja</Link>
      </p>
      <dl className="tax-status-grid">
        <div>
          <dt>Stavke</dt>
          <dd>{data.row_count}</dd>
        </div>
        <div>
          <dt>Dobra</dt>
          <dd>{formatHrMoney(data.total_goods, 'EUR')}</dd>
        </div>
        <div>
          <dt>Usluge</dt>
          <dd>{formatHrMoney(data.total_services, 'EUR')}</dd>
        </div>
      </dl>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Država</th>
              <th>PDV ID</th>
              <th className="cell-amount">Dobra</th>
              <th className="cell-amount">Usluge</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length ? (
              data.rows.map((row) => (
                <tr key={`${row.country_code}-${row.pdv_id}`}>
                  <td>{row.country_code}</td>
                  <td>{row.pdv_id}</td>
                  <td className="cell-amount">{formatHrMoney(row.goods_value, 'EUR')}</td>
                  <td className="cell-amount">{formatHrMoney(row.services_value, 'EUR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Nema agregiranih EU stavki za ovo razdoblje.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tax-action-row">
        <button
          type="button"
          className="btn"
          disabled={Boolean(busy)}
          onClick={() => void run('xml', () => downloadPdvSXml(origin, token, period))}
        >
          {busy === 'xml' ? 'Preuzimanje…' : 'Preuzmi XML'}
        </button>
      </div>
      <p className="app-placeholder-note">
        PDV-S nema spremljeni draft. XML se gradi uživo iz knjige; predaja se bilježi tek nakon
        ručne ePorezne.
      </p>
      {writable && !eventUuid ? (
        <TaxSubmitEvidenceForm
          busy={busy === 'submit'}
          onSubmit={(eporezna, submittedAt) =>
            void run('submit', async () => {
              const result = await postPdvSSubmit(origin, token, period, {
                eporezna_identifier: eporezna,
                submitted_at: submittedAt,
              });
              setEventUuid(result.event_uuid);
              setHasConfirmation(result.has_confirmation);
              await load();
            })
          }
        />
      ) : null}
      {eventUuid && writable ? (
        <form
          className="tax-evidence-form"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem('confirmation') as HTMLInputElement;
            const file = input.files?.[0];
            if (!file) return;
            void run('confirm', async () => {
              const result = await postSubmissionConfirmation(origin, token, eventUuid, file);
              setHasConfirmation(result.has_confirmation);
            });
          }}
        >
          <h2>Potvrda predaje</h2>
          <label>
            Datoteka potvrde
            <input name="confirmation" type="file" required disabled={hasConfirmation || Boolean(busy)} />
          </label>
          <button type="submit" className="btn" disabled={hasConfirmation || Boolean(busy)}>
            {hasConfirmation ? 'Potvrda je već priložena' : 'Priloži potvrdu'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
