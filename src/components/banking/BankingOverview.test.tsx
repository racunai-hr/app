import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchBankingOverview = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchBankingOverview: (...args: unknown[]) => fetchBankingOverview(...args),
  };
});

vi.mock('./StatementImport', () => ({
  StatementImport: ({ onImported }: { onImported: () => void }) => (
    <button type="button" onClick={onImported}>
      fake-import
    </button>
  ),
}));

import { BankingOverview } from './BankingOverview';

function overviewPayload(isStale: boolean) {
  return {
    as_of: '2026-08-19T10:00:00Z',
    accounts: [
      {
        id: 1,
        account_name: 'Glavni',
        bank_name: 'PBZ',
        account_number: '1',
        iban: 'HR1210010051863000160',
        currency: 'EUR',
        status: 'active',
        is_active: true,
        connection: null,
        balances: [
          {
            balance_type: 'booked',
            amount: '1000.00',
            currency: 'EUR',
            as_of: '2026-08-18T12:00:00Z',
            source: 'statement',
            is_stale: isStale,
          },
        ],
      },
    ],
    account_count_by_currency: { EUR: 1 },
    unmatched_transaction_count: 3,
    suggested_transaction_count: 1,
    statement_count: 2,
  };
}

describe('BankingOverview', () => {
  beforeEach(() => {
    fetchBankingOverview.mockReset();
    fetchBankingOverview.mockResolvedValue(overviewPayload(false));
  });

  it('shows KPI, full IBAN and balance provenance without write actions', async () => {
    render(<BankingOverview origin="https://finestar-stage.racunai.hr" token="token" role="viewer" />);
    await waitFor(() => {
      expect(screen.getByText('Neusklađene transakcije')).toBeInTheDocument();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('HR1210010051863000160')).toBeInTheDocument();
    expect(screen.getByText(/izvor Izvod/)).toBeInTheDocument();
    expect(screen.getByText('Svježe')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /uvoz|sync|match|usklađi/i })).toBeNull();
  });

  it('opens the CAMT import dialog from a stale badge for a write role', async () => {
    fetchBankingOverview.mockResolvedValue(overviewPayload(true));
    render(<BankingOverview origin="https://x" token="t" role="accountant" />);
    await waitFor(() => expect(screen.getByText('Zastarjelo')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ }));
    expect(screen.getByRole('dialog', { name: 'Uvezi novi XML izvadak (camt.053)' })).toBeInTheDocument();
  });

  it('closes the dialog and refetches after a successful import', async () => {
    fetchBankingOverview.mockResolvedValue(overviewPayload(true));
    render(<BankingOverview origin="https://x" token="t" role="owner" />);
    await waitFor(() => expect(screen.getByText('Zastarjelo')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'fake-import' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(fetchBankingOverview).toHaveBeenCalledTimes(2));
  });
});
