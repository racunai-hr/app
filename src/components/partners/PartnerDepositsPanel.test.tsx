import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchDeposits = vi.fn();

vi.mock('@/lib/finance', async () => {
  const actual = await vi.importActual<typeof import('@/lib/finance')>('@/lib/finance');
  return {
    ...actual,
    fetchDeposits: (...args: unknown[]) => fetchDeposits(...args),
    canWriteFinance: () => true,
  };
});

import { PartnerDepositsPanel } from './PartnerDepositsPanel';

describe('PartnerDepositsPanel', () => {
  beforeEach(() => {
    fetchDeposits.mockReset();
    fetchDeposits.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1,
          number: 'KAU-202608-0001',
          partner_id: 3,
          partner_name: 'SaM',
          direction: 'given',
          amount: '5000.00',
          currency: 'EUR',
          deposit_date: '2026-07-30',
          workflow_status: 'open',
          operational_status: 'open',
          open_amount: '5000.00',
          reference: 'SaM Kaution',
          notes: '',
          return_date: null,
          return_bank_account_id: null,
          given_journal_entry_id: 1,
          return_journal_entry_id: null,
          reverse_journal_entry_id: null,
          created_at: null,
        },
      ],
    });
  });

  it('shows deposits as read-only even when Finance write role is mocked true', async () => {
    render(
      <PartnerDepositsPanel
        origin="https://finestar-stage.racunai.hr"
        token="token"
        partnerId={3}
        role="owner"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('KAU-202608-0001')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Pregled stanja na partneru — ne mjesto izvršenja workflowa/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nova kaucija|Knjiži|Povrat|Storno|Otkaži/i })).toBeNull();
    expect(screen.queryByText('Akcije')).toBeNull();
    expect(screen.queryByLabelText(/Iznos/i)).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(fetchDeposits).toHaveBeenCalled();
  });
});
