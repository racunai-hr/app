'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { usePartnerSession } from '@/components/partners/usePartnerSession';
import { ApiError } from '@/lib/api';
import { formatHrAmount, formatHrDateTime, formatHrInputDate } from '@/lib/formatHr';
import {
  fetchJournalEntry,
  journalSourceLabel,
  journalStatusLabel,
  type JournalEntryDetail,
} from '@/lib/journal';

type Props = { slug: string; entryId: number };

export function JournalEntryDetailView({ slug, entryId }: Props) {
  const { session, loading: sessionLoading, error: sessionError } = usePartnerSession(slug);
  const [data, setData] = useState<JournalEntryDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || !Number.isFinite(entryId) || entryId <= 0) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchJournalEntry(session.origin, session.token, entryId)
      .then((detail) => {
        if (!cancelled) setData(detail);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Temeljnica se nije učitala.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, entryId]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>
            {data ? data.entry_number : 'Temeljnica'}
            {session ? ` — ${session.tenant.name}` : ''}
          </h1>
          <p>Stavke glavne knjige. Bankovno usklađenje nije dio ovog pregleda.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/glavna-knjiga`}>
          Natrag na listu
        </Link>
      </header>

      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {(sessionLoading || (loading && !data)) && <div className="loading">Učitavanje…</div>}

      {data && (
        <>
          <p className="as-of">
            Presjek <time dateTime={data.as_of}>{formatHrDateTime(data.as_of)}</time>
          </p>
          <dl className="incoming-dl incoming-dl-inline">
            <div>
              <dt>Broj</dt>
              <dd>{data.entry_number}</dd>
            </div>
            <div>
              <dt>Datum</dt>
              <dd>{data.entry_date ? formatHrInputDate(data.entry_date) : '—'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{journalStatusLabel(data.status)}</dd>
            </div>
            <div>
              <dt>Izvor</dt>
              <dd>{journalSourceLabel(data.source_type)}</dd>
            </div>
            <div>
              <dt>Referenca</dt>
              <dd>{data.reference || '—'}</dd>
            </div>
            <div>
              <dt>Duguje</dt>
              <dd>{formatHrAmount(data.total_debit)}</dd>
            </div>
            <div>
              <dt>Potražuje</dt>
              <dd>{formatHrAmount(data.total_credit)}</dd>
            </div>
          </dl>
          <p>{data.description || '—'}</p>

          {data.lines.length === 0 ? (
            <p className="table-empty">Nema stavki temeljnice.</p>
          ) : (
            <div className="table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Konto</th>
                    <th>Naziv</th>
                    <th>Opis</th>
                    <th>Duguje</th>
                    <th>Potražuje</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.account_code || '—'}</td>
                      <td>{line.account_name || '—'}</td>
                      <td>{line.description || '—'}</td>
                      <td className="cell-amount">{formatHrAmount(line.debit)}</td>
                      <td className="cell-amount">{formatHrAmount(line.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
