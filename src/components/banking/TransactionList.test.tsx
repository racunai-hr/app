import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const searchParams = new URLSearchParams();
const fetchTransactions = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchTransactions: (...args: unknown[]) => fetchTransactions(...args),
  };
});

import { TransactionList } from './TransactionList';

function tx(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    bank_statement_id: 10,
    bank_account_id: 3,
    transaction_date: '2026-08-06',
    value_date: null,
    amount: '100.00',
    currency: 'EUR',
    transaction_type: 'credit',
    description: 'Uplata',
    reference: '',
    counterparty_name: 'Partner',
    counterparty_iban: 'HR00',
    external_id: 'tx-1',
    match_status: 'unmatched',
    matched_payment_id: null,
    matched_journal_entry_id: null,
    ...overrides,
  };
}

describe('TransactionList GL deep-link', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchTransactions.mockReset();
    searchParams.delete('match_status');
    searchParams.delete('page');
    searchParams.delete('tx');
    searchParams.delete('statement');
  });

  it('highlights row when ?tx= matches transaction id', async () => {
    searchParams.set('statement', '28');
    searchParams.set('tx', '39');
    fetchTransactions.mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 2,
      page: 1,
      page_size: 20,
      results: [
        tx({ id: 10, description: 'Other' }),
        tx({ id: 39, description: 'Target tx', bank_statement_id: 28 }),
      ],
    });
    const { container } = render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/transakcije"
      />,
    );
    await waitFor(() => expect(screen.getByText('Target tx')).toBeInTheDocument());
    const row = container.querySelector('#tx-39');
    expect(row).not.toBeNull();
    expect(row).toHaveClass('banking-row-active');
    expect(fetchTransactions).toHaveBeenCalledWith(
      'https://x',
      't',
      expect.objectContaining({ statement: '28' }),
    );
  });

  it('shows Temeljnica link under Usklađeno when matched with journal id', async () => {
    fetchTransactions.mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 1,
      page: 1,
      page_size: 20,
      results: [tx({ id: 7, match_status: 'matched', matched_journal_entry_id: 76 })],
    });
    render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/transakcije"
      />,
    );
    await waitFor(() => expect(screen.getByText('Usklađeno')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Temeljnica' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/76',
    );
  });

  it('does not show Temeljnica when unmatched', async () => {
    fetchTransactions.mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 1,
      page: 1,
      page_size: 20,
      results: [tx({ match_status: 'unmatched', matched_journal_entry_id: null })],
    });
    render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/transakcije"
      />,
    );
    await waitFor(() => expect(screen.getByText('Neusklađeno')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Temeljnica' })).toBeNull();
  });

  it('shows only Usklađeno when matched but journal id is null', async () => {
    fetchTransactions.mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 1,
      page: 1,
      page_size: 20,
      results: [tx({ match_status: 'matched', matched_journal_entry_id: null })],
    });
    render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/transakcije"
      />,
    );
    await waitFor(() => expect(screen.getByText('Usklađeno')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Temeljnica' })).toBeNull();
  });
});
