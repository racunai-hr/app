import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloseDraftDialog } from './CloseDraftDialog';

vi.mock('@/lib/auth', () => ({ getAccessToken: () => 'token' }));

vi.mock('@/lib/accountingReview', async () => {
  const actual = await vi.importActual<typeof import('@/lib/accountingReview')>('@/lib/accountingReview');
  return {
    ...actual,
    fetchExpenseAccountingReview: vi.fn(async () => ({
      status: 'needs_confirmation',
      purchase_nature: 'service',
      posting_profile: 'opex',
      profile_label: 'Operativni trošak',
      vehicle: null,
      decision_source: 'rule',
      reason: '',
      explanation: 'Operativni trošak.',
      questions: [],
      preview: null,
      line_accounts: [],
      document_date: '',
    })),
  };
});

vi.mock('@/lib/expenseClose', () => ({
  fetchCloseDraftPreview: vi.fn(),
  fetchPrepaymentCandidates: vi.fn(),
  closeDraftFromBank: vi.fn(),
  postSupplierPrepayment: vi.fn(),
  applyExpensePrepayments: vi.fn(),
}));

import {
  applyExpensePrepayments,
  fetchCloseDraftPreview,
  fetchPrepaymentCandidates,
  postSupplierPrepayment,
} from '@/lib/expenseClose';

const preview = {
  remembered: true,
  lines: [],
  payments: [
    {
      id: 87,
      transaction_date: '2026-09-01',
      amount: '132.72',
      currency: 'EUR',
      counterparty_name: 'FINA',
      description: 'Naknada',
      reference: 'HR00',
      match_score: 1,
      match_reasons: [],
      recommended: true,
    },
  ],
};

const candidates = {
  supplier_id: 9,
  currency: 'EUR',
  ubl_prepaid_amount: '132.72',
  ubl_payable_amount: '0.00',
  purchase_natures: [{ value: 'service', label: 'Usluga' }],
  vat_treatments: [{ value: 'no_vat', label: 'Bez PDV-a' }],
  prepayments: [],
};

describe('CloseDraftDialog prepayment section', () => {
  beforeEach(() => {
    vi.mocked(fetchCloseDraftPreview).mockResolvedValue(preview);
    vi.mocked(fetchPrepaymentCandidates).mockResolvedValue(candidates);
    vi.mocked(postSupplierPrepayment).mockResolvedValue({ id: 4, original_amount: '132.72' });
    vi.mocked(applyExpensePrepayments).mockResolvedValue({ status: 'paid', subledger_status: 'closed' });
  });

  it('offers a prepayment close without removing the bank settlement path', async () => {
    render(
      <CloseDraftDialog
        expenseId={363}
        title="198018-3-32-0926"
        origin="http://localhost:3000"
        onClose={() => undefined}
        onClosed={() => undefined}
      />,
    );
    expect(await screen.findByText('Zatvori predujmom')).toBeInTheDocument();
    expect(screen.getByText('Zatvori uplatom obveze')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Zatvori predujmom'));
    fireEvent.click(screen.getByRole('button', { name: 'Knjiži i zatvori predujmom' }));
    await waitFor(() => {
      expect(postSupplierPrepayment).toHaveBeenCalledWith(
        'http://localhost:3000',
        'token',
        87,
        expect.stringContaining('-prepayment'),
        { partner_id: 9, purchase_nature: 'service', vat_treatment: 'no_vat' },
      );
    });
    expect(applyExpensePrepayments).toHaveBeenCalled();
  });
});
