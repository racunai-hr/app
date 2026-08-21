import { ApiError } from './api';
import type { ImportRunDetail } from './banking';

export const BANKING_IMPORT_MAX_BYTES = 20 * 1024 * 1024;
export const IMPORT_POLL_INITIAL_MS = 1000;
export const IMPORT_POLL_MAX_INTERVAL_MS = 5000;
export const IMPORT_POLL_MAX_MS = 120_000;
export const IMPORT_TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'rejected']);

export function canShowCamtImport(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function nextImportPollDelay(attempt: number): number {
  return Math.min(IMPORT_POLL_INITIAL_MS * 2 ** attempt, IMPORT_POLL_MAX_INTERVAL_MS);
}

export function isImportTerminal(status: string): boolean {
  return IMPORT_TERMINAL_STATUSES.has(status);
}

export function isTransientPollError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return false;
  if (err instanceof ApiError) {
    return [408, 429, 500, 502, 503, 504].includes(err.status);
  }
  return true;
}

export function validateImportFile(file: File | null): string | null {
  if (!file) return 'Odaberite točno jednu XML datoteku.';
  if (!file.name.toLowerCase().endsWith('.xml')) return 'Datoteka mora imati nastavak .xml.';
  if (file.size <= 0) return 'Datoteka je prazna.';
  if (file.size > BANKING_IMPORT_MAX_BYTES) {
    return 'Datoteka je veća od 20 MB.';
  }
  return null;
}

export function sanitizeImportText(value: unknown): string {
  if (value == null) return '';
  const raw = typeof value === 'string' ? value : Array.isArray(value) ? value.map(String).join(' ') : '';
  if (!raw) return '';
  const trimmed = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!trimmed || trimmed.startsWith('{') || trimmed.startsWith('[')) return '';
  return trimmed.slice(0, 180);
}

type ImportRunNotice = Pick<
  ImportRunDetail,
  'status' | 'statements_created' | 'transactions_created' | 'errors' | 'warnings'
>;

export function importNoticeFromRun(run: ImportRunNotice): string {
  const firstError = sanitizeImportText(run.errors?.[0]);
  const warningCount = run.warnings?.length || 0;
  if (run.status === 'rejected') {
    return firstError || 'Format nije podržan ili datoteka nije valjani CAMT.';
  }
  if (run.status === 'failed') {
    const extra = warningCount ? ` · ${warningCount} upozorenja` : '';
    return (firstError || 'Datoteka je zaprimljena, ali obrada nije uspjela.') + extra;
  }
  if (run.status === 'succeeded') {
    const created =
      `Obrada je završena: ${run.statements_created} novih izvoda, ${run.transactions_created} novih transakcija.`;
    if (run.statements_created === 0 && run.transactions_created === 0) {
      return `${created} Datoteka je već bila uvezena.`;
    }
    const extra = warningCount ? ` · ${warningCount} upozorenja` : '';
    return created + extra;
  }
  return `Status uvoza: ${run.status}.`;
}

export function uploadFailureMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'Ovaj zahtjev je u konfliktu s prethodnim uvozom. Odaberite datoteku ponovno i pokrenite uvoz ispočetka.';
    }
    if (err.status === 422) {
      return sanitizeImportText(err.message) || 'Format nije podržan ili datoteka nije valjani CAMT.';
    }
    if (err.status === 404) {
      return 'Datoteka nije zaprimljena.';
    }
    return sanitizeImportText(err.message) || 'Datoteka nije zaprimljena.';
  }
  if (err instanceof TypeError) {
    return 'Datoteka nije zaprimljena (mreža ili CORS). Provjerite vezu i pokušajte ponovno.';
  }
  return 'Datoteka nije zaprimljena.';
}

export type PollResult =
  | { outcome: 'terminal'; run: ImportRunDetail }
  | { outcome: 'timeout'; run: ImportRunDetail | null }
  | { outcome: 'aborted' };

export async function pollStatementImport(
  load: (signal: AbortSignal) => Promise<ImportRunDetail>,
  options: {
    signal: AbortSignal;
    maxMs?: number;
    now?: () => number;
    delay?: (ms: number, signal: AbortSignal) => Promise<void>;
  },
): Promise<PollResult> {
  const maxMs = options.maxMs ?? IMPORT_POLL_MAX_MS;
  const now = options.now ?? (() => Date.now());
  const delay = options.delay ?? defaultDelay;
  const started = now();
  let attempt = 0;
  let last: ImportRunDetail | null = null;

  while (now() - started < maxMs) {
    if (options.signal.aborted) return { outcome: 'aborted' };
    try {
      last = await load(options.signal);
      if (isImportTerminal(last.status)) return { outcome: 'terminal', run: last };
    } catch (err) {
      if (options.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        return { outcome: 'aborted' };
      }
      if (!isTransientPollError(err)) throw err;
    }
    const wait = nextImportPollDelay(attempt);
    attempt += 1;
    const remaining = maxMs - (now() - started);
    if (remaining <= 0) break;
    await delay(Math.min(wait, remaining), options.signal);
  }
  return { outcome: 'timeout', run: last };
}

function defaultDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
