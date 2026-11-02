'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import { uraMonth, uraMonths } from '@/lib/tax/ura2022';

type Props = { slug: string };

export function UraReport({ slug }: Props) {
  const months = uraMonths(slug);
  const [month, setMonth] = useState(months[0]?.month ?? null);
  const view = month == null ? null : uraMonth(slug, month);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>U-RA</h1>
          <p>Knjiga primljenih računa. Snimak predanog obrasca. Iznosi su u kunama.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/porezi`}>
          Natrag
        </Link>
      </header>
      {months.length === 0 ? <p>Nema generiranog obrasca U-RA.</p> : null}
      {months.length > 0 && month != null ? (
        <form className="expense-posting-fields" onSubmit={(event) => event.preventDefault()}>
          <label>
            Mjesec
            <select className="pod-bil-year" value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((item) => (
                <option key={item.month} value={item.month}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </form>
      ) : null}
      {view ? (
        <>
          <p>
            Razdoblje od {formatHrInputDate(view.periodFrom)} do {formatHrInputDate(view.periodTo)}. Osnovica{' '}
            {formatHrAmount(view.base)}, s PDV-om {formatHrAmount(view.gross)}, PDV {formatHrAmount(view.vat)}.
          </p>
          {view.invoices.length === 0 ? <p>Nema primljenih računa.</p> : null}
          {view.invoices.length > 0 ? (
            <div className="table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Račun</th>
                    <th>Datum</th>
                    <th>Dobavljač</th>
                    <th>OIB</th>
                    <th className="cell-amount">Osnovica</th>
                    <th className="cell-amount">S PDV-om</th>
                    <th className="cell-amount">PDV</th>
                  </tr>
                </thead>
                <tbody>
                  {view.invoices.map((invoice) => (
                    <tr key={`${invoice.number}-${invoice.issuedOn}`}>
                      <td>{invoice.number}</td>
                      <td>{formatHrInputDate(invoice.issuedOn)}</td>
                      <td>
                        {invoice.supplier}
                        {invoice.address ? `, ${invoice.address}` : ''}
                      </td>
                      <td>{invoice.oib}</td>
                      <td className="cell-amount">{formatHrAmount(invoice.base)}</td>
                      <td className="cell-amount">{formatHrAmount(invoice.gross)}</td>
                      <td className="cell-amount">{formatHrAmount(invoice.vat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <h2>Potvrda zaprimanja</h2>
          <p>
            Identifikator {view.receiptId}. Zaprimljeno {formatHrDateTime(view.receivedAt)}. Obrazac {view.formId},
            potpis {view.signedBy}, {formatHrDateTime(view.signedAt)}. {view.status}
          </p>
        </>
      ) : null}
    </section>
  );
}
