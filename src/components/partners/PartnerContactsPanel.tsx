'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  canWritePartners,
  createPartnerContact,
  deletePartnerContact,
  fetchPartnerContacts,
  patchPartnerContact,
  type PartnerContact,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  role: string;
  partnerId: number;
};

export function PartnerContactsPanel({ origin, token, role, partnerId }: Props) {
  const [rows, setRows] = useState<PartnerContact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
                            await reload();
                          } catch (err) {
                            setError(err instanceof ApiError ? err.message : 'Greška');
                          }
                        }}
                      >
                        Obriši
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {writable && (
        <form
          className="filter-bar"
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
