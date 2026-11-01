'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrInputDate } from '@/lib/formatHr';
import { izjaveForTenantYear, izjaveYears } from '@/lib/tax/izjave2013';

type Props = { slug: string };

export function IzjaveReport({ slug }: Props) {
  const years = izjaveYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : izjaveForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Izjave</h1>
          <p>Snimak izjava predanih Poreznoj upravi.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranih izjava.</p> : null}
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
            {view.taxpayerName}, OIB {view.oib}, {view.address}. Registrirano{' '}
            {formatHrInputDate(view.registeredOn)} Izjave potpisane {formatHrInputDate(view.signedOn)}{' '}
            Ispostava {view.officeName}.
          </p>
          {view.statements.map((statement) => (
            <section key={statement.id}>
              <h2>{statement.title}</h2>
              <p>
                {statement.body}
                {statement.signedOn ? ` Potpisano ${formatHrInputDate(statement.signedOn)}` : ''}
              </p>
            </section>
          ))}
        </>
      ) : null}
    </section>
  );
}
