'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { payrollPeriodIsHrk } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import {
  canWritePayroll,
  createPeriod,
  employeesHref,
  fetchPeriods,
  payrollPeriodLabel,
  payrollPeriodStatusLabel,
  periodHref,
  type PayrollPeriod,
} from '@/lib/payroll';
import { joppdListHref } from '@/lib/joppdPeriod';

type Props = { slug: string };

export function PeriodList({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [periods, setPeriods] = useState<PayrollPeriod[] | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

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
      setError(err instanceof Error ? err.message : 'Periodi plaća se nisu učitali.');
    }
  }, [session, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const writable = session ? canWritePayroll(session.role) : false;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Plaće{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>Obračunski periodi plaće: generiranje, obračun, knjiženje i JOPPD.</p>
        </div>
        <div className="tax-action-row">
          <Link className="btn btn-secondary" href={employeesHref(slug)}>
            Zaposlenici
          </Link>
          <Link className="btn btn-secondary" href={joppdListHref(slug)}>
            JOPPD
          </Link>
        </div>
      </header>

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}

      {session && writable ? (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setCreating(true);
            setError('');
            try {
              const created = await createPeriod(session.origin, session.token, {
                year: Number(fd.get('year')),
                month: Number(fd.get('month')),
                calculation_date: String(fd.get('calculation_date') || ''),
                payment_date: String(fd.get('payment_date') || ''),
              });
              router.push(periodHref(slug, created.id));
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Period se nije mogao kreirati.');
            } finally {
              setCreating(false);
            }
          }}
        >
          <label>
            Godina
            <input name="year" type="number" required defaultValue={new Date().getFullYear()} />
          </label>
          <label>
            Mjesec
            <input name="month" type="number" min={1} max={12} required defaultValue={new Date().getMonth() + 1} />
          </label>
          <label>
            Datum obračuna
            <input name="calculation_date" type="date" required />
          </label>
          <label>
            Datum isplate
            <input name="payment_date" type="date" required />
          </label>
          <button type="submit" className="btn" disabled={creating}>
            {creating ? 'Kreiranje…' : 'Novi period'}
          </button>
        </form>
      ) : null}

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th className="cell-amount">Zaposlenici</th>
              <th className="cell-amount">Bruto</th>
              <th className="cell-amount">Neto</th>
              <th className="cell-amount">Porez</th>
            </tr>
          </thead>
          <tbody>
            {periods && periods.length ? (
              periods.map((period) => (
                <tr key={period.id}>
                  <td>
                    <Link href={periodHref(slug, period.id)}>
                      {payrollPeriodLabel(period.year, period.month)}
                    </Link>
                  </td>
                  <td>{payrollPeriodStatusLabel(period.status)}</td>
                  <td className="cell-amount">{period.employee_count}</td>
                  <td className="cell-amount">
                    <PayrollMoney amount={period.gross_total} hrk={payrollPeriodIsHrk(period.year, period.month)} />
                  </td>
                  <td className="cell-amount">
                    <PayrollMoney amount={period.net_total} hrk={payrollPeriodIsHrk(period.year, period.month)} />
                  </td>
                  <td className="cell-amount">
                    <PayrollMoney amount={period.income_tax_total} hrk={payrollPeriodIsHrk(period.year, period.month)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>{periods ? 'Nema obračunskih perioda.' : 'Učitavanje…'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
