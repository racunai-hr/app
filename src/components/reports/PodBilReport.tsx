'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrInputDate } from '@/lib/formatHr';
import {
  formatPodBilAmount,
  podBilForTenantYear,
  podBilYears,
  type PodBilRow,
} from '@/lib/reports/podBil2014';

type Props = { slug: string };

function amountCells(line: PodBilRow) {
  if (line.kind === 'banner') return null;
  return (
    <>
      <td className="cell-amount">{formatPodBilAmount(line.previous)}</td>
      <td className="cell-amount">{formatPodBilAmount(line.current)}</td>
    </>
  );
}

export function PodBilReport({ slug }: Props) {
  const years = podBilYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : podBilForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Bilanca (POD-BIL)</h1>
          <p>Statutarni obrazac. Iznosi snimka su u kunama, bez lipa.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/izvjestaji`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranog obrasca POD-BIL.</p> : null}
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
            Stanje na dan {formatHrInputDate(view.asOf)} Obrazac POD-BIL,{' '}
            {view.scheme === 'from-2016' ? 'raspored od 2016.' : 'raspored prije 2016.'}
          </p>
          <div className="table-wrap">
            <table className="docs-table pod-bil-table">
              <thead>
                <tr>
                  <th>Naziv pozicije</th>
                  <th>AOP</th>
                  <th className="cell-amount">Prethodna godina (neto)</th>
                  <th className="cell-amount">Tekuća godina (neto)</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((line) =>
                  line.kind === 'banner' ? (
                    <tr key={line.label} className="pod-bil-banner">
                      <td colSpan={4}>{line.label}</td>
                    </tr>
                  ) : (
                    <tr key={line.aop} className={`pod-bil-${line.kind}`}>
                      <td className={`pod-bil-d${line.depth}`}>{line.label}</td>
                      <td>{line.aop}</td>
                      {amountCells(line)}
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
