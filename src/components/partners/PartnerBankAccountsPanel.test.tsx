import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PartnerBankAccount } from '@/lib/partners';

const fetchPartnerBankAccounts = vi.fn();
const patchPartnerBankAccount = vi.fn();
const createPartnerBankAccount = vi.fn();
const deletePartnerBankAccount = vi.fn();

vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    fetchPartnerBankAccounts: (...args: unknown[]) => fetchPartnerBankAccounts(...args),
    patchPartnerBankAccount: (...args: unknown[]) => patchPartnerBankAccount(...args),
    createPartnerBankAccount: (...args: unknown[]) => createPartnerBankAccount(...args),
    deletePartnerBankAccount: (...args: unknown[]) => deletePartnerBankAccount(...args),
  };
});

import { PartnerApiError } from '@/lib/partners';
import { PartnerBankAccountsPanel } from './PartnerBankAccountsPanel';

function account(overrides: Partial<PartnerBankAccount> = {}): PartnerBankAccount {
  return {
    id: 5,
    partner_id: 17,
    bank_name: 'OTP',
    bic: 'OTPHRH2X',
    iban: 'HR1212345678901234567',
    currency: 'EUR',
    is_primary: true,
    is_active: true,
    created_at: null,
    ...overrides,
  };
}

describe('PartnerBankAccountsPanel', () => {
  beforeEach(() => {
    fetchPartnerBankAccounts.mockReset();
    patchPartnerBankAccount.mockReset();
    createPartnerBankAccount.mockReset();
    deletePartnerBankAccount.mockReset();
    fetchPartnerBankAccounts.mockResolvedValue({
      as_of: '2026-08-20T00:00:00Z',
      count: 1,
      results: [account()],
    });
  });

  it('PATCHes dirty bank fields and reloads', async () => {
    patchPartnerBankAccount.mockResolvedValue(account({ bank_name: 'PBZ' }));
    render(
      <PartnerBankAccountsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));
    fireEvent.change(screen.getByLabelText('Banka'), { target: { value: 'PBZ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(patchPartnerBankAccount).toHaveBeenCalled());
    expect(patchPartnerBankAccount.mock.calls[0][4]).toEqual({ bank_name: 'PBZ' });
  });

  it('shows partner_iban_conflict on the IBAN field', async () => {
    patchPartnerBankAccount.mockRejectedValue(
      new PartnerApiError('conflict', 409, { code: 'partner_iban_conflict', field: 'iban' }),
    );
    render(
      <PartnerBankAccountsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));
    fireEvent.change(screen.getByLabelText('IBAN'), {
      target: { value: 'HR9876543210987654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() =>
      expect(screen.getByText('IBAN već postoji za ovog partnera.')).toBeInTheDocument(),
    );
    expect(screen.getByRole('textbox', { name: 'IBAN' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('normalizes IBAN on create the same way as edit', async () => {
    createPartnerBankAccount.mockResolvedValue(account({ id: 9 }));
    render(
      <PartnerBankAccountsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Dodaj račun' })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText('Banka'), { target: { value: 'PBZ' } });
    // create form IBAN — there may be only one IBAN when not editing
    const ibanInputs = screen.getAllByLabelText('IBAN');
    fireEvent.change(ibanInputs[ibanInputs.length - 1], {
      target: { value: 'hr12 1234 5678 9012 3456 7' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj račun' }));
    await waitFor(() => expect(createPartnerBankAccount).toHaveBeenCalled());
    expect(createPartnerBankAccount.mock.calls[0][3].iban).toBe('HR1212345678901234567');
  });
});
