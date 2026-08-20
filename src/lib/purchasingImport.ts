import { ApiError } from './api';
import type { IncomingInvoiceImport } from './purchasing';

export const OCR_IMPORT_MAX_BYTES = 10 * 1024 * 1024;
export const OCR_POLL_INITIAL_MS = 1000;
export const OCR_POLL_MAX_INTERVAL_MS = 5000;
export const OCR_POLL_MAX_MS = 180_000;
export const OCR_TERMINAL_STATUSES = new Set(['extracted', 'failed', 'confirmed', 'discarded']);

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function nextOcrPollDelay(attempt: number): number {
  return Math.min(OCR_POLL_INITIAL_MS * 2 ** attempt, OCR_POLL_MAX_INTERVAL_MS);
}

export function isOcrTerminal(status: string): boolean {
  return OCR_TERMINAL_STATUSES.has(status);
}

export function validateOcrFile(file: File | null): string | null {
  if (!file) return 'Odaberite PDF, JPG ili PNG datoteku.';
  const name = file.name.toLowerCase();
  if (!name.endsWith('.pdf') && !name.endsWith('.jpg') && !name.endsWith('.jpeg') && !name.endsWith('.png')) {
    return 'Datoteka mora biti PDF, JPG ili PNG.';
  }
  if (file.size <= 0) return 'Datoteka je prazna.';
  if (file.size > OCR_IMPORT_MAX_BYTES) return 'Datoteka je veća od 10 MB.';
  return null;
}

export function isTransientPollError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return false;
  if (err instanceof ApiError) {
    return [408, 429, 500, 502, 503, 504].includes(err.status);
  }
  return true;
}

export async function pollInvoiceImport(
  fetchRun: (signal: AbortSignal) => Promise<IncomingInvoiceImport>,
  options: { signal?: AbortSignal } = {},
): Promise<
  | { outcome: 'done'; run: IncomingInvoiceImport }
  | { outcome: 'timeout'; run: IncomingInvoiceImport }
  | { outcome: 'aborted' }
> {
  const started = Date.now();
  let attempt = 0;
  let last: IncomingInvoiceImport | null = null;
  while (Date.now() - started < OCR_POLL_MAX_MS) {
    if (options.signal?.aborted) return { outcome: 'aborted' };
    try {
      last = await fetchRun(options.signal || new AbortController().signal);
      if (isOcrTerminal(last.status)) return { outcome: 'done', run: last };
    } catch (err) {
      if (options.signal?.aborted) return { outcome: 'aborted' };
      if (!isTransientPollError(err)) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, nextOcrPollDelay(attempt)));
    attempt += 1;
  }
  if (last) return { outcome: 'timeout', run: last };
  throw new ApiError('Obrada je predugo trajala.', 504);
}
