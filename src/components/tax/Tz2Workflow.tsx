'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrMoney } from '@/lib/formatHr';
import { canWriteTax, postSubmissionConfirmation } from '@/lib/pdv';
import {
  downloadTz2Xml,
  fetchTz2Year,
  postTz2Submit,
  saveTz2Year,
  tz2SubmissionLabel,
  type Tz2Submission,
  type Tz2Year,
} from '@/lib/tz2';

import { TaxSubmitEvidenceForm } from './TaxSubmitEvidenceForm';

type Props = { slug: string; year: number; origin: string; token: string; role: string };

export function Tz2Workflow({ slug, year, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [data, setData] = useState<Tz2Year | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    oib: '',
    municipality_code: '',
    city: '',
    street: '',
    house_number: '',
    room_beds: '0',
    aux_beds: '0',
    payment_installments: true,
    ep_receipts: '0.00',
  });

  const load = useCallback(async () => {
    setError('');
    try {
      const next = await fetchTz2Year(origin, token, year);
      setData(next);
      setForm({
        first_name: next.taxpayer.first_name,
        last_name: next.taxpayer.last_name,
        oib: next.taxpayer.oib,
        municipality_code: next.taxpayer.municipality_code,
        city: next.taxpayer.city,
        street: next.taxpayer.street,
        house_number: next.taxpayer.house_number,
        room_beds: String(next.room_beds),
        aux_beds: String(next.aux_beds),
        payment_installments: next.payment_installments,
        ep_receipts: next.ep_receipts,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'TZ 2 se nije učitao.');
    }
  }, [origin, token, year, router]);

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

  const current = data.current_submission;
  const currentUuid = current?.event_uuid ?? data.event_uuid ?? null;
  const submissions = data.submissions ?? [];
  const statusLabel = current ? 'Predano' : 'Nije predano';

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p>
        <Link href={`/t/${slug}/porezi`}>← Porezi</Link>
      </p>
      <dl className="tax-status-grid">
        <div>
          <dt>Godina</dt>
          <dd>{data.tax_year}</dd>
        </div>
        <div>
          <dt>Verzija</dt>
          <dd>{data.version ?? '—'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>Članarina</dt>
          <dd>{formatHrMoney(data.amount_after_discount, 'EUR')}</dd>
        </div>
      </dl>

      <section className="tz2-card">
        <h2>Zaglavlje</h2>
        <div className="tz2-grid">
          <label>
            Ime
            <input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
          </label>
          <label>
            Prezime
            <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
          </label>
          <label>
            OIB
            <input value={form.oib} onChange={(e) => update('oib', e.target.value)} />
          </label>
          <label>
            Šifra općine
            <input value={form.municipality_code} onChange={(e) => update('municipality_code', e.target.value)} />
          </label>
          <label>
            Mjesto
            <input value={form.city} onChange={(e) => update('city', e.target.value)} />
          </label>
          <label>
            Ulica
            <input value={form.street} onChange={(e) => update('street', e.target.value)} />
          </label>
          <label>
            Kućni broj
            <input value={form.house_number} onChange={(e) => update('house_number', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="tz2-card" id="tz2-podaci">
        <h2>Podaci</h2>
        <div className="tz2-triples">
          <label>
            Krevet u sobi, apartmanu ili kući za odmor — BROJ
            <input
              type="number"
              min={0}
              value={form.room_beds}
              onChange={(e) => update('room_beds', e.target.value)}
            />
          </label>
          <label>
            Iznos (stopa)
            <input value={data.room_bed_rate} readOnly />
          </label>
          <label>
            Ukupno
            <input value={data.room_bed_total} readOnly />
          </label>
          <label>
            Pomoćni krevet — BROJ
            <input type="number" min={0} value={form.aux_beds} onChange={(e) => update('aux_beds', e.target.value)} />
          </label>
          <label>
            Iznos (stopa)
            <input value={data.aux_bed_rate} readOnly />
          </label>
          <label>
            Ukupno
            <input value={data.aux_bed_total} readOnly />
          </label>
        </div>
        <div className="tz2-grid">
          <label>
            Ukupan iznos primitka iz evidencije prometa (Obrazac EP)
            <input value={form.ep_receipts} onChange={(e) => update('ep_receipts', e.target.value)} />
          </label>
          <label>
            Način plaćanja
            <select
              value={form.payment_installments ? 'installments' : 'lump'}
              onChange={(e) => update('payment_installments', e.target.value === 'installments')}
            >
              <option value="lump">Jednokratno</option>
              <option value="installments">Obročno</option>
            </select>
          </label>
          <label>
            Rata / jednokratni iznos
            <input
              value={form.payment_installments ? data.installment_amount : data.amount_after_discount}
              readOnly
            />
          </label>
        </div>
      </section>

      {current ? (
        <dl className="tax-status-grid">
          <div>
            <dt>ePorezna UUID</dt>
            <dd>{current.external_identifier}</dd>
          </div>
          <div>
            <dt>Vrijeme</dt>
            <dd>{formatHrDateTime(current.submitted_at)}</dd>
          </div>
          <div>
            <dt>Potvrda</dt>
            <dd>{current.has_confirmation ? 'Da' : 'Ne'}</dd>
          </div>
        </dl>
      ) : null}

      <div className="tax-action-row">
        {writable ? (
          <button
            type="button"
            className="btn"
            disabled={Boolean(busy)}
            onClick={() =>
              void run('save', async () => {
                const next = await saveTz2Year(origin, token, year, {
                  first_name: form.first_name,
                  last_name: form.last_name,
                  oib: form.oib,
                  municipality_code: form.municipality_code,
                  city: form.city,
                  street: form.street,
                  house_number: form.house_number,
                  room_beds: Number(form.room_beds),
                  aux_beds: Number(form.aux_beds),
                  payment_installments: form.payment_installments,
                  ep_receipts: form.ep_receipts,
                });
                setData(next);
                setForm({
                  first_name: next.taxpayer.first_name,
                  last_name: next.taxpayer.last_name,
                  oib: next.taxpayer.oib,
                  municipality_code: next.taxpayer.municipality_code,
                  city: next.taxpayer.city,
                  street: next.taxpayer.street,
                  house_number: next.taxpayer.house_number,
                  room_beds: String(next.room_beds),
                  aux_beds: String(next.aux_beds),
                  payment_installments: next.payment_installments,
                  ep_receipts: next.ep_receipts,
                });
              })
            }
          >
            {busy === 'save' ? 'Spremanje…' : 'Spremi nacrt'}
          </button>
        ) : null}
        <button
          type="button"
          className="btn"
          disabled={Boolean(busy)}
          onClick={() => void run('xml', () => downloadTz2Xml(origin, token, year))}
        >
          {busy === 'xml' ? 'Preuzimanje…' : 'Preuzmi XML'}
        </button>
      </div>

      {writable && data.persisted && !currentUuid ? (
        <TaxSubmitEvidenceForm
          busy={busy === 'submit'}
          onSubmit={(eporezna, submittedAt) =>
            void run('submit', async () => {
              await postTz2Submit(origin, token, year, {
                eporezna_identifier: eporezna,
                submitted_at: submittedAt,
              });
              await load();
            })
          }
        />
      ) : null}
      {currentUuid && writable && current && !current.has_confirmation ? (
        <form
          className="tax-evidence-form"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem('confirmation') as HTMLInputElement;
            const file = input.files?.[0];
            if (!file) return;
            void run('confirm', async () => {
              await postSubmissionConfirmation(origin, token, currentUuid, file);
              await load();
            });
          }}
        >
          <h2>Potvrda predaje</h2>
          <p className="app-placeholder-note">
            PDF s portala ili XML predan na ePoreznu (Obrazac TZ 2).
          </p>
          <label>
            Datoteka potvrde
            <input name="confirmation" type="file" accept=".xml,.pdf,.png,.jpg,.jpeg" required disabled={Boolean(busy)} />
          </label>
          <button type="submit" className="btn" disabled={Boolean(busy)}>
            {busy === 'confirm' ? 'Prilaganje…' : 'Priloži potvrdu'}
          </button>
        </form>
      ) : null}
      {submissions.length ? (
        <div className="table-wrap">
          <h2>Povijest predaja</h2>
          <table className="docs-table">
            <thead>
              <tr>
                <th>Predaja</th>
                <th>Vrijeme</th>
                <th>ePorezna UUID</th>
                <th>Potvrda</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <HistoryRow
                  key={row.event_uuid}
                  row={row}
                  isCurrent={row.event_uuid === currentUuid}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="app-placeholder-note">
        Stope dolaze iz mapping_version {data.mapping_version}. Predaja na ePoreznu ostaje ručna.
      </p>
    </div>
  );
}

function HistoryRow({ row, isCurrent }: { row: Tz2Submission; isCurrent: boolean }) {
  return (
    <tr>
      <td>
        {tz2SubmissionLabel(row)}
        {isCurrent ? ' · trenutna' : ''}
      </td>
      <td>{formatHrDateTime(row.submitted_at)}</td>
      <td>{row.external_identifier}</td>
      <td>{row.has_confirmation ? 'Da' : 'Ne'}</td>
    </tr>
  );
}
