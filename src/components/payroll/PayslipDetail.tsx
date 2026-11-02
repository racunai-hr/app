'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrInputDate, payrollPeriodIsHrk } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import {
  addPayslipAdjustment,
  addPayslipEarning,
  canWritePayroll,
  downloadPayslipPdf,
  fetchPayslip,
  payrollPeriodLabel,
  periodsHref,
  type PayslipDetail as PayslipDetailType,
} from '@/lib/payroll';

type Props = { slug: string; payslipId: number };

export function PayslipDetail({ slug, payslipId }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [data, setData] = useState<PayslipDetailType | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const next = await fetchPayslip(session.origin, session.token, payslipId);
      setData(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Obračunska lista se nije učitala.');
    }
  }, [session, payslipId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (sessionError && !session) return <div className="error">{sessionError}</div>;
  if (loading || !session || !data) return <div className="loading">Učitavanje…</div>;

  const hrk = payrollPeriodIsHrk(data.period.year, data.period.month);
  const money = (amount: string | null | undefined) => <PayrollMoney amount={amount} hrk={hrk} />;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Obračunska lista — {data.employee_name}</h1>
          <p>
            Period {payrollPeriodLabel(data.period.year, data.period.month)} · {formatHrInputDate(data.date_from)}
            {' – '}
            {formatHrInputDate(data.date_to)}
          </p>
        </div>
        <a className="btn btn-secondary" href={periodsHref(slug)}>
          ← Plaće
        </a>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <div className="tax-action-row">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() =>
            void (async () => {
              setBusy(true);
              try {
                await downloadPayslipPdf(session.origin, session.token, payslipId);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Preuzimanje nije uspjelo.');
              } finally {
                setBusy(false);
              }
            })()
          }
        >
          {busy ? 'Preuzimanje…' : 'Preuzmi PDF'}
        </button>
      </div>

      <div className="table-wrap">
        <table className="docs-table">
          <tbody>
            <tr>
              <td>Bruto plaća</td>
              <td className="cell-amount">{money(data.gross_salary)}</td>
            </tr>
            <tr>
              <td>Osnovica MIO I.</td>
              <td className="cell-amount">{money(data.mio1_base)}</td>
            </tr>
            <tr>
              <td>Doprinos MIO I. (iz plaće)</td>
              <td className="cell-amount">{money(data.mio1_amount)}</td>
            </tr>
            <tr>
              <td>Doprinos MIO II. (iz plaće)</td>
              <td className="cell-amount">{money(data.mio2_amount)}</td>
            </tr>
            <tr>
              <td>Dohodak</td>
              <td className="cell-amount">{money(data.income_base)}</td>
            </tr>
            <tr>
              <td>Osobni odbitak</td>
              <td className="cell-amount">{money(data.personal_allowance_amount)}</td>
            </tr>
            <tr>
              <td>Porezna osnovica</td>
              <td className="cell-amount">{money(data.tax_base)}</td>
            </tr>
            <tr>
              <td>Porez na dohodak ({data.income_tax_rate_used}%)</td>
              <td className="cell-amount">{money(data.income_tax_amount)}</td>
            </tr>
            <tr>
              <td>Neto plaća</td>
              <td className="cell-amount">{money(data.net_salary)}</td>
            </tr>
            <tr>
              <td>Neoporezivi primitci</td>
              <td className="cell-amount">{money(data.non_taxable_total)}</td>
            </tr>
            <tr>
              <td>Obustave</td>
              <td className="cell-amount">{money(data.deductions_total)}</td>
            </tr>
            <tr>
              <td>Za isplatu</td>
              <td className="cell-amount">{money(data.amount_to_pay)}</td>
            </tr>
            {data.compliance_flags?.length ? (
              <tr>
                <td>Usklađenost</td>
                <td>{data.compliance_flags.map((flag) => flag.code).join(', ')}</td>
              </tr>
            ) : null}
            <tr>
              <td>Doprinos ZO (na plaću)</td>
              <td className="cell-amount">{money(data.zo_amount)}</td>
            </tr>
            <tr>
              <td>Ukupni trošak rada</td>
              <td className="cell-amount">{money(data.total_labor_cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Radni sati / naknade</h2>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Naziv</th>
              <th className="cell-amount">Sati</th>
              <th className="cell-amount">Bruto iznos</th>
            </tr>
          </thead>
          <tbody>
            {data.earning_lines.map((line, index) => (
              <tr key={`${line.name}-${index}`}>
                <td>{line.name}</td>
                <td className="cell-amount">{line.hours}</td>
                <td className="cell-amount">{money(line.gross_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canWritePayroll(session.role) && data.status !== 'posted' ? (
        <>
          <h2>Ručni unos</h2>
          <p className="app-placeholder-note">
            Nakon unosa ponovno pokrenite obračun perioda da se iznosi usklade.
          </p>
          <form
            className="partner-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const fd = new FormData(form);
              void (async () => {
                setBusy(true);
                setError('');
                try {
                  await addPayslipEarning(session.origin, session.token, payslipId, {
                    name: String(fd.get('earn_name') || ''),
                    hours: String(fd.get('earn_hours') || '0'),
                    gross_amount: String(fd.get('earn_gross') || '0'),
                    type_code: String(fd.get('earn_type') || '') || undefined,
                  });
                  form.reset();
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Stavka se nije spremila.');
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            <label>
              Vrsta rada
              <input name="earn_type" placeholder="OVERTIME" />
            </label>
            <label>
              Naziv
              <input name="earn_name" required />
            </label>
            <label>
              Sati
              <input name="earn_hours" type="number" step="0.01" defaultValue="0" />
            </label>
            <label>
              Bruto
              <input name="earn_gross" type="number" step="0.01" required />
            </label>
            <button type="submit" className="btn" disabled={busy}>
              Dodaj naknadu
            </button>
          </form>
          <form
            className="partner-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const fd = new FormData(form);
              void (async () => {
                setBusy(true);
                setError('');
                try {
                  await addPayslipAdjustment(session.origin, session.token, payslipId, {
                    name: String(fd.get('adj_name') || ''),
                    amount: String(fd.get('adj_amount') || ''),
                    kind: String(fd.get('adj_kind') || 'deduction'),
                  });
                  form.reset();
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Stavka se nije spremila.');
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            <label>
              Naziv stavke
              <input name="adj_name" required />
            </label>
            <label>
              Iznos
              <input name="adj_amount" type="number" step="0.01" required />
            </label>
            <label>
              Vrsta
              <select name="adj_kind" defaultValue="non_taxable_receipt">
                <option value="taxable_addition">Oporezivi dodatak</option>
                <option value="non_taxable_receipt">Neoporezivi primitak</option>
                <option value="deduction">Obustava</option>
              </select>
            </label>
            <button type="submit" className="btn btn-secondary" disabled={busy}>
              Dodaj stavku
            </button>
          </form>
        </>
      ) : null}
    </section>
  );
}
