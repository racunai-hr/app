'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  fetchChartOfAccounts,
  fetchExpenseCategories,
  formatAccountOption,
  patchExpenseCategoryDefaultAccount,
  type AccountRef,
  type ExpenseCategory,
} from '@/lib/expensePosting';

type Props = {
  origin: string;
  token: string;
  canWrite: boolean;
};

export function ExpenseCategorySettings({ origin, token, canWrite }: Props) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [accounts, setAccounts] = useState<AccountRef[]>([]);
  const [loading, setLoading] = useState(canWrite);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!canWrite) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const abort = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      fetchExpenseCategories(origin, token, abort.signal),
      fetchChartOfAccounts(origin, token, '', abort.signal),
    ])
      .then(([catList, coa]) => {
        if (cancelled) return;
        setCategories(catList.results);
        setAccounts(coa.results);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Vrste troška se nisu učitale.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [origin, token, canWrite]);

  async function handleAccountChange(categoryId: number, defaultAccountId: number | null) {
    setSavingId(categoryId);
    setError('');
    try {
      const updated = await patchExpenseCategoryDefaultAccount(origin, token, categoryId, {
        default_account_id: defaultAccountId,
      });
      setCategories((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Spremanje zadanog konta nije uspjelo.');
    } finally {
      setSavingId(null);
    }
  }

  if (!canWrite) {
    return (
      <section className="incoming-card">
        <h2>Vrsta troška → zadano konto</h2>
        <p role="note">
          Vaša rola nema pristup šifarniku vrsta troška. Mjesta troška su dostupna za pregled.
        </p>
      </section>
    );
  }

  return (
    <section className="incoming-card">
      <h2>Vrsta troška → zadano konto</h2>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <div className="loading">Učitavanje…</div> : null}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Vrsta troška</th>
              <th>Zadano konto</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="table-empty">
                  Nema aktivnih vrsta troška.
                </td>
              </tr>
            ) : (
              categories.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>
                    <select
                      aria-label={`Zadano konto za ${row.name}`}
                      value={row.default_account?.id ?? ''}
                      disabled={savingId === row.id}
                      onChange={(event) => {
                        const value = event.target.value;
                        void handleAccountChange(row.id, value === '' ? null : Number(value));
                      }}
                    >
                      <option value="">Nije zadano</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {formatAccountOption(account)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
