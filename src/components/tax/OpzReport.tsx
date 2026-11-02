'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import { opzForTenantYear, opzYears } from '@/lib/tax/opz2022';

type Props = { slug: string };

export function OpzReport({ slug }: Props) {
  const years = opzYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : opzForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>OPZ</h1>
          <p>Izvješće o dospjelim, a nenaplaćenim računima. Snimak predanog obrasca. Iznosi su u kunama.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranog obrasca OPZ.</p> : null}
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
      {view ? (
        <>
          <p>
            Obrazac OPZ-STAT-1. Razdoblje od {formatHrInputDate(view.periodFrom)} do{' '}
            {formatHrInputDate(view.periodTo)}, stanje na dan {formatHrInputDate(view.asOf)}. {view.taxpayerName}, OIB{' '}
            {view.oib}, {view.street}, {view.place}. Kupaca nema.
          </p>
          <p>
            Iznos računa {formatHrAmount(view.invoiceTotal)}. PDV {formatHrAmount(view.vatTotal)}. S PDV-om{' '}
            {formatHrAmount(view.grossTotal)}. Plaćeno {formatHrAmount(view.paidTotal)}. Nenaplaćeno{' '}
            {formatHrAmount(view.unpaidTotal)}.
          </p>
          <h2>Potvrda zaprimanja</h2>
          <p>
            Identifikator {view.receiptId}. Zaprimljeno {formatHrDateTime(view.receivedAt)}. Obrazac {view.formId},
            sastavljen {formatHrDateTime(view.composedAt)}, potpis {view.signedBy}, {formatHrDateTime(view.signedAt)}.{' '}
            {view.status}
          </p>
        </>
      ) : null}
    </section>
  );
}
