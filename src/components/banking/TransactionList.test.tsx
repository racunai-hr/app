import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
const fetchTransactions = vi.fn();
const fetchOpenItemCandidates = vi.fn();
const reconcileOpenItem = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchTransactions: (...args: unknown[]) => fetchTransactions(...args),
    fetchOpenItemCandidates: (...args: unknown[]) => fetchOpenItemCandidates(...args),
    reconcileOpenItem: (...args: unknown[]) => reconcileOpenItem(...args),
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

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    item_id: 42,
    partner_id: 1,
    partner_name: 'Partner d.o.o.',
    direction: 'incoming',
    source_type: 'expense',
    source_id: 30,
    source_label: '26210-H120-5154',
    open_amount: '100.00',
    due_date: '2026-08-06',
    action_label: 'Zatvori ulazni',
    ...overrides,
  };
}

describe('TransactionList GL deep-link', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchTransactions.mockReset();
    fetchOpenItemCandidates.mockReset();
    reconcileOpenItem.mockReset();
    for (const key of [...searchParams.keys()]) {
      searchParams.delete(key);
    }
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
      results: [tx({ id: 7, match_status: 'matched', matched_journal_entry_id: 123 })],
    });
    render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/transakcije"
      />,
    );
    await waitFor(() => expect(screen.getByRole('link', { name: 'Temeljnica' })).toBeInTheDocument());
    const link = screen.getByRole('link', { name: 'Temeljnica' });
    expect(link).toHaveAttribute('href', '/t/finestar/glavna-knjiga/123');
    expect(link.getAttribute('href')).not.toMatch(/entry|JE-/i);
    const statusStack = link.closest('.cell-stack');
    expect(statusStack).not.toBeNull();
    expect(statusStack).toHaveTextContent('Usklađeno');
    expect(statusStack?.querySelector('.badge')).toHaveTextContent('Usklađeno');
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

describe('TransactionList reconcile deep-link', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchTransactions.mockReset();
    fetchOpenItemCandidates.mockReset();
    reconcileOpenItem.mockReset();
    for (const key of [...searchParams.keys()]) {
      searchParams.delete(key);
    }
    fetchTransactions.mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 1,
      page: 1,
      page_size: 20,
      results: [tx({ id: 5, match_status: 'unmatched' })],
    });
  });

  it('highlights candidate row when subledger_item matches URL param', async () => {
    searchParams.set('subledger_item', '42');
    fetchOpenItemCandidates.mockResolvedValue({
      count: 2,
      results: [candidate({ item_id: 7 }), candidate({ item_id: 42 })],
    });
    const { container } = render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/uskladivanje"
        reconcileMode
      />,
    );
    await waitFor(() => expect(screen.getByText('Uplata')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Poveži transakciju 5' }));
    await waitFor(() => {
      expect(container.querySelector('#subledger-item-42')).not.toBeNull();
    });
    const row = container.querySelector('#subledger-item-42');
    expect(row).toHaveClass('banking-row-active');
  });

  it('shows post-reconcile document link and clears subledger_item from URL', async () => {
    searchParams.set('match_status', 'unmatched');
    searchParams.set('subledger_item', '42');
    fetchOpenItemCandidates.mockResolvedValue({
      count: 1,
      results: [candidate()],
    });
    reconcileOpenItem.mockResolvedValue(tx({ id: 5, match_status: 'matched' }));
    render(
      <TransactionList
        slug="finestar"
        origin="https://x"
        token="t"
        basePath="/t/finestar/bankarstvo/uskladivanje"
        reconcileMode
      />,
    );
    await waitFor(() => expect(screen.getByText('Uplata')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Poveži transakciju 5' }));
    await waitFor(() => screen.getByRole('button', { name: 'Zatvori ulazni' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zatvori ulazni' }));
    await waitFor(() => {
      expect(reconcileOpenItem).toHaveBeenCalled();
    });
    expect(
      screen.getByRole('link', { name: 'Povratak na dokument: 26210-H120-5154' }),
    ).toHaveAttribute('href', '/t/finestar/dokumenti/ulazni/30');
    expect(replace).toHaveBeenCalledWith('/t/finestar/bankarstvo/uskladivanje?match_status=unmatched');
  });
});
