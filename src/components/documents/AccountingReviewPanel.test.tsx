import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AccountingReviewPanel } from './AccountingReviewPanel';
import type { AccountingReview } from '@/lib/accountingReview';

function review(overrides: Partial<AccountingReview> = {}): AccountingReview {
  return {
    status: 'needs_information',
    purchase_nature: 'fuel',
    posting_profile: null,
    profile_label: '',
    vehicle: null,
    decision_source: 'vehicle',
    reason: 'Nedostaje vozilo',
    explanation: 'Nedostaje vozilo',
    questions: [],
    preview: null,
    line_accounts: [],
    document_date: '2026-10-01',
    ...overrides,
  };
}

describe('AccountingReviewPanel', () => {
  it('renders each question type, the preview and confirm', () => {
    const onAnswers = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AccountingReviewPanel
        currency="EUR"
        answers={{}}
        onAnswers={onAnswers}
        onConfirm={onConfirm}
        review={review({
          status: 'needs_confirmation',
          profile_label: 'Zavisni trošak nabave robe',
          posting_profile: 'goods_inward_cost',
          vehicle: {
            id: 3,
            name: 'Golf',
            vin: '',
            registration_plate: 'ZG1234AB',
            accounting_role: 'inventory_for_resale',
          },
          questions: [
            {
              key: 'vehicle_id',
              type: 'vehicle_select',
              label: 'Za koje vozilo je ovaj trošak?',
              required: true,
              options: [{ value: '3', label: 'Golf' }],
            },
            {
              key: 'vehicle_accounting_role',
              type: 'single_choice',
              label: 'Namjena vozila',
              required: true,
              options: [{ value: 'company_passenger', label: 'Službeno osobno vozilo' }],
            },
            {
              key: 'remember_vehicle_role',
              type: 'boolean',
              label: 'Zapamti namjenu za vozilo',
              required: false,
              options: [],
            },
            {
              key: 'note',
              type: 'text',
              label: 'Napomena',
              required: false,
              options: [],
            },
          ],
          preview: [
            { account_code: '6514', account_name: 'Dovoz', debit: '40.00', credit: '0.00' },
            { account_code: '2201', account_name: 'Dobavljači', debit: '0.00', credit: '40.00' },
          ],
        })}
      />,
    );

    expect(screen.getByText('fuel')).toBeTruthy();
    expect(screen.getByText(/01\.10\.2026/)).toBeTruthy();
    expect(screen.getByLabelText('Za koje vozilo je ovaj trošak?')).toBeTruthy();
    expect(screen.getByLabelText('Namjena vozila')).toBeTruthy();
    expect(screen.getByLabelText('Zapamti namjenu za vozilo')).toBeTruthy();
    expect(screen.getByLabelText('Napomena')).toBeTruthy();
    expect(screen.getByText('6514')).toBeTruthy();
    expect(screen.getAllByText(/40,00/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Napomena'), { target: { value: 'bilješka' } });
    expect(onAnswers).toHaveBeenCalledWith({ note: 'bilješka' });

    fireEvent.click(screen.getByRole('button', { name: 'Potvrdi' }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Promijeni' }));
    expect(screen.getByLabelText('Tretman')).toBeTruthy();
  });

  it('shows documentary foreign VAT and does not preselect a treatment', () => {
    render(
      <AccountingReviewPanel
        currency="DKK"
        answers={{}}
        onAnswers={vi.fn()}
        review={review({
          foreign_vat: {
            country: 'DK',
            amount: '146.22',
            net_amount: '584.89',
            gross_amount: '731.11',
            currency: 'DKK',
            treatment: '',
            fx_rate: '',
            fx_rate_source: '',
            fx_rate_date: '',
          },
          questions: [
            {
              key: 'foreign_vat_treatment',
              type: 'single_choice',
              label: 'Danski PDV: 146,22 DKK. Kako želite tretirati strani PDV?',
              required: true,
              options: [
                { value: 'expense', label: 'Uključi u trošak nabave' },
                { value: 'refund_receivable', label: 'Evidentiraj kao potraživanje za EU VAT Refund' },
              ],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText(/Strani PDV:/).parentElement?.textContent).toContain('146,22 DKK');
    const choice = screen.getByLabelText(/Kako želite tretirati strani PDV/) as HTMLSelectElement;
    expect(choice.value).toBe('');
  });
});
