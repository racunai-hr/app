'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { joppdHref } from '@/lib/joppdPeriod';
import { fetchPeriods, payrollPeriodLabel, periodsHref, type PayrollPeriod } from '@/lib/payroll';

type Props = { slug: string };

export function JoppdPeriodPicker({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [periods, setPeriods] = useState<PayrollPeriod[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const data = await fetchPeriods(session.origin, session.token);
      setPeriods(data.results);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Periodi se nisu učitali.');
    }
  }, [session, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>JOPPD{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>
            Izvješće o primicima, porezu na dohodak i doprinosima — generirano iz obračuna plaće
            za odabrani period.
          </p>
        </div>
        <Link className="btn btn-secondary" href={periodsHref(slug)}>
          ← Plaće
        </Link>
      </header>

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Status obračuna</th>
              <th className="cell-amount">Zaposlenici</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {periods && periods.length ? (
              periods.map((period) => {
                const key = `${period.year}-${String(period.month).padStart(2, '0')}`;
                return (
                  <tr key={period.id}>
                    <td>
                      <Link href={joppdHref(slug, key)}>
                        {payrollPeriodLabel(period.year, period.month)}
                      </Link>
                    </td>
                    <td>{period.status}</td>
                    <td className="cell-amount">{period.employee_count}</td>
                    <td className="banking-col-action">
                      <Link href={joppdHref(slug, key)}>Otvori JOPPD</Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4}>{periods ? 'Nema obračunskih perioda plaće.' : 'Učitavanje…'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
