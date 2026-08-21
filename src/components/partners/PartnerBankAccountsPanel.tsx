'use client';

import { useEffect, useState } from 'react';

import {
  canWritePartners,
  createPartnerBankAccount,
  deletePartnerBankAccount,
  fetchPartnerBankAccounts,
  getPartnerConflict,
  normalizeIban,
  patchPartnerBankAccount,
  pickDirtyFields,
  partnerErrorMessage,
  type PartnerBankAccount,
} from '@/lib/partners';

type Props = {
  origin: string;
  token: string;
  role: string;
  partnerId: number;
};

type BankDraft = {
  bank_name: string;
  iban: string;
  bic: string;
  currency: string;
  is_primary: boolean;
  is_active: boolean;
};

const BANK_EDIT_KEYS = [
  'bank_name',
  'iban',
  'bic',
  'currency',
  'is_primary',
  'is_active',
] as const;

function draftFromAccount(row: PartnerBankAccount): BankDraft {
  return {
    bank_name: row.bank_name || '',
    iban: row.iban || '',
    bic: row.bic || '',
    currency: row.currency || 'EUR',
    is_primary: Boolean(row.is_primary),
    is_active: row.is_active !== false,
  };
}

export function PartnerBankAccountsPanel({ origin, token, role, partnerId }: Props) {
  const [rows, setRows] = useState<PartnerBankAccount[]>([]);
  const [error, setError] = useState('');
  const [ibanError, setIbanError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<BankDraft | null>(null);
  const [draft, setDraft] = useState<BankDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const writable = canWritePartners(role);

  const reload = async () => {
    const data = await fetchPartnerBankAccounts(origin, token, partnerId);
    setRows(data.results ?? []);
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

  const startEdit = (row: PartnerBankAccount) => {
    const next = draftFromAccount(row);
    setEditingId(row.id);
    setBaseline(next);
    setDraft(next);
    setError('');
    setIbanError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBaseline(null);
    setDraft(null);
    setIbanError('');
  };

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
                                  await patchPartnerBankAccount(origin, token, partnerId, row.id, {
                                    is_primary: true,
                                  });
                                  await reload();
                                } catch (err) {
                                  setError(partnerErrorMessage(err, 'Greška'));
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
                                if (editingId === row.id) cancelEdit();
                                await reload();
                              } catch (err) {
                                setError(partnerErrorMessage(err, 'Greška'));
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
            setIbanError('');
            const normalizedDraft = { ...draft, iban: normalizeIban(draft.iban) };
            const dirty = pickDirtyFields(
              { ...baseline, iban: normalizeIban(baseline.iban) },
              normalizedDraft,
              BANK_EDIT_KEYS,
            );
            if (Object.keys(dirty).length === 0) {
              setError('Nema promjena za spremanje.');
              setSaving(false);
              return;
            }
            try {
              await patchPartnerBankAccount(origin, token, partnerId, editingId, dirty);
              cancelEdit();
              await reload();
            } catch (err) {
              if (getPartnerConflict(err)?.code === 'partner_iban_conflict') {
                setIbanError('IBAN već postoji za ovog partnera.');
              } else {
                setError(partnerErrorMessage(err));
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <h3>Uredi bankovni račun</h3>
          <label>
            Banka
            <input
              value={draft.bank_name}
              onChange={(e) => setDraft({ ...draft, bank_name: e.target.value })}
            />
          </label>
          <label>
            IBAN
            <input
              value={draft.iban}
              onChange={(e) => setDraft({ ...draft, iban: e.target.value })}
              required
              aria-invalid={Boolean(ibanError)}
              aria-describedby={ibanError ? 'iban-edit-error' : undefined}
            />
          </label>
          {ibanError && (
            <span id="iban-edit-error" className="error">
              {ibanError}
            </span>
          )}
          <label>
            BIC
            <input
              value={draft.bic}
              onChange={(e) => setDraft({ ...draft, bic: e.target.value })}
            />
          </label>
          <label>
            Valuta
            <input
              value={draft.currency}
              onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
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
            setIbanError('');
            try {
              await createPartnerBankAccount(origin, token, partnerId, {
                bank_name: String(fd.get('bank_name') || ''),
                bic: String(fd.get('bic') || ''),
                iban: normalizeIban(String(fd.get('iban') || '')),
                currency: String(fd.get('currency') || 'EUR'),
                is_primary: fd.get('is_primary') === 'on',
              });
              event.currentTarget.reset();
              await reload();
            } catch (err) {
              // Account may already exist (409) or create succeeded then follow-up failed — refresh list.
              try {
                await reload();
              } catch {
                /* keep create error */
              }
              if (getPartnerConflict(err)?.code === 'partner_iban_conflict') {
                setIbanError('IBAN već postoji za ovog partnera.');
              } else {
                setError(partnerErrorMessage(err));
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
            <input
              name="iban"
              required
              aria-invalid={Boolean(ibanError)}
              aria-describedby={ibanError ? 'iban-create-error' : undefined}
            />
          </label>
          {ibanError && (
            <span id="iban-create-error" className="error">
              {ibanError}
            </span>
          )}
          <label>
            BIC
            <input name="bic" />
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
