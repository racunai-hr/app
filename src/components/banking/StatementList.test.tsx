import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const searchParams = new URLSearchParams('status=imported&page=2');
const fetchStatements = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchStatements: (...args: unknown[]) => fetchStatements(...args),
  };
});

vi.mock('./StatementImport', () => ({
  StatementImport: ({ onImported }: { onImported: () => void }) => (
    <button type="button" onClick={onImported}>
      fake-import
    </button>
  ),
}));

import { StatementList } from './StatementList';

const page = {
  as_of: '2026-08-19T10:00:00Z',
  count: 1,
  page: 2,
  page_size: 20,
  results: [
    {
      id: 1,
      statement_number: 'ST-1',
      bank_account_id: 3,
      statement_date: '2026-08-19',
      opening_balance: '0.00',
      closing_balance: '1.00',
      status: 'imported',
      currency: 'EUR',
      imported_at: null,
      reconciled_at: null,
      transaction_count: 1,
    },
  ],
};

describe('StatementList after import', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchStatements.mockReset();
    fetchStatements.mockResolvedValue(page);
    searchParams.delete('bank_account');
    searchParams.delete('date_from');
    searchParams.delete('date_to');
    searchParams.set('status', 'imported');
    searchParams.set('page', '2');
  });

  it('returns to page 1 and keeps filters after a successful import', async () => {
    render(<StatementList slug="finestar" origin="https://x" token="t" role="owner" />);
    await waitFor(() => expect(screen.getByText('ST-1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'fake-import' }));
    expect(replace).toHaveBeenCalledWith('/t/finestar/bankarstvo/izvodi?status=imported');
  });

  it('refetches even when already on page 1', async () => {
    searchParams.delete('page');
    render(<StatementList slug="finestar" origin="https://x" token="t" role="accountant" />);
    await waitFor(() => expect(fetchStatements).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'fake-import' }));
    await waitFor(() => expect(fetchStatements).toHaveBeenCalledTimes(2));
  });
});
