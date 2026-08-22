'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { formatHrMoney } from '@/lib/formatHr';
import {
  canWriteTax,
  downloadPdvXml,
  fetchPdvBoxes,
  fetchPdvWorkspace,
  pdvBoxRows,
  pdvReturnStatusLabel,
  pdvXmlIntegrityLabel,
  postPdvDraft,
  postPdvSubmit,
  postSubmissionConfirmation,
  razdobljaHref,
  type PdvBoxes,
  type PdvPeriodWorkspace,
} from '@/lib/pdv';

import { TaxSubmitEvidenceForm } from './TaxSubmitEvidenceForm';

type Props = { slug: string; period: string; origin: string; token: string; role: string };

export function PdvPrijava({ slug, period, origin, token, role }: Props) {
  const router = useRouter();
  const writable = canWriteTax(role);
  const [workspace, setWorkspace] = useState<PdvPeriodWorkspace | null>(null);
  const [boxes, setBoxes] = useState<PdvBoxes | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [hasConfirmation, setHasConfirmation] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [nextWorkspace, nextBoxes] = await Promise.all([
        fetchPdvWorkspace(origin, token, period),
        fetchPdvBoxes(origin, token, period),
      ]);
      setWorkspace(nextWorkspace);
      setBoxes(nextBoxes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(razdobljaHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'Prijava se nije učitala.');
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

  if (error && !workspace) return <div className="error">{error}</div>;
  if (!workspace || !boxes) return <div className="loading">Učitavanje…</div>;

  const boxRows = pdvBoxRows(boxes.fields).filter(
    (row) => row.value !== '' && row.value !== '0.00' && row.value !== 'Ne',
  );
  const canDownload = workspace.xml_integrity === 'SYNC' && workspace.return_version != null;
  const canSubmit = writable && workspace.return_status === 'generated' && workspace.return_version != null;
  const eventUuid = workspace.event_uuid;

  return (
    <div className="tax-workflow">
      {error ? <div className="error">{error}</div> : null}
      <dl className="tax-status-grid">
        <div>
          <dt>Verzija prijave</dt>
          <dd>
            {workspace.return_version != null
              ? `v${workspace.return_version} · ${pdvReturnStatusLabel(workspace.return_status)}`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>PDV za uplatu</dt>
          <dd>{formatHrMoney(boxes.vat_due, 'EUR')}</dd>
        </div>
        <div>
          <dt>XML</dt>
          <dd>{pdvXmlIntegrityLabel(workspace.xml_integrity)}</dd>
        </div>
      </dl>

      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Box</th>
              <th className="cell-amount">Vrijednost</th>
              <th className="cell-amount">Porez</th>
            </tr>
          </thead>
          <tbody>
            {boxRows.length ? (
              boxRows.map((row) => (
                <tr key={row.code}>
                  <td>{row.code}</td>
                  <td className="cell-amount">
                    {row.value === 'Da' || row.value === 'Ne' ? row.value : formatHrMoney(row.value, 'EUR')}
                  </td>
                  <td className="cell-amount">{row.tax ? formatHrMoney(row.tax, 'EUR') : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>Nema nenušnih iznosa u boxovima ovog razdoblja.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tax-action-row">
        {writable ? (
          <button
            type="button"
            className="btn"
            disabled={Boolean(busy)}
            onClick={() => void run('draft', async () => {
              await postPdvDraft(origin, token, period);
              await load();
            })}
          >
            {busy === 'draft' ? 'Generiranje…' : 'Generiraj / otvori draft'}
          </button>
        ) : null}
        <button
          type="button"
          className="btn"
          disabled={!canDownload || Boolean(busy)}
          onClick={() => void run('xml', () => downloadPdvXml(origin, token, period))}
        >
          {busy === 'xml' ? 'Preuzimanje…' : 'Preuzmi XML'}
        </button>
      </div>
      {!canDownload ? (
        <p className="app-placeholder-note">
          XML se preuzima samo iz usklađenog drafta. Nema zamjenskog iznosa ni statusa.
        </p>
      ) : null}

      {canSubmit ? (
        <TaxSubmitEvidenceForm
          busy={busy === 'submit'}
          onSubmit={(eporezna, submittedAt) =>
            void run('submit', async () => {
              const result = await postPdvSubmit(origin, token, period, {
                eporezna_identifier: eporezna,
                submitted_at: submittedAt,
                return_version: workspace.return_version as number,
              });
              setHasConfirmation(result.has_confirmation);
              await load();
            })
          }
        />
      ) : null}

      {eventUuid && writable ? (
        <ConfirmationUpload
          busy={busy === 'confirm'}
          disabled={hasConfirmation}
          onUpload={(file) =>
            void run('confirm', async () => {
              const result = await postSubmissionConfirmation(origin, token, eventUuid, file);
              setHasConfirmation(result.has_confirmation);
            })
          }
        />
      ) : null}
    </div>
  );
}

function ConfirmationUpload({
  busy,
  disabled,
  onUpload,
}: {
  busy: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <form
      className="tax-evidence-form"
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem('confirmation') as HTMLInputElement;
        const file = input.files?.[0];
        if (file) onUpload(file);
      }}
    >
      <h2>Potvrda predaje</h2>
      <label>
        Datoteka potvrde
        <input name="confirmation" type="file" required disabled={disabled || busy} />
      </label>
      <button type="submit" className="btn" disabled={disabled || busy}>
        {busy ? 'Spremanje…' : disabled ? 'Potvrda je već priložena' : 'Priloži potvrdu'}
      </button>
    </form>
  );
}
