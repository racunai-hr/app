import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPartnerStatement = vi.fn();
const replace = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(''),
}));

vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    fetchPartnerStatement: (...args: unknown[]) => fetchPartnerStatement(...args),
  };
});

import { PartnerLedgerPanel } from './PartnerLedgerPanel';

const statementPayload = {
  partner_id: 3,
  year: 2026,
  available_years: [2025, 2026],
  currency: 'EUR',
  direction: 'all',
  opening_balance: { debit: '0.00', credit: '1000.00', balance: '-1000.00' },
  rows: [
    {
      kind: 'opening_balance',
      date: '2026-01-01',
      label: 'Početno stanje 2026',
      debit: '0.00',
      credit: '1000.00',
      balance: '-1000.00',
    },
    {
      kind: 'obligation',
      date: '2026-02-15',
      direction: 'payable',
      source_type: 'expense',
      source_id: 42,
      source_label: 'TRO-0042',
      document_type_label: 'Ulazni trošak',
      debit: '0.00',
      credit: '500.00',
      balance: '-1500.00',
      journal_entry_id: 100,
    },
    {
      kind: 'allocation',
      date: '2026-03-01',
      direction: 'payable',
      closing_kind: 'bank',
      source_type: 'expense',
      source_id: 42,
      source_label: 'TRO-0042',
      debit: '500.00',
      credit: '0.00',
      balance: '-1000.00',
      journal_entry_id: 110,
    },
  ],
  closing_balance: { debit: '500.00', credit: '1500.00', balance: '-1000.00' },
};

describe('PartnerLedgerPanel', () => {
  beforeEach(() => {
    fetchPartnerStatement.mockReset();
    replace.mockReset();
  });

  it('renders opening row and AP running balances', async () => {
    fetchPartnerStatement.mockResolvedValue(statementPayload);
    render(
      <PartnerLedgerPanel
        slug="finestar"
        origin="https://x"
        token="t"
        partnerId={3}
        partnerType="both"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Početno stanje 2026')).toBeInTheDocument();
    });
    expect(fetchPartnerStatement).toHaveBeenCalledWith('https://x', 't', 3, {
      year: undefined,
      direction: 'all',
    });
    const cells = screen.getAllByRole('cell');
    expect(cells.some((cell) => cell.textContent?.includes('1.500,00'))).toBe(true);
    expect(cells.some((cell) => cell.textContent?.includes('1.000,00'))).toBe(true);
    expect(screen.getAllByRole('link', { name: 'TRO-0042' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'TRO-0042' })[0]).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti/ulazni/42',
    );
    expect(screen.getByText('Bankovno plaćanje')).toBeInTheDocument();
  });

  it('switches direction tab via router', async () => {
    fetchPartnerStatement.mockResolvedValue(statementPayload);
    render(
      <PartnerLedgerPanel
        slug="finestar"
        origin="https://x"
        token="t"
        partnerId={3}
        partnerType="both"
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Potraživanja' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Potraživanja' }));
    expect(replace).toHaveBeenCalledWith('/t/finestar/partneri/3/saldakonto?direction=receivable');
  });
});
