'use client';

import { FormEvent, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  createCostCenter,
  fetchCostCenters,
  formatCostCenterOption,
  type CostCenter,
} from '@/lib/costCenters';

type Props = {
  origin: string;
  token: string;
  canWrite: boolean;
};

const KIND_LABELS: Record<string, string> = {
  location: 'Lokacijsko',
  object: 'Objektno',
  overhead: 'Režijsko',
  group: 'Grupa',
};

export function CostCenterSettings({ origin, token, canWrite }: Props) {
  const [rows, setRows] = useState<CostCenter[]>([]);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState('location');
  const [parentId, setParentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    fetchCostCenters(origin, token, abort.signal)
      .then((list) => {
        if (!cancelled) setRows(list.results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Šifarnik MT se nije učitao.');
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [origin, token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      const created = await createCostCenter(origin, token, {
        code: code.trim(),
        name: name.trim(),
        kind,
        parent_id: parentId,
      });
      setRows((current) => [...current, created].sort((a, b) => a.code.localeCompare(b.code)));
      setCode('');
      setName('');
      setParentId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Spremanje mjesta troška nije uspjelo.');
    } finally {
      setSaving(false);
    }
  }

  const groups = rows.filter((row) => row.kind === 'group');

  return (
    <section className="incoming-card">
      <h2>Mjesta troška</h2>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Šifra</th>
              <th>Naziv</th>
              <th>Vrsta</th>
              <th>Grupa</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-empty">
                  Nema mjesta troška.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{KIND_LABELS[row.kind] || row.kind}</td>
                  <td>{row.parent ? formatCostCenterOption(row.parent) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {canWrite ? (
        <form className="expense-posting-fields" onSubmit={handleCreate}>
          <label>
            Šifra
            <input value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <label>
            Naziv
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Vrsta
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="location">Lokacijsko</option>
              <option value="object">Objektno</option>
              <option value="overhead">Režijsko</option>
              <option value="group">Grupa</option>
            </select>
          </label>
          <label>
            Nadređena grupa
            <select
              value={parentId ?? ''}
              onChange={(event) => setParentId(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">—</option>
              {groups.map((row) => (
                <option key={row.id} value={row.id}>
                  {formatCostCenterOption(row)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn" disabled={saving}>
            Dodaj
          </button>
        </form>
      ) : null}
    </section>
  );
}
