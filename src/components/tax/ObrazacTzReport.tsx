'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import {
  formatObrazacTzValue,
  obrazacTzForTenantYear,
  obrazacTzYears,
} from '@/lib/tax/obrazacTz2014';

type Props = { slug: string };

export function ObrazacTzReport({ slug }: Props) {
  const years = obrazacTzYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : obrazacTzForTenantYear(slug, year);
  const title = view?.status === 'snapshot' ? (view.formTitle ?? 'Obrazac TZ') : 'Obrazac TZ';

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>{title}</h1>
          <p>Članarina turističkoj zajednici. Snimak predanog obrasca. Iznosi su u kunama.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranog obrasca TZ.</p> : null}
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
      {view?.status === 'notice' ? (
        <>
          <p>
            {view.taxpayerName}, OIB {view.oib}. Obavijest Porezne uprave od{' '}
            {formatHrInputDate(view.deliveredOn)}. Obavezno uručenje: ne.
          </p>
          <p>{view.text}</p>
        </>
      ) : null}
      {view?.status === 'snapshot' ? (
        <>
          <p>
            {title}. Obračun od {formatHrInputDate(view.periodFrom)} do {formatHrInputDate(view.periodTo)}{' '}
            {view.taxpayerName}, OIB {view.oib}, ispostava {view.officeName}.
          </p>
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>R.br.</th>
                  <th>Opis</th>
                  <th>AOP</th>
                  <th className="cell-amount">Svota</th>
                </tr>
              </thead>
              <tbody>
                {view.lines.map((line) => (
                  <tr key={line.aop}>
                    <td>{line.ordinal}</td>
                    <td>{line.label}</td>
                    <td>{line.aop}</td>
                    <td className="cell-amount">{formatObrazacTzValue(line.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Potvrda zaprimanja</h2>
          <p>
            Identifikator {view.receiptId}. Zaprimljeno {formatHrDateTime(view.receivedAt)}. Obrazac{' '}
            {view.formId}, potpis {view.signedBy}, {formatHrDateTime(view.signedAt)}.
          </p>
          <ul>
            {view.statuses.map((item) => (
              <li key={item.code}>{item.text}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
