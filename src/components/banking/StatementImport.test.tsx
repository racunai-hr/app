import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api';
import type { ImportRunCreateResponse, ImportRunDetail } from '@/lib/banking';

const createStatementImport = vi.fn();
const fetchStatementImport = vi.fn();

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    createStatementImport: (...args: unknown[]) => createStatementImport(...args),
    fetchStatementImport: (...args: unknown[]) => fetchStatementImport(...args),
  };
});

vi.mock('@/lib/bankingImport', async () => {
  const actual = await vi.importActual<typeof import('@/lib/bankingImport')>('@/lib/bankingImport');
  return {
    ...actual,
    pollStatementImport: vi.fn((load, options) => {
      let t = 0;
      return actual.pollStatementImport(load, {
        signal: options.signal,
        maxMs: options.maxMs ?? 10_000,
        now: () => t,
        delay: async (ms: number) => {
          t += ms;
        },
      });
    }),
  };
});

import { StatementImport } from './StatementImport';

function xmlFile(name = 'izvod.xml'): File {
  return new File(['<Document/>'], name, { type: 'application/xml' });
}

function created(overrides: Partial<ImportRunCreateResponse> = {}): ImportRunCreateResponse {
  return {
    id: 9,
    run_uuid: 'uuid',
    status: 'queued',
    source: 'upload',
    format: 'camt053',
    original_filename: 'izvod.xml',
    statements_processed: 0,
    statements_created: 0,
    statements_updated: 0,
    transactions_processed: 0,
    transactions_created: 0,
    transactions_skipped: 0,
    error_count: 0,
    warnings: [],
    errors: [],
    created_at: '2026-08-19T10:00:00Z',
    started_at: null,
    finished_at: null,
    created: true,
    ...overrides,
  };
}

function detail(overrides: Partial<ImportRunDetail> = {}): ImportRunDetail {
  return {
    id: 9,
    run_uuid: 'uuid',
    status: 'queued',
    source: 'upload',
    format: 'camt053',
    original_filename: 'izvod.xml',
    statements_processed: 0,
    statements_created: 0,
    statements_updated: 0,
    transactions_processed: 0,
    transactions_created: 0,
    transactions_skipped: 0,
    error_count: 0,
    warnings: [],
    errors: [],
    created_at: '2026-08-19T10:00:00Z',
    started_at: '2026-08-19T10:00:01Z',
    finished_at: null,
    as_of: '2026-08-19T10:00:02Z',
    ...overrides,
  };
}

function renderImport(role = 'accountant', onImported = vi.fn()) {
  return {
    onImported,
    ...render(
      <StatementImport origin="https://finestar-stage.racunai.hr" token="token" role={role} onImported={onImported} />,
    ),
  };
}

async function chooseFile(file: File) {
  const input = screen.getByLabelText('CAMT XML izvod') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  return input;
}

describe('StatementImport', () => {
  beforeEach(() => {
    createStatementImport.mockReset();
    fetchStatementImport.mockReset();
  });

  it('hides upload controls for viewer', () => {
    renderImport('viewer');
    expect(screen.queryByLabelText('CAMT XML izvod')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Uvezi CAMT izvod' })).toBeNull();
  });

  it('shows upload for owner and accountant', () => {
    const { rerender } = renderImport('owner');
    expect(screen.getByRole('button', { name: 'Uvezi CAMT izvod' })).toBeInTheDocument();
    rerender(
      <StatementImport origin="https://x" token="t" role="accountant" onImported={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Uvezi CAMT izvod' })).toBeInTheDocument();
  });

  it('keeps import disabled until an xml file is chosen and then shows name and size', async () => {
    renderImport('accountant');
    const button = screen.getByRole('button', { name: 'Uvezi CAMT izvod' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Nije odabrana datoteka')).toBeInTheDocument();
    await chooseFile(new File(['<Document/>'], 'BCS.sample.xml', { type: 'application/xml' }));
    expect(button).toBeEnabled();
    expect(screen.getByText(/BCS\.sample\.xml · \d+ B/)).toBeInTheDocument();
  });

  it('walks queued → running → succeeded', async () => {
    createStatementImport.mockResolvedValue(created());
    fetchStatementImport
      .mockResolvedValueOnce(detail({ status: 'queued' }))
      .mockResolvedValueOnce(detail({ status: 'running' }))
      .mockResolvedValueOnce(
        detail({ status: 'succeeded', statements_created: 1, transactions_created: 2 }),
      );
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Obrada je završena');
    });
    expect(fetchStatementImport).toHaveBeenCalledTimes(3);
  });

  it('shows worker failure as received but not processed', async () => {
    createStatementImport.mockResolvedValue(created());
    fetchStatementImport.mockResolvedValue(detail({ status: 'failed', errors: ['Parser error'] }));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Parser error');
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-run-status', 'failed');
  });

  it('times out without claiming failure and allows a status recheck', async () => {
    createStatementImport.mockResolvedValue(created());
    fetchStatementImport.mockResolvedValue(detail({ status: 'running' }));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Obrada još traje');
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-run-status', 'running');
    fetchStatementImport.mockReset();
    fetchStatementImport.mockResolvedValue(
      detail({ status: 'succeeded', statements_created: 1, transactions_created: 1 }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Provjeri status' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Obrada je završena');
    });
  });

  it('aborts in-flight upload on unmount', async () => {
    let signal: AbortSignal | undefined;
    createStatementImport.mockImplementation(
      (_origin: string, _token: string, _file: File, _key: string, next?: AbortSignal) => {
        signal = next;
        return new Promise(() => undefined);
      },
    );
    const { unmount } = renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(createStatementImport).toHaveBeenCalled());
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('sends only one POST when the button is clicked twice', async () => {
    let resolvePost: (value: ImportRunCreateResponse) => void = () => undefined;
    createStatementImport.mockImplementation(
      () =>
        new Promise<ImportRunCreateResponse>((resolve) => {
          resolvePost = resolve;
        }),
    );
    fetchStatementImport.mockResolvedValue(
      detail({ status: 'succeeded', statements_created: 1, transactions_created: 2 }),
    );
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    expect(createStatementImport).toHaveBeenCalledTimes(1);
    resolvePost(created());
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Obrada je završena');
    });
  });

  it('reuses the idempotency key on retry of the same file', async () => {
    createStatementImport.mockRejectedValue(new ApiError('Datoteka nije zaprimljena.', 502));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('nije zaprimljena'));
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(createStatementImport).toHaveBeenCalledTimes(2));
    expect(createStatementImport.mock.calls[0][3]).toBe(createStatementImport.mock.calls[1][3]);
  });

  it('issues a new key when another file is selected', async () => {
    createStatementImport.mockRejectedValue(new ApiError('x', 502));
    renderImport();
    await chooseFile(xmlFile('one.xml'));
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(createStatementImport).toHaveBeenCalledTimes(1));
    await chooseFile(xmlFile('two.xml'));
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(createStatementImport).toHaveBeenCalledTimes(2));
    expect(createStatementImport.mock.calls[0][3]).not.toBe(createStatementImport.mock.calls[1][3]);
  });

  it('issues a new key after a finished run', async () => {
    createStatementImport.mockResolvedValue(created());
    fetchStatementImport.mockResolvedValue(
      detail({ status: 'succeeded', statements_created: 1, transactions_created: 1 }),
    );
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Obrada je završena');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => expect(createStatementImport).toHaveBeenCalledTimes(2));
    expect(createStatementImport.mock.calls[0][3]).not.toBe(createStatementImport.mock.calls[1][3]);
  });

  it('asks for a fresh file selection on 409 hash conflict', async () => {
    createStatementImport.mockRejectedValue(new ApiError('hash mismatch', 409));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Odaberite datoteku ponovno');
    });
    expect(screen.getByRole('status').textContent).not.toContain('hash mismatch');
    expect(createStatementImport).toHaveBeenCalledTimes(1);
  });

  it('shows 422 as unsupported format, not raw json', async () => {
    createStatementImport.mockRejectedValue(new ApiError('{"detail":"nope"}', 422));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Format nije podržan');
    });
    expect(screen.getByRole('status').textContent).not.toContain('{"detail"');
  });

  it('shows duplicate success without claiming a new row', async () => {
    createStatementImport.mockResolvedValue(created());
    fetchStatementImport.mockResolvedValue(
      detail({ status: 'succeeded', statements_created: 0, transactions_created: 0, transactions_skipped: 3 }),
    );
    const { onImported } = renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Datoteka je već bila uvezena');
    });
    expect(onImported).toHaveBeenCalledTimes(1);
  });

  it('does not surface html error bodies', async () => {
    createStatementImport.mockRejectedValue(new ApiError('<!doctype html>Not Found</html>', 404));
    renderImport();
    await chooseFile(xmlFile());
    fireEvent.click(screen.getByRole('button', { name: 'Uvezi CAMT izvod' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Datoteka nije zaprimljena');
    });
    expect(screen.getByRole('status').textContent).not.toContain('doctype');
  });
});
