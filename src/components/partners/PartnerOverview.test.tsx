import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PartnerDto } from '@/lib/partners';

const patchPartner = vi.fn();
const fetchPartnerFinancialSummary = vi.fn();

vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    patchPartner: (...args: unknown[]) => patchPartner(...args),
    fetchPartnerFinancialSummary: (...args: unknown[]) => fetchPartnerFinancialSummary(...args),
  };
});

import { PartnerApiError } from '@/lib/partners';
import { PartnerOverview } from './PartnerOverview';

function samplePartner(overrides: Partial<PartnerDto> = {}): PartnerDto {
  return {
    id: 17,
    partner_code: '00017',
    name: 'Fine Partner',
    short_name: '',
    partner_type: 'customer',
    status: 'active',
    jurisdiction: 'HR',
    country_code: 'HR',
    tax_number: '10000000000',
    vat_number: '',
    registration_number: '',
    address: 'Ulica 1',
    city: 'Zagreb',
    postal_code: '10000',
    country: 'Hrvatska',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    payment_terms: 30,
    credit_limit: '0.00',
    discount_percentage: '0.00',
    notes: '',
    internal_notes: '',
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

describe('PartnerOverview', () => {
  const onSaved = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    patchPartner.mockReset();
    onSaved.mockClear();
    fetchPartnerFinancialSummary.mockResolvedValue({
      as_of_date: '2026-08-20',
      currency: 'EUR',
      receivables_open: '0.00',
      payables_open: '0.00',
      receivables_overdue: '0.00',
      payables_overdue: '0.00',
      net_balance: '0.00',
      partner_id: 17,
    });
  });

  it('states who owes whom from net_balance', async () => {
    fetchPartnerFinancialSummary.mockResolvedValue({
      as_of_date: '2026-08-21',
      currency: 'EUR',
      receivables_open: '0.00',
      payables_open: '9900.00',
      receivables_overdue: '0.00',
      payables_overdue: '0.00',
      net_balance: '-9900.00',
      partner_id: 24,
    });
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="viewer"
        partner={samplePartner({ id: 24, name: 'Ante Vrcan' })}
        onSaved={onSaved}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(/Dugujemo partneru 9900\.00 EUR/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/stanje na dan 2026-08-21/)).toBeInTheDocument();
    expect(screen.queryByText(/Pozitivan saldo/)).toBeNull();
  });

  it('hides edit/save controls for viewer', async () => {
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="viewer"
        partner={samplePartner()}
        onSaved={onSaved}
      />,
    );
    await waitFor(() => expect(screen.getByText('Fine Partner')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Spremi promjene' })).toBeNull();
    expect(screen.queryByLabelText('Naziv')).toBeNull();
  });

  it('shows edit form for accountant', async () => {
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="accountant"
        partner={samplePartner()}
        onSaved={onSaved}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Spremi promjene' })).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Fine Partner')).toBeInTheDocument();
  });

  it('PATCHes only dirty fields', async () => {
    patchPartner.mockResolvedValue(samplePartner({ address: 'Nova 2' }));
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="owner"
        partner={samplePartner()}
        onSaved={onSaved}
      />,
    );
    await waitFor(() => expect(screen.getByDisplayValue('Ulica 1')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Adresa'), { target: { value: 'Nova 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi promjene' }));
    await waitFor(() => expect(patchPartner).toHaveBeenCalled());
    expect(patchPartner.mock.calls[0][3]).toEqual({ address: 'Nova 2' });
    expect(onSaved).toHaveBeenCalled();
  });

  it('maps 409 tax conflict onto tax_number field', async () => {
    patchPartner.mockRejectedValue(
      new PartnerApiError('conflict', 409, {
        code: 'partner_tax_number_conflict',
        field: 'tax_number',
      }),
    );
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="owner"
        partner={samplePartner()}
        onSaved={onSaved}
      />,
    );
    await waitFor(() => expect(screen.getByDisplayValue('10000000000')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('OIB'), { target: { value: '20000000009' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi promjene' }));
    await waitFor(() =>
      expect(screen.getByText('Partner s ovim poreznim brojem već postoji.')).toBeInTheDocument(),
    );
  });

  it('does not clear tax/vat when country_code changes', async () => {
    render(
      <PartnerOverview
        origin="https://api.test"
        token="t"
        role="owner"
        partner={samplePartner({ tax_number: '10000000000', vat_number: 'HR10000000000' })}
        onSaved={onSaved}
      />,
    );
    await waitFor(() => expect(screen.getByDisplayValue('10000000000')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Država'), { target: { value: 'DE' } });
    expect(screen.getByDisplayValue('10000000000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('HR10000000000')).toBeInTheDocument();
    expect(screen.getByLabelText('Porezni broj')).toBeInTheDocument();
    expect(screen.getByLabelText('VAT ID')).toBeInTheDocument();
  });
});
