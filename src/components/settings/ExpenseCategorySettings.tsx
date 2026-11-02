'use client';

import { useCallback, useEffect, useState } from 'react';

import { AccountPicker } from '@/components/finance/AccountPicker';
import { ApiError } from '@/lib/api';
import {
  fetchChartOfAccounts,
  fetchExpenseCategories,
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
    fetchExpenseCategories(origin, token, abort.signal)
      .then((catList) => {
        if (cancelled) return;
        setCategories(catList.results);
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

  const searchAccounts = useCallback(
    (term: string, signal: AbortSignal) => fetchChartOfAccounts(origin, token, term, signal),
    [origin, token],
  );

  async function handleAccountChange(categoryId: number, account: AccountRef | null) {
    setSavingId(categoryId);
    setError('');
    try {
      const updated = await patchExpenseCategoryDefaultAccount(origin, token, categoryId, {
        default_account_id: account?.id ?? null,
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
                    <AccountPicker
                      label={`Zadano konto za ${row.name}`}
                      value={row.default_account ?? null}
                      placeholder="Nije zadano"
                      disabled={savingId === row.id}
                      search={searchAccounts}
                      onChange={(account) => {
                        void handleAccountChange(row.id, account);
                      }}
                    />
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
