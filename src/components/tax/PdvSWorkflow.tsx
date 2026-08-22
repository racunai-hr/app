'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, formatHrMoney } from '@/lib/formatHr';
import {
  canWriteTax,
  downloadPdvSXml,
  fetchPdvSPeriod,
  pdvSListHref,
  pdvSSubmissionLabel,
  postPdvSSubmit,
  postSubmissionConfirmation,
  type PdvSPeriod,
} from '@/lib/pdv';

import { TaxSubmitEvidenceForm } from './TaxSubmitEvidenceForm';

type Props = { slug: string; period: string; origin: string; token: string; role: string };
type PdvSSubmission = NonNullable<PdvSPeriod['current_submission']>;

export function PdvSWorkflow({ slug, period, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [data, setData] = useState<PdvSPeriod | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [showNewSubmit, setShowNewSubmit] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const next = await fetchPdvSPeriod(origin, token, period);
      setData(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(pdvSListHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'PDV-S se nije učitao.');
    }
  }, [origin, token, period, router, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Radnja nije uspjela.');
    } finally {
      setBusy('');
    }
  }

  if (error && !data) return <div className="error">{error}</div>;
  if (!data) return <div className="loading">Učitavanje…</div>;

  const current = data.current_submission;
  const submissions = data.submissions ?? [];
  const currentUuid = current?.event_uuid ?? data.event_uuid ?? null;
  const canSubmitInitial = writable && !currentUuid;
  const canSubmitCorrection = writable && Boolean(currentUuid) && showNewSubmit;
  const statusLabel = current
    ? `Predano · ${pdvSSubmissionLabel(current)}`
    : 'Nije predano';

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p>
        <Link href={pdvSListHref(slug)}>← PDV-S razdoblja</Link>
      </p>
      <dl className="tax-status-grid">
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>Stavke</dt>
          <dd>{data.row_count}</dd>
        </div>
        <div>
          <dt>Dobra</dt>
          <dd>{formatHrMoney(data.total_goods, 'EUR')}</dd>
        </div>
        <div>
          <dt>Usluge</dt>
          <dd>{formatHrMoney(data.total_services, 'EUR')}</dd>
        </div>
      </dl>
      {current ? (
        <dl className="tax-status-grid">
          <div>
            <dt>Trenutno predano</dt>
            <dd>{pdvSSubmissionLabel(current)}</dd>
          </div>
          <div>
            <dt>Vrijeme</dt>
            <dd>{formatHrDateTime(current.submitted_at)}</dd>
          </div>
          <div>
            <dt>ePorezna UUID</dt>
            <dd>{current.external_identifier}</dd>
          </div>
          <div>
            <dt>Potvrda</dt>
            <dd>{current.has_confirmation ? 'Da' : 'Ne'}</dd>
          </div>
        </dl>
      ) : null}
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Država</th>
              <th>PDV ID</th>
              <th className="cell-amount">Dobra</th>
              <th className="cell-amount">Usluge</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length ? (
              data.rows.map((row) => (
                <tr key={`${row.country_code}-${row.pdv_id}`}>
                  <td>{row.country_code}</td>
                  <td>{row.pdv_id}</td>
                  <td className="cell-amount">{formatHrMoney(row.goods_value, 'EUR')}</td>
                  <td className="cell-amount">{formatHrMoney(row.services_value, 'EUR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Nema agregiranih EU stavki za ovo razdoblje.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tax-action-row">
        <button
          type="button"
          className="btn"
          disabled={Boolean(busy)}
          onClick={() => void run('xml', () => downloadPdvSXml(origin, token, period))}
        >
          {busy === 'xml' ? 'Preuzimanje…' : 'Preuzmi XML'}
        </button>
        {writable && currentUuid && !showNewSubmit ? (
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => setShowNewSubmit(true)}>
            Nova predaja / Ispravak
          </button>
        ) : null}
      </div>
      <p className="app-placeholder-note">
        PDV-S nema spremljeni draft. XML se gradi uživo iz knjige; predaja se bilježi tek nakon
        ručne ePorezne. Nova predaja je cjeloviti obrazac za ovo razdoblje, ne izolirani dodatak.
      </p>
      {canSubmitInitial || canSubmitCorrection ? (
        <TaxSubmitEvidenceForm
          busy={busy === 'submit'}
          onSubmit={(eporezna, submittedAt) =>
            void run('submit', async () => {
              const result = await postPdvSSubmit(origin, token, period, {
                eporezna_identifier: eporezna,
                submitted_at: submittedAt,
              });
              if (!result.event_uuid) return;
              setShowNewSubmit(false);
              await load();
            })
          }
        />
      ) : null}
      {currentUuid && writable && current && !current.has_confirmation ? (
        <ConfirmationForm
          busy={busy === `confirm-${currentUuid}`}
          hasConfirmation={current.has_confirmation}
          onSubmit={(file) =>
            void run(`confirm-${currentUuid}`, async () => {
              await postSubmissionConfirmation(origin, token, currentUuid, file);
              await load();
            })
          }
        />
      ) : null}
      {submissions.length ? (
        <div className="table-wrap">
          <h2>Povijest predaja</h2>
          <table className="docs-table">
            <thead>
              <tr>
                <th>Predaja</th>
                <th>Vrijeme</th>
                <th>ePorezna UUID</th>
                <th>Potvrda</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <HistoryRow
                  key={row.event_uuid}
                  row={row}
                  isCurrent={row.event_uuid === currentUuid}
                  writable={writable}
                  busy={busy}
                  onAttach={(file) =>
                    void run(`confirm-${row.event_uuid}`, async () => {
                      await postSubmissionConfirmation(origin, token, row.event_uuid, file);
                      await load();
                    })
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function ConfirmationForm({
  busy,
  hasConfirmation,
  onSubmit,
}: {
  busy: boolean;
  hasConfirmation: boolean;
  onSubmit: (file: File) => void;
}) {
  return (
    <form
      className="tax-evidence-form"
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem('confirmation') as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        onSubmit(file);
      }}
    >
      <h2>Potvrda predaje</h2>
      <label>
        Datoteka potvrde
        <input name="confirmation" type="file" required disabled={hasConfirmation || busy} />
      </label>
      <button type="submit" className="btn" disabled={hasConfirmation || busy}>
        {hasConfirmation ? 'Potvrda je već priložena' : 'Priloži potvrdu'}
      </button>
    </form>
  );
}

function HistoryRow({
  row,
  isCurrent,
  writable,
  busy,
  onAttach,
}: {
  row: PdvSSubmission;
  isCurrent: boolean;
  writable: boolean;
  busy: string;
  onAttach: (file: File) => void;
}) {
  const attaching = busy === `confirm-${row.event_uuid}`;
  const showAttach = writable && !row.has_confirmation && !isCurrent;
  return (
    <tr>
      <td>{pdvSSubmissionLabel(row)}</td>
      <td>{formatHrDateTime(row.submitted_at)}</td>
      <td>{row.external_identifier}</td>
      <td>{row.has_confirmation ? 'Da' : 'Ne'}</td>
      <td className="banking-col-action">
        {showAttach ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const input = event.currentTarget.elements.namedItem('confirmation') as HTMLInputElement;
              const file = input.files?.[0];
              if (!file) return;
              onAttach(file);
            }}
          >
            <input name="confirmation" type="file" required disabled={attaching} />
            <button type="submit" className="btn" disabled={attaching}>
              {attaching ? 'Zapisivanje…' : 'Priloži'}
            </button>
          </form>
        ) : null}
      </td>
    </tr>
  );
}
