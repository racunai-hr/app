'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrInputDate, payrollPeriodIsHrk } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import { joppdHref } from '@/lib/joppdPeriod';
import {
  calculatePeriod,
  canWritePayroll,
  downloadCalculationRecapPdf,
  downloadJournalPdf,
  downloadPaymentRecapPdf,
  fetchPeriod,
  generatePeriod,
  payrollPeriodLabel,
  payrollPeriodStatusLabel,
  periodsHref,
  postPeriod,
  payslipHref,
  type PayrollPeriod,
} from '@/lib/payroll';

type Props = { slug: string; periodId: number };

export function PeriodWorkflow({ slug, periodId }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [data, setData] = useState<PayrollPeriod | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setError('');
    try {
      const next = await fetchPeriod(session.origin, session.token, periodId);
      setData(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(periodsHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'Period se nije učitao.');
    }
  }, [session, periodId, router, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Radnja nije uspjela.');
    } finally {
      setBusy('');
    }
  }

  if (sessionError && !session) return <div className="error">{sessionError}</div>;
  if (loading || !session || !data) return <div className="loading">Učitavanje…</div>;

  const writable = canWritePayroll(session.role);
  const period = payrollPeriodLabel(data.year, data.month);
  const hrk = payrollPeriodIsHrk(data.year, data.month);
  const money = (amount: string | null | undefined) => <PayrollMoney amount={amount} hrk={hrk} />;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Plaća {period}</h1>
          <p>
            Datum obračuna {formatHrInputDate(data.calculation_date)} · datum isplate{' '}
            {formatHrInputDate(data.payment_date)}
          </p>
        </div>
        <div className="tax-action-row">
          <Link className="btn btn-secondary" href={periodsHref(slug)}>
            ← Periodi
          </Link>
          <Link className="btn btn-secondary" href={joppdHref(slug, `${data.year}-${String(data.month).padStart(2, '0')}`)}>
            JOPPD
          </Link>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <dl className="tax-status-grid">
        <div>
          <dt>Status</dt>
          <dd>{payrollPeriodStatusLabel(data.status)}</dd>
        </div>
        <div>
          <dt>Zaposlenici</dt>
          <dd>{data.employee_count}</dd>
        </div>
        <div>
          <dt>Bruto</dt>
          <dd>{money(data.gross_total)}</dd>
        </div>
        <div>
          <dt>Neto</dt>
          <dd>{money(data.net_total)}</dd>
        </div>
        <div>
          <dt>Porez na dohodak</dt>
          <dd>{money(data.income_tax_total)}</dd>
        </div>
        <div>
          <dt>ZO (na plaću)</dt>
          <dd>{money(data.zo_total)}</dd>
        </div>
        {data.posted_at ? (
          <div>
            <dt>Knjiženo</dt>
            <dd>{formatHrDateTime(data.posted_at)}</dd>
          </div>
        ) : null}
      </dl>

      <p className="app-placeholder-note">
        <Link href={`/t/${slug}/place/evidencija`}>Dnevna evidencija radnog vremena</Link>
      </p>

      {writable ? (
        <div className="tax-action-row">
          <button
            type="button"
            className="btn"
            disabled={Boolean(busy) || data.status !== 'draft'}
            onClick={() => void run('generate', async () => {
              await generatePeriod(session.origin, session.token, periodId);
              await load();
            })}
          >
            {busy === 'generate' ? 'Generiranje…' : 'Generiraj obračunske liste'}
          </button>
          <button
            type="button"
            className="btn"
            disabled={Boolean(busy) || data.status === 'posted' || data.employee_count === 0}
            onClick={() => void run('calculate', async () => {
              await calculatePeriod(session.origin, session.token, periodId);
              await load();
            })}
          >
            {busy === 'calculate' ? 'Obračun…' : 'Obračunaj'}
          </button>
          <button
            type="button"
            className="btn"
            disabled={Boolean(busy) || data.status !== 'calculated'}
            onClick={() => void run('post', async () => {
              await postPeriod(session.origin, session.token, periodId);
              await load();
            })}
          >
            {busy === 'post' ? 'Knjiženje…' : 'Knjiži u glavnu knjigu'}
          </button>
        </div>
      ) : null}

      <div className="tax-action-row">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(busy)}
          onClick={() => void run('pdf-journal', () => downloadJournalPdf(session.origin, session.token, periodId))}
        >
          {busy === 'pdf-journal' ? 'Preuzimanje…' : 'Knjiženje plaće (PDF)'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(busy)}
          onClick={() =>
            void run('pdf-recap', () => downloadPaymentRecapPdf(session.origin, session.token, periodId))
          }
        >
          {busy === 'pdf-recap' ? 'Preuzimanje…' : 'Rekapitulacija isplata (PDF)'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(busy)}
          onClick={() =>
            void run('pdf-calc-recap', () =>
              downloadCalculationRecapPdf(session.origin, session.token, periodId),
            )
          }
        >
          {busy === 'pdf-calc-recap' ? 'Preuzimanje…' : 'Rekapitulacija obračuna (PDF)'}
        </button>
      </div>

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Zaposlenik</th>
              <th>Status</th>
              <th className="cell-amount">Bruto</th>
              <th className="cell-amount">Neto</th>
              <th className="cell-amount">Za isplatu</th>
              <th className="cell-amount">Porez</th>
              <th className="cell-amount">Ukupan trošak</th>
            </tr>
          </thead>
          <tbody>
            {data.payslips && data.payslips.length ? (
              data.payslips.map((payslip) => (
                <tr key={payslip.id}>
                  <td>
                    <Link href={payslipHref(slug, payslip.id)}>{payslip.employee_name}</Link>
                  </td>
                  <td>{payslip.status}</td>
                  <td className="cell-amount">{money(payslip.gross_salary)}</td>
                  <td className="cell-amount">{money(payslip.net_salary)}</td>
                  <td className="cell-amount">{money(payslip.amount_to_pay)}</td>
                  <td className="cell-amount">{money(payslip.income_tax_amount)}</td>
                  <td className="cell-amount">{money(payslip.total_labor_cost)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Nema obračunskih listi — generirajte ih iz ugovora o radu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
