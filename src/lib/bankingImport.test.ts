import { describe, expect, it, vi } from 'vitest';

import { ApiError } from './api';
import type { ImportRunDetail } from './banking';
import {
  BANKING_IMPORT_MAX_BYTES,
  canShowCamtImport,
  importNoticeFromRun,
  isTransientPollError,
  nextImportPollDelay,
  pollStatementImport,
  sanitizeImportText,
  uploadFailureMessage,
  validateImportFile,
} from './bankingImport';

function xmlFile(name: string, size = 12): File {
  return new File(['<xml/>'.padEnd(size, 'x')], name, { type: 'text/plain' });
}

function run(overrides: Partial<ImportRunDetail> = {}): ImportRunDetail {
  return {
    id: 7,
    run_uuid: 'run',
    status: 'queued',
    source: 'upload',
    format: 'camt053',
    original_filename: 'izvod.xml',
    statements_processed: 1,
    statements_created: 1,
    statements_updated: 0,
    transactions_processed: 4,
    transactions_created: 4,
    transactions_skipped: 0,
    error_count: 0,
    warnings: [],
    errors: [],
    created_at: '2026-08-19T10:00:00Z',
    started_at: '2026-08-19T10:00:01Z',
    finished_at: null,
    as_of: '2026-08-19T10:00:01Z',
    ...overrides,
  };
}

describe('camt import helpers', () => {
  it('shows import only for owner and accountant', () => {
    expect(canShowCamtImport('owner')).toBe(true);
    expect(canShowCamtImport('accountant')).toBe(true);
    expect(canShowCamtImport('viewer')).toBe(false);
  });

  it('validates xml file constraints without reading CAMT', () => {
    expect(validateImportFile(null)).toMatch(/jednu XML/i);
    expect(validateImportFile(xmlFile('note.txt'))).toMatch(/\.xml/i);
    expect(validateImportFile(new File([], 'a.xml'))).toMatch(/prazna/i);
    const huge = xmlFile('a.xml');
    Object.defineProperty(huge, 'size', { value: BANKING_IMPORT_MAX_BYTES + 1 });
    expect(validateImportFile(huge)).toMatch(/20 MB/);
    expect(validateImportFile(xmlFile('BCS.xml'))).toBeNull();
  });

  it('sanitizes errors and never surfaces raw html or json', () => {
    expect(sanitizeImportText('<script>alert(1)</script>Not found')).toBe('alert(1) Not found');
    expect(sanitizeImportText('{"detail":"secret"}')).toBe('');
    expect(sanitizeImportText(['Plain message'])).toBe('Plain message');
  });

  it('describes success including duplicate zero-created runs', () => {
    expect(importNoticeFromRun(run({ status: 'succeeded' }))).toContain('1 novih izvoda');
    expect(
      importNoticeFromRun(
        run({ status: 'succeeded', statements_created: 0, transactions_created: 0, transactions_skipped: 4 }),
      ),
    ).toContain('Datoteka je već bila uvezena');
  });

  it('maps upload failures without leaking html', () => {
    expect(uploadFailureMessage(new ApiError('<html>nope</html>', 502))).toBe('nope');
    expect(uploadFailureMessage(new ApiError('{"detail":"secret"}', 502))).toBe('Datoteka nije zaprimljena.');
    expect(uploadFailureMessage(new ApiError('Konflikt', 409))).toMatch(/Odaberite datoteku ponovno/);
    expect(uploadFailureMessage(new ApiError('CSV nije podržan', 422))).toContain('CSV nije podržan');
    expect(uploadFailureMessage(new TypeError('Failed to fetch'))).toMatch(/CORS/);
  });

  it('backs off poll delay up to 5 seconds', () => {
    expect(nextImportPollDelay(0)).toBe(1000);
    expect(nextImportPollDelay(1)).toBe(2000);
    expect(nextImportPollDelay(3)).toBe(5000);
  });

  it('treats 5xx as transient during poll', () => {
    expect(isTransientPollError(new ApiError('x', 503))).toBe(true);
    expect(isTransientPollError(new ApiError('x', 404))).toBe(false);
    expect(isTransientPollError(new DOMException('Aborted', 'AbortError'))).toBe(false);
  });
});

describe('pollStatementImport', () => {
  it('walks queued → running → succeeded', async () => {
    const statuses = ['queued', 'running', 'succeeded'];
    const result = await pollStatementImport(
      async () => run({ status: statuses.shift() || 'succeeded' }),
      { signal: new AbortController().signal, delay: async () => undefined, maxMs: 10_000 },
    );
    expect(result).toMatchObject({ outcome: 'terminal', run: { status: 'succeeded' } });
  });

  it('stops on worker failed', async () => {
    const result = await pollStatementImport(async () => run({ status: 'failed', errors: ['boom'] }), {
      signal: new AbortController().signal,
      delay: async () => undefined,
    });
    expect(result).toMatchObject({ outcome: 'terminal', run: { status: 'failed' } });
  });

  it('times out without marking the run failed', async () => {
    let now = 0;
    const result = await pollStatementImport(async () => run({ status: 'running' }), {
      signal: new AbortController().signal,
      maxMs: 5,
      now: () => now,
      delay: async (ms) => {
        now += ms;
      },
    });
    expect(result.outcome).toBe('timeout');
    if (result.outcome === 'timeout') expect(result.run?.status).toBe('running');
  });

  it('aborts when the signal is aborted', async () => {
    const controller = new AbortController();
    const result = pollStatementImport(
      async () => {
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      },
      {
        signal: controller.signal,
        delay: async () => undefined,
      },
    );
    await expect(result).resolves.toEqual({ outcome: 'aborted' });
  });

  it('continues after a transient poll error', async () => {
    let n = 0;
    const result = await pollStatementImport(
      async () => {
        n += 1;
        if (n === 1) throw new ApiError('gateway', 502);
        return run({ status: 'succeeded' });
      },
      { signal: new AbortController().signal, delay: async () => undefined, maxMs: 10_000 },
    );
    expect(result).toMatchObject({ outcome: 'terminal', run: { status: 'succeeded' } });
    expect(n).toBe(2);
  });
});
