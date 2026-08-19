'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  canWritePartners,
  createPartnerBankAccount,
  deletePartnerBankAccount,
  fetchPartnerBankAccounts,
  patchPartnerBankAccount,
  PartnerApiError,
  type PartnerBankAccount,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  role: string;
  partnerId: number;
};

export function PartnerBankAccountsPanel({ origin, token, role, partnerId }: Props) {
  const [rows, setRows] = useState<PartnerBankAccount[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const writable = canWritePartners(role);

  const reload = async () => {
    const data = await fetchPartnerBankAccounts(origin, token, partnerId);
    setRows(data.results);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Računi nisu učitani.');
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
              <th>Banka</th>
              <th>IBAN</th>
              <th>BIC</th>
              <th>Valuta</th>
              <th>Primarni</th>
              {writable && <th />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={writable ? 6 : 5} className="table-empty">
                  Nema bankovnih računa.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.bank_name}</td>
                  <td>{row.iban}</td>
                  <td>{row.bic}</td>
                  <td>{row.currency}</td>
                  <td>{row.is_primary ? 'Da' : 'Ne'}</td>
                  {writable && (
                    <td>
                      {!row.is_primary && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={async () => {
                            try {
                              await patchPartnerBankAccount(origin, token, partnerId, row.id, {
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
                            await deletePartnerBankAccount(origin, token, partnerId, row.id);
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
              await createPartnerBankAccount(origin, token, partnerId, {
                bank_name: String(fd.get('bank_name') || ''),
                bic: String(fd.get('bic') || ''),
                iban: String(fd.get('iban') || ''),
                currency: String(fd.get('currency') || 'EUR'),
                is_primary: fd.get('is_primary') === 'on',
              });
              event.currentTarget.reset();
              await reload();
            } catch (err) {
              if (err instanceof PartnerApiError && err.conflict?.code === 'partner_iban_conflict') {
                setError('IBAN već postoji za ovog partnera.');
              } else {
                setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
              }
            }
          }}
        >
          <label>
            Banka
            <input name="bank_name" required />
          </label>
          <label>
            IBAN
            <input name="iban" required />
          </label>
          <label>
            BIC
            <input name="bic" required />
          </label>
          <label>
            Valuta
            <input name="currency" defaultValue="EUR" />
          </label>
          <label>
            <input name="is_primary" type="checkbox" /> Primarni
          </label>
          <button type="submit" className="btn">
            Dodaj račun
          </button>
        </form>
      )}
    </div>
  );
}
