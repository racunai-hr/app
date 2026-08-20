'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  canWritePartners,
  createPartnerContact,
  deletePartnerContact,
  fetchPartnerContacts,
  patchPartnerContact,
  pickDirtyFields,
  type PartnerContact,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  role: string;
  partnerId: number;
};

type ContactDraft = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  contact_type: string;
  is_primary: boolean;
  is_active: boolean;
};

const CONTACT_EDIT_KEYS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'mobile',
  'contact_type',
  'is_primary',
  'is_active',
] as const;

function draftFromContact(row: PartnerContact): ContactDraft {
  return {
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    email: row.email || '',
    phone: row.phone || '',
    mobile: row.mobile || '',
    contact_type: row.contact_type || 'general',
    is_primary: Boolean(row.is_primary),
    is_active: row.is_active !== false,
  };
}

export function PartnerContactsPanel({ origin, token, role, partnerId }: Props) {
  const [rows, setRows] = useState<PartnerContact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<ContactDraft | null>(null);
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const writable = canWritePartners(role);

  const reload = async () => {
    const data = await fetchPartnerContacts(origin, token, partnerId);
    setRows(data.results);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Kontakti nisu učitani.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, partnerId]);

  const startEdit = (row: PartnerContact) => {
    const next = draftFromContact(row);
    setEditingId(row.id);
    setBaseline(next);
    setDraft(next);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBaseline(null);
    setDraft(null);
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Ime</th>
              <th>Tip</th>
              <th>E-mail</th>
              <th>Telefon</th>
              <th>Primarni</th>
              {writable && <th />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={writable ? 6 : 5} className="table-empty">
                  Nema kontakata.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.full_name}</td>
                  <td>{row.contact_type}</td>
                  <td>{row.email || '—'}</td>
                  <td>{row.phone || row.mobile || '—'}</td>
                  <td>{row.is_primary ? 'Da' : 'Ne'}</td>
                  {writable && (
                    <td>
                      {editingId !== row.id && (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => startEdit(row)}
                            disabled={editingId !== null}
                          >
                            Uredi
                          </button>
                          {!row.is_primary && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={async () => {
                                try {
                                  await patchPartnerContact(origin, token, partnerId, row.id, {
                                    is_primary: true,
                                  });
                                  await reload();
                                } catch (err) {
                                  setError(err instanceof ApiError ? err.message : 'Greška');
                                }
                              }}
                            >
                              Postavi primarni
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={async () => {
                              try {
                                await deletePartnerContact(origin, token, partnerId, row.id);
                                if (editingId === row.id) cancelEdit();
                                await reload();
                              } catch (err) {
                                setError(err instanceof ApiError ? err.message : 'Greška');
                              }
                            }}
                          >
                            Obriši
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {writable && editingId !== null && draft && baseline && (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError('');
            const dirty = pickDirtyFields(baseline, draft, CONTACT_EDIT_KEYS);
            if (Object.keys(dirty).length === 0) {
              setError('Nema promjena za spremanje.');
              setSaving(false);
              return;
            }
            try {
              await patchPartnerContact(origin, token, partnerId, editingId, dirty);
              cancelEdit();
              await reload();
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
            } finally {
              setSaving(false);
            }
          }}
        >
          <h3>Uredi kontakt</h3>
          <label>
            Ime
            <input
              value={draft.first_name}
              onChange={(e) => setDraft({ ...draft, first_name: e.target.value })}
              required
            />
          </label>
          <label>
            Prezime
            <input
              value={draft.last_name}
              onChange={(e) => setDraft({ ...draft, last_name: e.target.value })}
              required
            />
          </label>
          <label>
            Tip
            <select
              value={draft.contact_type}
              onChange={(e) => setDraft({ ...draft, contact_type: e.target.value })}
            >
              <option value="general">Općenito</option>
              <option value="sales">Prodaja</option>
              <option value="purchasing">Nabava</option>
              <option value="accounting">Računovodstvo</option>
              <option value="technical">Tehnička podrška</option>
              <option value="management">Upravljanje</option>
            </select>
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </label>
          <label>
            Telefon
            <input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </label>
          <label>
            Mobitel
            <input
              value={draft.mobile}
              onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.is_primary}
              onChange={(e) => setDraft({ ...draft, is_primary: e.target.checked })}
            />{' '}
            Primarni
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
            />{' '}
            Aktivan
          </label>
          <div className="export-actions">
            <button type="submit" className="btn" disabled={saving}>
              Spremi
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
              Odustani
            </button>
          </div>
        </form>
      )}

      {writable && editingId === null && (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setError('');
            try {
              await createPartnerContact(origin, token, partnerId, {
                first_name: String(fd.get('first_name') || ''),
                last_name: String(fd.get('last_name') || ''),
                email: String(fd.get('email') || ''),
                phone: String(fd.get('phone') || ''),
                is_primary: fd.get('is_primary') === 'on',
              });
              event.currentTarget.reset();
              await reload();
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
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
            E-mail
            <input name="email" type="email" />
          </label>
          <label>
            Telefon
            <input name="phone" />
          </label>
          <label>
            <input name="is_primary" type="checkbox" /> Primarni
          </label>
          <button type="submit" className="btn">
            Dodaj kontakt
          </button>
        </form>
      )}
    </div>
  );
}
