'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { tenantApiOrigin } from '@/lib/documents';
import {
  fetchChartOfAccounts,
  fetchExpenseCategories,
  formatAccountOption,
  patchExpenseCategoryDefaultAccount,
  type AccountRef,
  type ExpenseCategory,
} from '@/lib/expensePosting';
import { canWritePurchasing } from '@/lib/purchasing';
import { CostCenterSettings } from '@/components/settings/CostCenterSettings';

type Props = { slug: string };

export function ExpenseCategorySettings({ slug }: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [token, setToken] = useState('');
  const [canWrite, setCanWrite] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [accounts, setAccounts] = useState<AccountRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const access = getAccessToken();
    if (!access) {
      setLoading(false);
      router.replace('/');
      return;
    }
    let cancelled = false;
    const abort = new AbortController();
    setLoading(true);
    setError('');
    fetchMe(access)
      .then(async (me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) throw new ApiError('Tvrtka nije pronađena.', 404);
        if (!canWritePurchasing(found.role)) {
          throw new ApiError('Nemate ovlast za postavke vrste troška.', 404);
        }
        const apiOrigin = tenantApiOrigin(found.admin_url);
        if (cancelled) return;
        setOrigin(apiOrigin);
        setToken(access);
        setCanWrite(true);
        const [catList, coa] = await Promise.all([
          fetchExpenseCategories(apiOrigin, access, abort.signal),
          fetchChartOfAccounts(apiOrigin, access, '', abort.signal),
        ]);
        if (cancelled) return;
        setCategories(catList.results);
        setAccounts(coa.results);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Postavke se nisu učitale.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [slug, router]);

  async function handleAccountChange(categoryId: number, defaultAccountId: number | null) {
    if (!origin || !token) return;
    setSavingId(categoryId);
    setError('');
    try {
      const updated = await patchExpenseCategoryDefaultAccount(origin, token, categoryId, {
        default_account_id: defaultAccountId,
      });
      setCategories((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Spremanje zadanoog konta nije uspjelo.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Postavke tvrtke</h1>
          <p>Vrsta troška određuje predloženo rashodno konto. Pravila knjiženja se ovdje ne uređuju.</p>
        </div>
      </header>
      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <div className="loading">Učitavanje…</div> : null}
      {!loading && canWrite ? (
        <section className="incoming-card">
          <h2>Vrsta troška → zadano konto</h2>
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
      ) : null}
      {!loading && origin && token ? (
        <CostCenterSettings origin={origin} token={token} canWrite={canWrite} />
      ) : null}
    </section>
  );
}
