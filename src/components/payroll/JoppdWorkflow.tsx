'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TaxSubmitEvidenceForm } from '@/components/tax/TaxSubmitEvidenceForm';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrDateTime, payrollPeriodKeyIsHrk } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import {
  downloadJoppdXml,
  fetchJoppdPeriod,
  joppdListHref,
  postJoppdDraft,
  postJoppdSubmit,
  type JoppdPeriod,
} from '@/lib/joppdPeriod';
import { canWritePayroll, periodsHref } from '@/lib/payroll';
import { downloadSubmissionConfirmation, pdvSSubmissionLabel, postSubmissionConfirmation } from '@/lib/pdv';

type Props = { slug: string; period: string; origin: string; token: string; role: string };

export function JoppdWorkflow({ slug, period, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWritePayroll(role);
  const hrk = payrollPeriodKeyIsHrk(period);
  const money = (amount: string | null | undefined) => <PayrollMoney amount={amount} hrk={hrk} />;
  const [data, setData] = useState<JoppdPeriod | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [showNewSubmit, setShowNewSubmit] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const next = await fetchJoppdPeriod(origin, token, period);
      setData(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(joppdListHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'JOPPD se nije učitao.');
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
  const statusLabel = current ? `Predano · ${pdvSSubmissionLabel(current)}` : 'Nije predano';

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <p>
        <Link href={joppdListHref(slug)}>← JOPPD razdoblja</Link> ·{' '}
        <Link href={periodsHref(slug)}>Plaće</Link>
      </p>
      <dl className="tax-status-grid">
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>Stjecatelji</dt>
          <dd>{data.row_count}</dd>
        </div>
        <div>
          <dt>Bruto</dt>
          <dd>{money(data.total_gross)}</dd>
        </div>
        <div>
          <dt>Neto</dt>
          <dd>{money(data.total_net)}</dd>
        </div>
        <div>
          <dt>Porez na dohodak</dt>
          <dd>{money(data.total_income_tax)}</dd>
        </div>
        <div>
          <dt>MIO I. + II.</dt>
          <dd>
            {money(data.total_mio1)} + {money(data.total_mio2)}
          </dd>
        </div>
      </dl>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>OIB</th>
              <th>Ime i prezime</th>
              <th className="cell-amount">Bruto</th>
              <th className="cell-amount">Porez</th>
              <th className="cell-amount">Neto</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length ? (
              data.rows.map((row) => (
                <tr key={row.recipient_oib}>
                  <td>{row.recipient_oib}</td>
                  <td>
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="cell-amount">{money(row.gross_salary)}</td>
                  <td className="cell-amount">{money(row.income_tax_amount)}</td>
                  <td className="cell-amount">{money(row.net_salary)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Nema obračunatih listi za ovo razdoblje.</td>
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
          onClick={() => void run('xml', () => downloadJoppdXml(origin, token, period))}
        >
          {busy === 'xml' ? 'Preuzimanje…' : 'Preuzmi XML'}
        </button>
        {writable ? (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={Boolean(busy)}
            onClick={() =>
              void run('draft', async () => {
                await postJoppdDraft(origin, token, period);
                await load();
              })
            }
          >
            {busy === 'draft' ? 'Spremanje…' : 'Spremi nacrt (verzija)'}
          </button>
        ) : null}
        {writable && currentUuid && !showNewSubmit ? (
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => setShowNewSubmit(true)}>
            Nova predaja / Ispravak
          </button>
        ) : null}
      </div>
      <p className="app-placeholder-note">
        JOPPD XML se gradi uživo iz modula plaća za ovaj period. XML struktura NIJE validirana
        protiv službenog XSD-a Porezne uprave — prije stvarne predaje u ePoreznu potrebna je
        provjera ovlaštenog računovođe. Predaja se bilježi tek nakon ručne ePorezne.
      </p>
      {canSubmitInitial || canSubmitCorrection ? (
        <TaxSubmitEvidenceForm
          busy={busy === 'submit'}
          onSubmit={(eporezna, submittedAt) =>
            void run('submit', async () => {
              const result = await postJoppdSubmit(origin, token, period, {
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
                <tr key={row.event_uuid}>
                  <td>{pdvSSubmissionLabel(row)}</td>
                  <td>{formatHrDateTime(row.submitted_at)}</td>
                  <td>{row.external_identifier}</td>
                  <td>
                    {row.has_confirmation ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          void run(`download-${row.event_uuid}`, () =>
                            downloadSubmissionConfirmation(origin, token, row.event_uuid),
                          )
                        }
                      >
                        Preuzmi
                      </button>
                    ) : (
                      'Ne'
                    )}
                  </td>
                  <td></td>
                </tr>
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
