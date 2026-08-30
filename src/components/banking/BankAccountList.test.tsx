import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const searchParams = new URLSearchParams();
const fetchBankAccounts = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/lib/banking', async () => {
  const actual = await vi.importActual<typeof import('@/lib/banking')>('@/lib/banking');
  return {
    ...actual,
    fetchBankAccounts: (...args: unknown[]) => fetchBankAccounts(...args),
  };
});

vi.mock('./StatementImport', () => ({
  StatementImport: ({ onImported }: { onImported: () => void }) => (
    <button type="button" onClick={onImported}>
      fake-import
    </button>
  ),
}));

import { BankAccountList } from './BankAccountList';

function accountsPage(isStale: boolean) {
  return {
    as_of: '2026-08-19T10:00:00Z',
    count: 1,
    page: 1,
    page_size: 20,
    results: [
      {
        id: 1,
        account_name: 'Fine Star EUR — OTP',
        bank_name: 'OTP banka',
        account_number: '1',
        iban: 'HR6124070001100204771',
        currency: 'EUR',
        status: 'active',
        is_active: true,
        connection: null,
        balances: [
          {
            balance_type: 'statement-closing',
            amount: '5906.62',
            currency: 'EUR',
            as_of: '2026-08-18T00:00:00+02:00',
            source: 'statement',
            is_stale: isStale,
          },
        ],
      },
    ],
  };
}

describe('BankAccountList', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchBankAccounts.mockReset();
    fetchBankAccounts.mockResolvedValue(accountsPage(true));
  });

  it('opens the CAMT import dialog from a stale badge for a write role', async () => {
    render(<BankAccountList slug="finestar" origin="https://x" token="t" role="accountant" />);
    await waitFor(() => expect(screen.getByText('Zastarjelo')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ }));
    expect(screen.getByRole('dialog', { name: 'Uvezi novi XML izvadak (camt.053)' })).toBeInTheDocument();
  });

  it('closes the dialog and refetches after a successful import', async () => {
    render(<BankAccountList slug="finestar" origin="https://x" token="t" role="owner" />);
    await waitFor(() => expect(screen.getByText('Zastarjelo')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ }));
    fireEvent.click(screen.getByRole('button', { name: 'fake-import' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(fetchBankAccounts).toHaveBeenCalledTimes(2));
  });

  it('keeps stale as a span for viewer', async () => {
    render(<BankAccountList slug="finestar" origin="https://x" token="t" role="viewer" />);
    await waitFor(() => expect(screen.getByText('Zastarjelo')).toBeInTheDocument());
    expect(screen.getByText('Zastarjelo').tagName).toBe('SPAN');
    expect(screen.queryByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ })).toBeNull();
  });
});
