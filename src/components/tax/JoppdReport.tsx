'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import { joppdReport, joppdReports } from '@/lib/tax/joppd2022';

type Props = { slug: string };

export function JoppdReportView({ slug }: Props) {
  const reports = joppdReports(slug);
  const [reportOn, setReportOn] = useState(reports[0]?.reportOn ?? null);
  const view = reportOn == null ? null : joppdReport(slug, reportOn);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>JOPPD</h1>
          <p>
            Izvješće o primicima, porezu na dohodak i prirezu te doprinosima. Snimak predanog
            obrasca. Iznosi su u kunama.
          </p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {reports.length === 0 ? <p>Nema generiranog obrasca JOPPD.</p> : null}
      {reports.length > 0 && reportOn != null ? (
        <form className="expense-posting-fields" onSubmit={(event) => event.preventDefault()}>
          <label>
            Izvješće
            <select
              className="pod-bil-year"
              value={reportOn}
              onChange={(event) => setReportOn(event.target.value)}
            >
              {reports.map((item) => (
                <option key={item.reportOn} value={item.reportOn}>
                  {formatHrInputDate(item.reportOn)}
                </option>
              ))}
            </select>
          </label>
        </form>
      ) : null}
      {view ? (
        <>
          <p>
            Izvješće na dan {formatHrInputDate(view.reportOn)}, oznaka {view.mark}, vrsta 1.{' '}
            {view.taxpayerName}, OIB {view.oib}, {view.street}, {view.place}. Osoba {view.personCount},
            redaka {view.rowCount}. Porez na dohodak {formatHrAmount(view.incomeTax)}. Generacijska
            solidarnost {formatHrAmount(view.pension)}. Zdravstveno osiguranje {formatHrAmount(view.health)}.
          </p>
          <div className="table-wrap">
            <table className="docs-table">
              <tbody>
                <tr>
                  <td>Primatelj</td>
                  <td>{view.recipient}</td>
                </tr>
                <tr>
                  <td>OIB</td>
                  <td>{view.recipientOib}</td>
                </tr>
                <tr>
                  <td>Šifra prebivališta / rada</td>
                  <td>
                    {view.residenceCode} / {view.workCode}
                  </td>
                </tr>
                <tr>
                  <td>Oznaka stjecatelja / primitka</td>
                  <td>
                    {view.recipientCode} / {view.receiptCode}
                  </td>
                </tr>
                <tr>
                  <td>Oznaka rada</td>
                  <td>{view.workMark}</td>
                </tr>
                <tr>
                  <td>Razdoblje</td>
                  <td>
                    {formatHrInputDate(view.periodFrom)} – {formatHrInputDate(view.periodTo)}
                  </td>
                </tr>
                <tr>
                  <td>Sati</td>
                  <td>{view.hours}</td>
                </tr>
                {view.idleHours > 0 ? (
                  <tr>
                    <td>Neostvareni sati</td>
                    <td>{view.idleHours}</td>
                  </tr>
                ) : null}
                <tr>
                  <td>Primitak</td>
                  <td className="cell-amount">{formatHrAmount(view.receipt)}</td>
                </tr>
                <tr>
                  <td>Mirovinsko osiguranje</td>
                  <td className="cell-amount">{formatHrAmount(view.pension)}</td>
                </tr>
                <tr>
                  <td>Zdravstveno osiguranje</td>
                  <td className="cell-amount">{formatHrAmount(view.health)}</td>
                </tr>
                <tr>
                  <td>Za isplatu</td>
                  <td className="cell-amount">{formatHrAmount(view.payable)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2>Obrazac</h2>
          <p>
            Identifikator {view.formId}. Sastavljeno {formatHrDateTime(view.composedAt)}, {view.composedBy}.
          </p>
        </>
      ) : null}
    </section>
  );
}
