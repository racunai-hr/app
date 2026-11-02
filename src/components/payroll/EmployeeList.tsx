'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { contractSalaryIsHrk } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import { canWritePayroll, employeeHref, fetchEmployees, periodsHref, type Employee } from '@/lib/payroll';

type Props = { slug: string };

export function EmployeeList({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const data = await fetchEmployees(session.origin, session.token);
      setEmployees(data.results);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Zaposlenici se nisu učitali.');
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
          <h1>Zaposlenici{session ? ` — ${session.tenant.name}` : ''}</h1>
          <p>Matični podaci zaposlenika i ugovori o radu.</p>
        </div>
        <div className="tax-action-row">
          <Link className="btn btn-secondary" href={periodsHref(slug)}>
            ← Plaće
          </Link>
          {writable ? (
            <Link className="btn" href={`/t/${slug}/place/zaposlenici/novi`}>
              Novi zaposlenik
            </Link>
          ) : null}
        </div>
      </header>

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Ime i prezime</th>
              <th>OIB</th>
              <th>Mjesto</th>
              <th className="cell-amount">Ugovorena bruto plaća</th>
              <th>Aktivan</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.length ? (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link href={employeeHref(slug, employee.id)}>{employee.full_name}</Link>
                  </td>
                  <td>{employee.oib}</td>
                  <td>{employee.city || '—'}</td>
                  <td className="cell-amount">
                    {employee.active_contract ? (
                      <PayrollMoney
                        amount={employee.active_contract.base_gross_salary}
                        hrk={contractSalaryIsHrk(employee.active_contract.start_date)}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{employee.is_active ? 'Da' : 'Ne'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{employees ? 'Nema zaposlenika.' : 'Učitavanje…'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
