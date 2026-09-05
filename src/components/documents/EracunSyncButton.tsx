'use client';

import { useState } from 'react';

import { getAccessToken } from '@/lib/auth';
import { newIdempotencyKey } from '@/lib/documents';
import {
  importInboundEracun,
  refreshInboundEracunInbox,
  type EracunImportResult,
} from '@/lib/purchasing';

type Props = {
  origin: string;
  onImported: () => void;
};

type Busy = 'import' | 'refresh' | null;

function IconDownload({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={spinning ? 'docs-icon-spin' : undefined}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={spinning ? 'docs-icon-spin' : undefined}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function summarize(result: EracunImportResult): string {
  if (result.imported === 0 && result.skipped === 0 && result.failed === 0) {
    return 'Nema novih eRačuna u pretincu.';
  }
  const parts = [`Uvezeno ${result.imported}`];
  if (result.skipped) parts.push(`preskočeno ${result.skipped}`);
  if (result.failed) parts.push(`neuspješno ${result.failed}`);
  const base = `${parts.join(', ')}.`;
  return result.remaining_importable > 0
    ? `${base} Ima još ${result.remaining_importable} — klikni ponovno.`
    : base;
}

export function EracunSyncButton({ origin, onImported }: Props) {
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function run(action: Busy, task: (token: string) => Promise<string>) {
    const token = getAccessToken();
    if (!token || busy) return;
    setBusy(action);
    setMessage('');
    setError('');
    try {
      setMessage(await task(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sinkronizacija nije uspjela.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="docs-sync">
      <div className="export-actions">
        <button
          type="button"
          className="btn btn-secondary docs-icon-btn"
          disabled={busy !== null}
          onClick={() =>
            void run('import', async (token) => {
              const result = await importInboundEracun(origin, token);
              if (result.imported > 0) onImported();
              return summarize(result);
            })
          }
          title="Uvezi nove eRačune iz pretinca"
          aria-label="Uvezi nove eRačune iz pretinca"
        >
          <IconDownload spinning={busy === 'import'} />
        </button>
        <button
          type="button"
          className="btn btn-secondary docs-icon-btn"
          disabled={busy !== null}
          onClick={() =>
            void run('refresh', async (token) => {
              const result = await refreshInboundEracunInbox(origin, token, newIdempotencyKey());
              return result.status === 'COMPLETED'
                ? 'Pretinac je osvježen sa super.hr. Klikni uvoz za nove dokumente.'
                : `Osvježavanje: ${result.status}. ${result.detail}`.trim();
            })
          }
          title="Provjeri nove eRačune na super.hr"
          aria-label="Provjeri nove eRačune na super.hr"
        >
          <IconRefresh spinning={busy === 'refresh'} />
        </button>
      </div>
      {message && (
        <div className="docs-sync-status" role="status" aria-live="polite">
          {message}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
