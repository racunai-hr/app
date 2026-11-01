'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import { pdIpoForTenantYear, pdIpoYears, type PdIpoPerson } from '@/lib/tax/pdIpo2018';

type Props = { slug: string };

function PartyBlock({ heading, person }: { heading: string; person: PdIpoPerson }) {
  return (
    <>
      <h2>{heading}</h2>
      <p>
        {person.name}, OIB {person.oib}, {person.address}, {person.country}. Udio u kapitalu{' '}
        {formatHrAmount(person.capitalShare)} %, glasačko pravo {formatHrAmount(person.votingShare)} %.
        Osnova povezanosti {person.relation}, {person.relationLabel}. Povlašteni porezni status ne.
        Preneseni porezni gubitak ne.
      </p>
      <div className="table-wrap">
        <table className="docs-table">
          <tbody>
            <tr>
              <td>Datum nastanka</td>
              <td className="cell-amount">{formatHrInputDate(person.receivable.originatedOn)}</td>
            </tr>
            <tr>
              <td>Iznos na dan nastanka</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.amountAtOrigin)}</td>
            </tr>
            <tr>
              <td>Glavnica na prvi dan</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.openingPrincipal)}</td>
            </tr>
            <tr>
              <td>Glavnica na zadnji dan</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.closingPrincipal)}</td>
            </tr>
            <tr>
              <td>Kamatna stopa</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.interestRate)} %</td>
            </tr>
            <tr>
              <td>Kamata tijekom razdoblja</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.interestInYear)}</td>
            </tr>
            <tr>
              <td>Povećanje porezne osnovice</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.taxBaseIncrease)}</td>
            </tr>
            <tr>
              <td>Kamata na zadnji dan</td>
              <td className="cell-amount">{formatHrAmount(person.receivable.interestAtYearEnd)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function PdIpoReport({ slug }: Props) {
  const years = pdIpoYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : pdIpoForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>PD-IPO</h1>
          <p>Izvješće o poslovima s povezanim osobama. Snimak predanog obrasca. Iznosi su u kunama.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranog obrasca PD-IPO.</p> : null}
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
            Razdoblje od {formatHrInputDate(view.periodFrom)} do {formatHrInputDate(view.periodTo)}{' '}
            {view.taxpayerName}, OIB {view.oib}, {view.street}, {view.place}. Ispostava {view.officeCode}.
          </p>
          {(view.obligations ?? []).map((obligation) => (
            <PartyBlock key={`${obligation.oib}-obveza-${obligation.receivable.originatedOn}`} heading="Obveza prema povezanoj osobi" person={obligation} />
          ))}
          <PartyBlock heading="Potraživanje od povezane osobe" person={view.person} />
          <h2>Potvrda zaprimanja</h2>
          <p>
            Identifikator {view.formId}.
            {view.receivedAt ? ` Zaprimljeno ${formatHrDateTime(view.receivedAt)}.` : ''} Potpis{' '}
            {view.signedBy}, {formatHrDateTime(view.signedAt)}.
            {view.receivedAt ? ' Obrazac je zaprimljen i čeka provjeru.' : ''}
            {view.processedAt ? ` Uspješno obrađen ${formatHrDateTime(view.processedAt)}.` : ''}
          </p>
        </>
      ) : null}
    </section>
  );
}
