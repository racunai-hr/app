'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrAmount, formatHrDateTime, formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import { PD_FILED_YEARS, fetchPdYear, pdReceipt, type PdYear } from '@/lib/pd';

type Props = { slug: string; year: number; origin: string; token: string };

export function PdForm({ slug, year, origin, token }: Props) {
  const router = useRouter();
  const [data, setData] = useState<PdYear | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await fetchPdYear(origin, token, year));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'PD se nije učitao.');
    }
  }, [origin, token, year, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return error ? <div className="error">{error}</div> : <div className="loading">Učitavanje…</div>;
  }

  const header = data.header;
  const address = [header.street, header.house_number].filter(Boolean).join(' ');
  const receipt = pdReceipt(year);

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p>
        <Link href={`/t/${slug}/porezi`}>← Porezi</Link>
      </p>
      <form className="expense-posting-fields" onSubmit={(event) => event.preventDefault()}>
        <label>
          Godina
          <select
            className="pod-bil-year"
            value={year}
            onChange={(event) => router.push(`/t/${slug}/porezi/pd?year=${event.target.value}`)}
          >
            {PD_FILED_YEARS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </form>
      <dl className="tax-status-grid">
        <div>
          <dt>Razdoblje</dt>
          <dd>
            {formatHrInputDate(data.period_from)} – {formatHrInputDate(data.period_to)}
          </dd>
        </div>
        <div>
          <dt>Obveznik</dt>
          <dd>{header.company_name || '—'}</dd>
        </div>
        <div>
          <dt>OIB</dt>
          <dd>{header.oib || '—'}</dd>
        </div>
        <div>
          <dt>Adresa</dt>
          <dd>{[address, header.city].filter(Boolean).join(', ') || '—'}</dd>
        </div>
        <div>
          <dt>Ispostava</dt>
          <dd>{header.tax_office_code || '—'}</dd>
        </div>
        <div>
          <dt>Stopa</dt>
          <dd>{formatHrAmount(data.tax_rate)} %</dd>
        </div>
      </dl>

      {data.matches_filed ? (
        <p>Tijelo je jednako predanom obrascu za {data.tax_year}.</p>
      ) : null}
      {data.matches_filed === false ? (
        <p>Predani obrazac nije jednak iznosima iz knjige.</p>
      ) : null}

      {receipt ? (
        <>
          <h2>Potvrda zaprimanja</h2>
          <p>
            Identifikator {receipt.formId}.
            {receipt.receivedAt ? ` Zaprimljeno ${formatHrDateTime(receipt.receivedAt)}.` : ''} Potpis{' '}
            {receipt.signedBy}, {formatHrDateTime(receipt.signedAt)}.
          </p>
          <ul>
            {receipt.statuses.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </>
      ) : null}

      {data.founding_items.length > 0 ? (
        <section>
          <h2>Stavke iz godine osnivanja</h2>
          <p>
            U ovu prijavu ulaze i prihodi i rashodi iz {data.founding_year}., jer za tu godinu nema
            zaseban PD.
          </p>
          <div className="table-wrap">
            <table className="docs-table pd-lines">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Konto</th>
                  <th>Opis</th>
                  <th>Iznos</th>
                </tr>
              </thead>
              <tbody>
                {data.founding_items.map((item) => (
                  <tr key={item.entry_number}>
                    <td>{formatHrInputDate(item.entry_date)}</td>
                    <td>
                      {item.account_code} {item.account_name}
                    </td>
                    <td>{item.description}</td>
                    <td className="cell-amount">{formatHrMoney(item.amount, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {data.missing_hrk.length > 0 ? (
        <section>
          <h2>Stavke bez kunskog iznosa</h2>
          <p>Ove stavke nisu ušle u obrazac. Eur iz knjige nije preračunat tečajem.</p>
          <ul>
            {data.missing_hrk.map((item) => (
              <li key={`${item.entry_number}-${item.account_code}`}>
                {formatHrInputDate(item.entry_date)} {item.entry_number} {item.account_code}{' '}
                {item.account_name}: {item.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="table-wrap">
        <table className="docs-table pd-lines">
          <thead>
            <tr>
              <th>R.br.</th>
              <th>Opis</th>
              <th>Iznos</th>
              {data.matches_filed === false ? <th>Predano</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.code}>
                <td>{row.code}</td>
                <td>{row.label}</td>
                <td className="cell-amount">{formatHrMoney(row.amount, data.currency)}</td>
                {data.matches_filed === false ? (
                  <td className="cell-amount">{formatHrMoney(row.filed, data.currency)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
