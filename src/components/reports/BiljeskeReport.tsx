'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';
import { formatPodBilAmount } from '@/lib/reports/podBil2014';
import {
  biljeskeForTenantYear,
  biljeskeYears,
  type BiljeskeMoney,
  type BiljeskePair,
} from '@/lib/reports/biljeske2021';

type Props = { slug: string };

function PairTable({ caption, rows }: { caption: string; rows: BiljeskePair[] }) {
  return (
    <table className="docs-table pod-bil-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>Naziv</th>
          <th>Prethodna godina</th>
          <th>Tekuća godina</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{formatPodBilAmount(row.previous)}</td>
            <td>{formatPodBilAmount(row.current)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function kuna(amount: string): string {
  return `${formatHrAmount(amount)} kn`;
}

function MoneyTable({ caption, rows }: { caption: string; rows: BiljeskeMoney[] }) {
  return (
    <table className="docs-table pod-bil-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>Naziv</th>
          <th>Iznos</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{kuna(row.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function BiljeskeReport({ slug }: Props) {
  const years = biljeskeYears(slug);
  const [year, setYear] = useState(years[0] ?? null);
  const view = year == null ? null : biljeskeForTenantYear(slug, year);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Odluka i bilješke</h1>
          <p>Odluka o pokriću gubitka i bilješke uz financijske izvještaje.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/izvjestaji`}>
          Natrag
        </Link>
      </header>
      {years.length === 0 ? <p>Nema odluke i bilješki.</p> : null}
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
          <section id="odluka">
            <h2>Odluka o pokriću gubitka</h2>
            <p>
              {view.place}, {formatHrInputDate(view.decidedOn)} Gubitak se prenosi na nepokrivene gubitke.
            </p>
            <MoneyTable caption="Pokriće gubitka" rows={view.decision} />
          </section>
          <section id="biljeske">
            <h2>Bilješke uz financijske izvještaje</h2>
            <p>
              Društvo je osnovano {view.foundedYear}., MBS {view.mbs}, NKD {view.nkd}, sjedište {view.street},{' '}
              {view.place}. Zastupa {view.representative}. Bilješke su odobrene {formatHrInputDate(view.approvedOn)}{' '}
              Događaja nakon datuma bilance nema. Novac na 31.12.{view.year}. je{' '}
              {kuna(view.cash)}.
            </p>
            <PairTable caption="Aktiva" rows={view.assets} />
            <PairTable caption="Kapital i rezerve" rows={view.capital} />
            <PairTable caption="Kratkoročne obveze" rows={view.liabilities} />
            <PairTable caption="Račun dobiti i gubitka" rows={view.income} />
            <table className="docs-table pod-bil-table">
              <caption>Obračun poreza na dobit</caption>
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Iznos</th>
                </tr>
              </thead>
              <tbody>
                {view.tax.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.label === 'Stopa' ? `${row.amount} %` : formatHrAmount(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </section>
  );
}
