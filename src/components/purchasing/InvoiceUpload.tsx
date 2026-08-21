'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api';
import { createInvoiceImport, fetchInvoiceImport, retryInvoiceImport } from '@/lib/purchasing';
import {
  newIdempotencyKey,
  pollInvoiceImport,
  validateOcrFile,
} from '@/lib/purchasingImport';

import { usePurchasingSession } from './usePurchasingSession';

type Props = { slug: string };

export function InvoiceUpload({ slug }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = usePurchasingSession(slug);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [runId, setRunId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function startUpload(selected: File) {
    if (!session) return;
    const validation = validateOcrFile(selected);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError('');
    setMessage('Učitavanje i OCR obrada…');
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const created = await createInvoiceImport(
        session.origin,
        session.token,
        selected,
        newIdempotencyKey(),
        abort.signal,
      );
      setRunId(created.id);
      if (created.status === 'extracted') {
        router.replace(`/t/${slug}/ulazni-racuni/${created.id}`);
        return;
      }
      if (created.status === 'failed') {
        setError(created.last_error || 'OCR obrada nije uspjela.');
        setMessage('');
        return;
      }
      const polled = await pollInvoiceImport(
        (signal) => fetchInvoiceImport(session.origin, session.token, created.id, signal),
        { signal: abort.signal },
      );
      if (polled.outcome === 'aborted') return;
      if (polled.outcome === 'timeout') {
        setMessage('Obrada još traje. Možete otvoriti nacrt kad status bude spreman.');
        setRunId(polled.run.id);
        return;
      }
      if (polled.run.status === 'failed') {
        setError(polled.run.last_error || 'OCR obrada nije uspjela.');
        setMessage('');
        setRunId(polled.run.id);
        return;
      }
      router.replace(`/t/${slug}/ulazni-racuni/${polled.run.id}`);
    } catch (err) {
      if (abort.signal.aborted) return;
      setError(err instanceof ApiError ? err.message : 'Učitavanje nije uspjelo.');
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  async function handleRetry() {
    if (!session || runId == null) return;
    setBusy(true);
    setError('');
    setMessage('Ponovni pokušaj OCR obrade…');
    try {
      const retried = await retryInvoiceImport(session.origin, session.token, runId);
      const polled = await pollInvoiceImport((signal) =>
        fetchInvoiceImport(session.origin, session.token, retried.id, signal),
      );
      if (polled.outcome === 'done' && polled.run.status === 'extracted') {
        router.replace(`/t/${slug}/ulazni-racuni/${polled.run.id}`);
        return;
      }
      if (polled.outcome === 'done' && polled.run.status === 'failed') {
        setError(polled.run.last_error || 'OCR obrada nije uspjela.');
      }
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ponovni pokušaj nije uspio.');
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Učitaj ulazni račun</h1>
          <p>PDF, JPG ili PNG — AI predlaže podatke, vi potvrđujete.</p>
        </div>
      </header>
      {(sessionError || error) && <div className="error">{sessionError || error}</div>}
      {loading && <div className="loading">Učitavanje…</div>}
      {session && (
        <div className="ocr-upload">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            hidden
            onChange={(event) => {
              const next = event.target.files?.[0] || null;
              setFile(next);
              if (next) void startUpload(next);
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'Obrada…' : 'Odaberi datoteku'}
          </button>
          {file && <p className="muted">{file.name}</p>}
          {message && <p className="muted">{message}</p>}
          {runId != null && error && (
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={handleRetry}>
              Pokušaj ponovo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
