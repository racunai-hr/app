'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrInputDate } from '@/lib/formatHr';
import { naplaceneNaknadeForTenantYear, naplaceneNaknadeYears } from '@/lib/tax/naplaceneNaknade2015';

type Props = { slug: string };

export function NaplaceneNaknadeReport({ slug }: Props) {
  const years = naplaceneNaknadeYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : naplaceneNaknadeForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Oporezivanje prema naplaćenim naknadama</h1>
          <p>Snimak molbe Poreznoj upravi.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generirane molbe.</p> : null}
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
            {view.taxpayerName}, OIB {view.oib}, {view.street}, {view.place}. {view.officeName}. Molba
            od {formatHrInputDate(view.signedOn)}
          </p>
          <p>{view.body}</p>
        </>
      ) : null}
    </section>
  );
}
