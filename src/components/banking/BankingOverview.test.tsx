import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchBankingOverview: vi.fn().mockResolvedValue({
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
              is_stale: false,
            },
          ],
        },
      ],
      account_count_by_currency: { EUR: 1 },
      unmatched_transaction_count: 3,
      suggested_transaction_count: 1,
      statement_count: 2,
    }),
  };
});

import { BankingOverview } from './BankingOverview';

describe('BankingOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows KPI, masked IBAN and balance provenance without write actions', async () => {
    render(<BankingOverview origin="https://finestar-stage.racunai.hr" token="token" />);
    await waitFor(() => {
      expect(screen.getByText('Neusklađene transakcije')).toBeInTheDocument();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('HR12*************0160')).toBeInTheDocument();
    expect(screen.getByText(/izvor Izvod/)).toBeInTheDocument();
    expect(screen.getByText('Svježe')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /uvoz|sync|match|usklađi/i })).toBeNull();
  });
});
