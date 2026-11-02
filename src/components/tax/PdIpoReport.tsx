'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import {
  pdIpoForTenantYear,
  pdIpoYears,
  type PdIpoLoanTotals,
  type PdIpoPerson,
  type PdIpoReceivable,
} from '@/lib/tax/pdIpo2018';

type Props = { slug: string };

function LoanRows({ loan }: { loan: PdIpoReceivable }) {
  return (
    <>
      <tr>
        <td>Datum nastanka</td>
        <td className="cell-amount">{formatHrInputDate(loan.originatedOn)}</td>
      </tr>
      <tr>
        <td>Iznos na dan nastanka</td>
        <td className="cell-amount">{formatHrAmount(loan.amountAtOrigin)}</td>
      </tr>
      <tr>
        <td>Glavnica na prvi dan</td>
        <td className="cell-amount">{formatHrAmount(loan.openingPrincipal)}</td>
      </tr>
      <tr>
        <td>Glavnica na zadnji dan</td>
        <td className="cell-amount">{formatHrAmount(loan.closingPrincipal)}</td>
      </tr>
      <tr>
        <td>Kamatna stopa</td>
        <td className="cell-amount">{formatHrAmount(loan.interestRate)} %</td>
      </tr>
      <tr>
        <td>Kamata tijekom razdoblja</td>
        <td className="cell-amount">{formatHrAmount(loan.interestInYear)}</td>
      </tr>
      <tr>
        <td>Povećanje porezne osnovice</td>
        <td className="cell-amount">{formatHrAmount(loan.taxBaseIncrease)}</td>
      </tr>
      <tr>
        <td>Kamata na zadnji dan</td>
        <td className="cell-amount">{formatHrAmount(loan.interestAtYearEnd)}</td>
      </tr>
    </>
  );
}

function TotalsRow({ totals }: { totals: PdIpoLoanTotals }) {
  return (
    <tr>
      <td>Ukupno</td>
      <td className="cell-amount">{formatHrAmount(totals.amountAtOrigin)}</td>
      <td className="cell-amount">{formatHrAmount(totals.openingPrincipal)}</td>
      <td className="cell-amount">{formatHrAmount(totals.closingPrincipal)}</td>
      <td className="cell-amount">{formatHrAmount(totals.interestInYear)}</td>
      <td className="cell-amount">{formatHrAmount(totals.interestAtYearEnd)}</td>
    </tr>
  );
}

function PartyBlock({ heading, person }: { heading: string; person: PdIpoPerson }) {
  const loans = person.loans ?? [];
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
        {loans.length > 1 ? (
          <table className="docs-table">
            <thead>
              <tr>
                <th>Datum nastanka</th>
                <th>Iznos na dan nastanka</th>
                <th>Glavnica na prvi dan</th>
                <th>Glavnica na zadnji dan</th>
                <th>Kamata tijekom razdoblja</th>
                <th>Kamata na zadnji dan</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((item) => (
                <tr key={item.originatedOn}>
                  <td>{formatHrInputDate(item.originatedOn)}</td>
                  <td className="cell-amount">{formatHrAmount(item.amountAtOrigin)}</td>
                  <td className="cell-amount">{formatHrAmount(item.openingPrincipal)}</td>
                  <td className="cell-amount">{formatHrAmount(item.closingPrincipal)}</td>
                  <td className="cell-amount">{formatHrAmount(item.interestInYear)}</td>
                  <td className="cell-amount">{formatHrAmount(item.interestAtYearEnd)}</td>
                </tr>
              ))}
              {person.totals ? <TotalsRow totals={person.totals} /> : null}
            </tbody>
          </table>
        ) : (
          <table className="docs-table">
            <tbody>
              <LoanRows loan={person.receivable} />
            </tbody>
          </table>
        )}
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
          {view.obligationTotals ? (
            <p>
              Sveukupno obveze: nastanak {formatHrAmount(view.obligationTotals.amountAtOrigin)}, početak{' '}
              {formatHrAmount(view.obligationTotals.openingPrincipal)}, kraj{' '}
              {formatHrAmount(view.obligationTotals.closingPrincipal)}, kamata u godini{' '}
              {formatHrAmount(view.obligationTotals.interestInYear)}, kamata na kraju{' '}
              {formatHrAmount(view.obligationTotals.interestAtYearEnd)}.
            </p>
          ) : null}
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
