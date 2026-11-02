'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { formatHrInputDate } from '@/lib/formatHr';
import {
  fetchWorkTime,
  lockWorkTime,
  periodsHref,
  saveWorkTimeEntry,
  type WorkTimeMonthView,
} from '@/lib/payroll';

type Props = { slug: string };

export function WorkTimeGrid({ slug }: Props) {
  const { session, loading, error } = useBankingSession(slug);
  const [view, setView] = useState<WorkTimeMonthView | null>(null);
  const [message, setMessage] = useState('');

  if (error && !session) return <div className="error">{error}</div>;
  if (loading || !session) return <div className="loading">Učitavanje…</div>;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <h1>Evidencija radnog vremena</h1>
        <Link href={periodsHref(slug)}>← Plaće</Link>
      </header>
      <form
        className="partner-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const fd = new FormData(event.currentTarget);
          const employeeId = Number(fd.get('employee_id'));
          const date = String(fd.get('date') || '');
          const [year, month] = date.split('-').map(Number);
          setMessage('');
          try {
            await saveWorkTimeEntry(session.origin, session.token, {
              employee_id: employeeId,
              date,
              type_code: String(fd.get('type_code') || 'REGULAR'),
              hours: String(fd.get('hours') || '8'),
            });
            setView(await fetchWorkTime(session.origin, session.token, employeeId, year, month));
            setMessage('Unos je spremljen.');
          } catch (err) {
            setMessage(err instanceof ApiError ? err.message : 'Unos nije spremljen.');
          }
        }}
      >
        <label>
          ID zaposlenika
          <input name="employee_id" required />
        </label>
        <label>
          Datum
          <input name="date" type="date" required />
        </label>
        <label>
          Šifra vrste
          <input name="type_code" defaultValue="REGULAR" />
        </label>
        <label>
          Sati
          <input name="hours" defaultValue="8" />
        </label>
        <button className="btn" type="submit">Spremi unos</button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={async () => {
            const form = document.querySelector<HTMLFormElement>('.partner-form');
            const employeeId = Number(new FormData(form!).get('employee_id'));
            const date = String(new FormData(form!).get('date') || '');
            const [year, month] = date.split('-').map(Number);
            setMessage('');
            try {
              setView(await fetchWorkTime(session.origin, session.token, employeeId, year, month));
            } catch (err) {
              setMessage(err instanceof ApiError ? err.message : 'Evidencija se nije učitala.');
            }
          }}
        >
          Prikaži mjesec
        </button>
      </form>
      {view ? <p>Status: {view.status}</p> : null}
      {message ? <p>{message}</p> : null}
      {view ? (
        <>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => {
              const form = document.querySelector<HTMLFormElement>('.partner-form');
              const employeeId = Number(new FormData(form!).get('employee_id'));
              const date = String(new FormData(form!).get('date') || '');
              const [year, month] = date.split('-').map(Number);
              try {
                setView(await lockWorkTime(session.origin, session.token, employeeId, year, month));
                setMessage('Mjesec je zaključan.');
              } catch (err) {
                setMessage(err instanceof ApiError ? err.message : 'Zaključavanje nije uspjelo.');
              }
            }}
          >
            Zaključaj mjesec
          </button>
          <table className="docs-table">
            <tbody>
              {view.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatHrInputDate(entry.date)}</td>
                  <td>{entry.type_name}</td>
                  <td>{entry.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </section>
  );
}
