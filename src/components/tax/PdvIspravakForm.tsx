'use client';

import { useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  downloadPdvIspravakXml,
  type PdvIspravakRowInput,
} from '@/lib/pdv';

type Props = { origin: string; token: string };

const EMPTY_ROW: PdvIspravakRowInput = {
  invoice_number: '',
  invoice_date: '',
  identifier_kind: 1,
  identifier: '',
  customer_name: '',
  base_5: '0.00',
  vat_5: '0.00',
  base_13: '0.00',
  vat_13: '0.00',
  base_25: '0.00',
  vat_25: '0.00',
};

function vatFor(base: string, rate: number): string {
  const amount = Number(base);
  if (!Number.isFinite(amount) || amount < 0) return '0.00';
  return (Math.round(amount * rate) / 100).toFixed(2);
}

export function PdvIspravakForm({ origin, token }: Props) {
  const [period, setPeriod] = useState('2026-09');
  const [rows, setRows] = useState<PdvIspravakRowInput[]>([{ ...EMPTY_ROW }]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(index: number, patch: Partial<PdvIspravakRowInput>) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const next = { ...row, ...patch };
        if ('base_5' in patch) next.vat_5 = vatFor(next.base_5, 5);
        if ('base_13' in patch) next.vat_13 = vatFor(next.base_13, 13);
        if ('base_25' in patch) next.vat_25 = vatFor(next.base_25, 25);
        return next;
      }),
    );
  }

  async function download() {
    setBusy(true);
    setError('');
    try {
      await downloadPdvIspravakXml(origin, token, period, rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'XML se nije složio.');
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p className="app-placeholder-note">
        Obavijest o ispravku osnovice jer potraživanje nije naplaćeno dulje od godine. Nije
        ispravak već predane PDV prijave. Račun sa stopom 0 % ne ide na ovaj obrazac.
      </p>
      <label>
        Razdoblje
        <input
          type="month"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          required
        />
      </label>
      {rows.map((row, index) => (
        <fieldset key={index} className="tax-evidence-form">
          <legend>Račun {index + 1}</legend>
          <label>
            Broj računa
            <input
              value={row.invoice_number}
              onChange={(event) => update(index, { invoice_number: event.target.value })}
              required
            />
          </label>
          <label>
            Datum računa
            <input
              type="date"
              value={row.invoice_date}
              onChange={(event) => update(index, { invoice_date: event.target.value })}
              required
            />
          </label>
          <label>
            Oznaka kupca
            <select
              value={row.identifier_kind}
              onChange={(event) => update(index, { identifier_kind: Number(event.target.value) })}
            >
              <option value={1}>1 — OIB</option>
              <option value={2}>2 — PDV ID</option>
              <option value={3}>3 — porezni broj</option>
            </select>
          </label>
          <label>
            OIB / PDV ID / porezni broj
            <input
              value={row.identifier}
              onChange={(event) => update(index, { identifier: event.target.value })}
              required
            />
          </label>
          <label>
            Naziv kupca
            <input
              value={row.customer_name}
              onChange={(event) => update(index, { customer_name: event.target.value })}
              required
            />
          </label>
          <label>
            Osnovica 5 %
            <input value={row.base_5} onChange={(event) => update(index, { base_5: event.target.value })} />
          </label>
          <label>
            Osnovica 13 %
            <input value={row.base_13} onChange={(event) => update(index, { base_13: event.target.value })} />
          </label>
          <label>
            Osnovica 25 %
            <input value={row.base_25} onChange={(event) => update(index, { base_25: event.target.value })} />
          </label>
          <p>
            Ispravljeni PDV: 5 % {row.vat_5}, 13 % {row.vat_13}, 25 % {row.vat_25}
          </p>
          {rows.length > 1 ? (
            <button type="button" className="btn" onClick={() => setRows(rows.filter((_, i) => i !== index))}>
              Ukloni redak
            </button>
          ) : null}
        </fieldset>
      ))}
      <div className="tax-action-row">
        <button type="button" className="btn" onClick={() => setRows([...rows, { ...EMPTY_ROW }])}>
          Novi račun
        </button>
        <button type="button" className="btn" disabled={busy} onClick={() => void download()}>
          {busy ? 'Slažem XML…' : 'Preuzmi XML'}
        </button>
      </div>
    </div>
  );
}
