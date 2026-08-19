'use client';

import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  createStatementImport,
  fetchStatementImport,
  type ImportRunCreateResponse,
  type ImportRunDetail,
} from '@/lib/banking';
import {
  canShowCamtImport,
  importNoticeFromRun,
  newIdempotencyKey,
  pollStatementImport,
  uploadFailureMessage,
  validateImportFile,
} from '@/lib/bankingImport';

type Tone = 'info' | 'error' | 'success';

type Props = {
  origin: string;
  token: string;
  role: string;
  onImported: () => void;
};

export function StatementImport({ origin, token, role, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<(ImportRunCreateResponse | ImportRunDetail) | null>(null);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<Tone>('info');
  const [timedOutRunId, setTimedOutRunId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!canShowCamtImport(role)) return null;

  function selectFile(next: File | null) {
    setFile(next);
    setIdempotencyKey(next ? newIdempotencyKey() : '');
    setRun(null);
    setTimedOutRunId(null);
    setMessage('');
  }

  async function pollRun(runId: number, signal: AbortSignal) {
    const result = await pollStatementImport(
      (pollSignal) => fetchStatementImport(origin, token, runId, pollSignal),
      { signal },
    );
    if (result.outcome === 'aborted') return;
    if (result.outcome === 'timeout') {
      setTimedOutRunId(runId);
      setRun(result.run);
      setTone('info');
      setMessage('Obrada još traje. Status možete ponovno provjeriti.');
      return;
    }
    finishRun(result.run);
  }

  function finishRun(next: ImportRunCreateResponse | ImportRunDetail) {
    setRun(next);
    setTimedOutRunId(null);
    setIdempotencyKey(newIdempotencyKey());
    if (next.status === 'succeeded') {
      setTone('success');
      setMessage(importNoticeFromRun(next));
      onImported();
      return;
    }
    setTone('error');
    setMessage(importNoticeFromRun(next));
  }

  async function startImport() {
    const invalid = validateImportFile(file);
    if (invalid) {
      setTone('error');
      setMessage(invalid);
      return;
    }
    if (!file || inFlightRef.current) return;
    const key = idempotencyKey || newIdempotencyKey();
    setIdempotencyKey(key);
    inFlightRef.current = true;
    setBusy(true);
    setTimedOutRunId(null);
    setMessage('Datoteka se šalje…');
    setTone('info');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const created = await createStatementImport(origin, token, file, key, controller.signal);
      setRun(created);
      if (created.status === 'rejected' || created.status === 'failed' || created.status === 'succeeded') {
        finishRun(created);
        return;
      }
      setMessage('Obrada izvoda je u tijeku…');
      await pollRun(created.id, controller.signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setTone('error');
      setMessage(uploadFailureMessage(err));
      if (err instanceof ApiError && err.status === 409 && inputRef.current) {
        inputRef.current.value = '';
        setFile(null);
        setIdempotencyKey('');
      }
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }

  async function recheckStatus() {
    if (!timedOutRunId || inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await pollRun(timedOutRunId, controller.signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setTone('error');
      setMessage(uploadFailureMessage(err));
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }

  const sizeLabel = file ? `${file.name} · ${formatFileSize(file.size)}` : 'Nije odabrana datoteka';

  return (
    <div className="banking-import">
      <label className="filter-field">
        <span>CAMT XML izvod</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,application/xml,text/xml"
          disabled={busy}
          onChange={(event) => selectFile(event.target.files?.[0] || null)}
        />
      </label>
      <p className="banking-import-file text-muted">{sizeLabel}</p>
      <button type="button" className="btn btn-primary" disabled={busy || !file} onClick={startImport}>
        Uvezi CAMT izvod
      </button>
      {timedOutRunId ? (
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={recheckStatus}>
          Provjeri status
        </button>
      ) : null}
      {message ? (
        <p
          className={`banking-import-status is-${tone}`}
          role="status"
          aria-live="polite"
          data-run-status={run?.status || ''}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${bytes} B`;
}
