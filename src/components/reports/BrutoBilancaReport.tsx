'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrInputDate } from '@/lib/formatHr';
import {
  brutoBilancaForTenantYear,
  brutoBilancaYears,
  formatTrialCents,
  trialSaldo,
  trialTotalCredit,
  trialTotalDebit,
  type TrialRow,
} from '@/lib/reports/brutoBilanca2014';

type Props = { slug: string };

function amountCells(row: TrialRow) {
  return (
    <>
      <td className="cell-amount">{formatTrialCents(row.openingDebit)}</td>
      <td className="cell-amount">{formatTrialCents(row.openingCredit)}</td>
      <td className="cell-amount">{formatTrialCents(row.turnoverDebit)}</td>
      <td className="cell-amount">{formatTrialCents(row.turnoverCredit)}</td>
      <td className="cell-amount">{formatTrialCents(trialTotalDebit(row))}</td>
      <td className="cell-amount">{formatTrialCents(trialTotalCredit(row))}</td>
      <td className="cell-amount">{formatTrialCents(trialSaldo(row))}</td>
    </>
  );
}

export function BrutoBilancaReport({ slug }: Props) {
  const years = brutoBilancaYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : brutoBilancaForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Bruto bilanca</h1>
          <p>Snimak starog programa. Iznosi su u kunama, s lipama.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/izvjestaji`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generirane bruto bilance.</p> : null}
      {years.length > 0 && year != null ? (
        <form className="expense-posting-fields" onSubmit={(event) => event.preventDefault()}>
          <label>
            Godina
            <select
              className="pod-bil-year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </form>
      ) : null}
      {view?.status === 'snapshot' ? (
        <>
          <p>
            Razdoblje od {formatHrInputDate(view.periodFrom)} do {formatHrInputDate(view.periodTo)}
          </p>
          <div className="table-wrap">
            <table className="docs-table bruto-bilanca-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Konto</th>
                  <th rowSpan={2}>Naziv konta</th>
                  <th className="cell-amount" colSpan={2}>
                    Početno stanje
                  </th>
                  <th className="cell-amount" colSpan={2}>
                    Promet
                  </th>
                  <th className="cell-amount" colSpan={2}>
                    Ukupno
                  </th>
                  <th className="cell-amount" rowSpan={2}>
                    Saldo
                  </th>
                </tr>
                <tr>
                  <th className="cell-amount">Duguje</th>
                  <th className="cell-amount">Potražuje</th>
                  <th className="cell-amount">Duguje</th>
                  <th className="cell-amount">Potražuje</th>
                  <th className="cell-amount">Duguje</th>
                  <th className="cell-amount">Potražuje</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) =>
                  row.kind === 'banner' ? (
                    <tr key={row.label} className="bruto-banner">
                      <td colSpan={9}>{row.label}</td>
                    </tr>
                  ) : (
                    <tr key={`${row.kind}-${row.code}-${row.label}`} className={`bruto-${row.kind}`}>
                      <td>{row.code}</td>
                      <td>{row.label}</td>
                      {amountCells(row)}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
