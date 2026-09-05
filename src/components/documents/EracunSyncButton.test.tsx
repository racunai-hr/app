import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const importInboundEracun = vi.fn();
const refreshInboundEracunInbox = vi.fn();

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
}));

vi.mock('@/lib/documents', () => ({
  newIdempotencyKey: () => 'key-1',
}));

vi.mock('@/lib/purchasing', () => ({
  importInboundEracun: (...args: unknown[]) => importInboundEracun(...args),
  refreshInboundEracunInbox: (...args: unknown[]) => refreshInboundEracunInbox(...args),
}));

import { EracunSyncButton } from './EracunSyncButton';

function result(overrides: Record<string, unknown> = {}) {
  return {
    scanned: 1,
    imported: 1,
    skipped: 0,
    failed: 0,
    remaining_importable: 0,
    errors: [],
    ...overrides,
  };
}

const IMPORT = 'Uvezi nove eRačune iz pretinca';
const REFRESH = 'Provjeri nove eRačune na super.hr';

describe('EracunSyncButton', () => {
  beforeEach(() => {
    importInboundEracun.mockReset();
    refreshInboundEracunInbox.mockReset();
  });

  it('imports and refetches the list when something was created', async () => {
    const onImported = vi.fn();
    importInboundEracun.mockResolvedValue(result({ imported: 2, skipped: 3 }));
    render(<EracunSyncButton origin="https://api.test" onImported={onImported} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Uvezeno 2, preskočeno 3.');
    });
    expect(importInboundEracun).toHaveBeenCalledWith('https://api.test', 'token');
    expect(onImported).toHaveBeenCalledTimes(1);
  });

  it('does not refetch when nothing was imported', async () => {
    const onImported = vi.fn();
    importInboundEracun.mockResolvedValue(result({ imported: 0, skipped: 47 }));
    render(<EracunSyncButton origin="https://api.test" onImported={onImported} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Uvezeno 0, preskočeno 47.');
    });
    expect(onImported).not.toHaveBeenCalled();
  });

  it('tells the user to click again when the batch cap was hit', async () => {
    importInboundEracun.mockResolvedValue(result({ imported: 25, remaining_importable: 9 }));
    render(<EracunSyncButton origin="https://api.test" onImported={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Ima još 9 — klikni ponovno.');
    });
  });

  it('reports an empty inbox instead of bare zeroes', async () => {
    importInboundEracun.mockResolvedValue(result({ scanned: 0, imported: 0 }));
    render(<EracunSyncButton origin="https://api.test" onImported={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Nema novih eRačuna u pretincu.');
    });
  });

  it('shows the server message and keeps the list untouched on failure', async () => {
    const onImported = vi.fn();
    importInboundEracun.mockRejectedValue(new Error('Sinkronizacija je već u tijeku.'));
    render(<EracunSyncButton origin="https://api.test" onImported={onImported} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    await waitFor(() => {
      expect(screen.getByText('Sinkronizacija je već u tijeku.')).toBeInTheDocument();
    });
    expect(onImported).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('blocks both buttons while a request is in flight', async () => {
    let release: (value: unknown) => void = () => {};
    importInboundEracun.mockReturnValue(new Promise((resolve) => {
      release = resolve;
    }));
    render(<EracunSyncButton origin="https://api.test" onImported={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: IMPORT }));

    expect(screen.getByRole('button', { name: IMPORT })).toBeDisabled();
    expect(screen.getByRole('button', { name: REFRESH })).toBeDisabled();

    release(result({ imported: 0, scanned: 0 }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: IMPORT })).toBeEnabled();
    });
  });

  it('refreshes the inbox with an idempotency key and imports nothing', async () => {
    const onImported = vi.fn();
    refreshInboundEracunInbox.mockResolvedValue({
      reconciliation_id: 'r-1',
      status: 'COMPLETED',
      detail: '',
    });
    render(<EracunSyncButton origin="https://api.test" onImported={onImported} />);

    fireEvent.click(screen.getByRole('button', { name: REFRESH }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Pretinac je osvježen sa super.hr.');
    });
    expect(refreshInboundEracunInbox).toHaveBeenCalledWith('https://api.test', 'token', 'key-1');
    expect(importInboundEracun).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
  });
});
