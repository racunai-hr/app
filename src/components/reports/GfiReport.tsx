'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import { gfiForTenantYear, gfiYears } from '@/lib/reports/gfi2014';

type Props = { slug: string };

export function GfiReport({ slug }: Props) {
  const years = gfiYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : gfiForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Godišnji financijski izvještaj</h1>
          <p>Snimak predaje u Registar godišnjih financijskih izvještaja.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/izvjestaji`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema generiranog godišnjeg financijskog izvještaja.</p> : null}
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
      {view?.status === 'snapshot' && view.kind === 'filed' ? (
        <>
          <p>
            {view.taxpayerName}, OIB {view.oib}, MB {view.mb}, MBS {view.mbs}, NKD {view.nkd},{' '}
            {view.street}, {view.place}. Vrsta izvještaja {view.reportKind}. {view.sizeLabel}.{' '}
            {view.accountingStandard ? `${view.accountingStandard}. ` : ''}
            {view.ownershipLabel}. Domaći kapital {view.domesticCapitalPercent} %, strani{' '}
            {view.foreignCapitalPercent} %. Zaposleni{' '}
            {view.employeesPrevious != null
              ? `u prethodnoj godini ${view.employeesPrevious}, u tekućoj ${view.employees}`
              : view.employees}
            . Mjeseci poslovanja u
            prethodnoj godini {view.monthsPrevious}, u tekućoj {view.monthsCurrent}. Nema obveze
            revizije. Zastupnik {view.representative}. Verzija Excel datoteke {view.excelVersion}.
          </p>
          {view.filings.map((filing) => (
            <section key={filing.id}>
              <h2>Potvrda o primitku — {filing.title}</h2>
              <p>
                Identifikator {filing.receiptId}. Predano {formatHrInputDate(filing.filedOn)}{' '}
                Kontrolni broj {formatHrAmount(filing.controlNumber)}. {filing.purpose}.
              </p>
              <ul>
                {filing.documents.map((document) => (
                  <li key={document.label}>
                    {document.note ? (
                      <Link href={`/t/${slug}/izvjestaji/biljeske#${document.note}`}>{document.label}</Link>
                    ) : (
                      document.label
                    )}
                  </li>
                ))}
              </ul>
              {filing.payment ? (
                <p>
                  Nalog za uplatu {formatHrInputDate(filing.payment.paidOn)} Iznos{' '}
                  {formatHrMoney(filing.payment.amount, 'HRK')}, naknada{' '}
                  {formatHrMoney(filing.payment.fee, 'HRK')}, za uplatu{' '}
                  {formatHrMoney(filing.payment.total, 'HRK')}. Račun {filing.payment.account}. Poziv
                  na broj {filing.payment.reference}.
                </p>
              ) : null}
            </section>
          ))}
        </>
      ) : null}
      {view?.status === 'snapshot' && view.kind === 'inactive' ? (
        <>
          <p>
            {view.taxpayerName}, OIB {view.oib}, {view.street}, {view.place}.
          </p>
          <h2>Izjava o neaktivnosti</h2>
          <p>
            {view.statement} Izjava od {formatHrInputDate(view.signedOn)} daje se radi oslobođenja
            od predaje godišnjeg financijskog izvještaja, i za statistiku i za javnu objavu. Potpis{' '}
            {view.signedBy}.
          </p>
          <h2>Potvrda o primitku — {view.receiptTitle}</h2>
          <p>
            Identifikator {view.receiptId}. Predano {formatHrInputDate(view.filedOn)} {view.purpose}.
          </p>
          <ul>
            <li>{view.documentLabel}</li>
          </ul>
        </>
      ) : null}
    </section>
  );
}
