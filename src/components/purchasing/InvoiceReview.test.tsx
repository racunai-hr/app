import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { samplePostingPreview } from '@/test/expensePostingFixtures';

const session = {
  tenant: { slug: 'finestar', name: 'FineStar', role: 'owner' },
  origin: 'https://finestar-stage.racunai.hr',
  token: 'token',
  role: 'owner',
};

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('./usePurchasingSession', () => ({
  usePurchasingSession: () => ({ session, loading: false, error: '' }),
}));

const fetchInvoiceImport = vi.fn();
const confirmInvoiceImport = vi.fn();
const discardInvoiceImport = vi.fn();
const applyPartnerUpdates = vi.fn();
const createPartnerFromImport = vi.fn();

vi.mock('@/lib/purchasing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/purchasing')>('@/lib/purchasing');
  return {
    ...actual,
    fetchInvoiceImport: (...args: unknown[]) => fetchInvoiceImport(...args),
    confirmInvoiceImport: (...args: unknown[]) => confirmInvoiceImport(...args),
    discardInvoiceImport: (...args: unknown[]) => discardInvoiceImport(...args),
    applyPartnerUpdates: (...args: unknown[]) => applyPartnerUpdates(...args),
    createPartnerFromImport: (...args: unknown[]) => createPartnerFromImport(...args),
  };
});

const fetchExpenseCategories = vi.fn();
const fetchChartOfAccounts = vi.fn();
const fetchExpensePostingPreview = vi.fn();

vi.mock('@/lib/expensePosting', async () => {
  const actual = await vi.importActual<typeof import('@/lib/expensePosting')>('@/lib/expensePosting');
  return {
    ...actual,
    fetchExpenseCategories: (...args: unknown[]) => fetchExpenseCategories(...args),
    fetchChartOfAccounts: (...args: unknown[]) => fetchChartOfAccounts(...args),
    fetchExpensePostingPreview: (...args: unknown[]) => fetchExpensePostingPreview(...args),
  };
});

vi.mock('@/lib/purchasingImport', () => ({
  pollInvoiceImport: vi.fn(),
}));

const fetchCostCenters = vi.fn();

vi.mock('@/lib/costCenters', async () => {
  const actual = await vi.importActual<typeof import('@/lib/costCenters')>('@/lib/costCenters');
  return {
    ...actual,
    fetchCostCenters: (...args: unknown[]) => fetchCostCenters(...args),
  };
});

import { InvoiceReview } from './InvoiceReview';

function extractedRun(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    status: 'extracted',
    original_filename: 'racun.pdf',
    content_type: 'application/pdf',
    file_sha256: 'abc',
    file_size: 12,
    ocr_provider: 'fake',
    ocr_model: '',
    ocr_schema_version: '',
    ocr_extracted_at: null,
    extracted: {
      supplier: {
        name: 'INA d.d.',
        oib: '27759560625',
        vat_number: '',
        address: 'A',
        city: 'Zagreb',
        postal_code: '10000',
        country: 'Hrvatska',
        country_code: 'HR',
        iban: 'HR1210010051863000160',
      },
      invoice_number: '1/2026',
      issue_date: '2026-08-18',
      due_date: '2026-09-02',
      currency: 'EUR',
      net_amount: '100.00',
      tax_amount: '25.00',
      total_amount: '125.00',
      iban: 'HR1210010051863000160',
      vat_breakdown: [],
      line_items: [],
    },
    warnings: [],
    partner: {
      match: 'exact_oib',
      partner_id: 4,
      candidate_id: null,
      name: 'INA d.d.',
      tax_number: '27759560625',
      diff: [],
    },
    duplicate: { kind: 'none', expense_id: null, label: '', detail: {} },
    confirmed_expense_id: null,
    last_error: '',
    created_at: null,
    started_at: null,
    finished_at: null,
    ...overrides,
  };
}

describe('InvoiceReview', () => {
  beforeEach(() => {
    fetchInvoiceImport.mockReset();
    confirmInvoiceImport.mockReset();
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    fetchExpensePostingPreview.mockReset();
    fetchInvoiceImport.mockResolvedValue(extractedRun());
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 2,
          name: 'Telekomunikacije',
          is_active: true,
          default_account: { id: 11, code: '4100', name: 'Najam', active: true },
        },
      ],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [{ id: 11, code: '4100', name: 'Najam', active: true }],
    });
    fetchCostCenters.mockReset();
    fetchCostCenters.mockResolvedValue({
      count: 1,
      results: [{ id: 6, code: '110', name: 'Kuhinja', kind: 'location', notes: '', parent: null }],
    });
  });

  it('keeps posting inputs usable when the cost center codebook fails', async () => {
    fetchCostCenters.mockRejectedValue(new Error('cost centers down'));
    render(<InvoiceReview slug="finestar" importId={9} />);
    const category = await screen.findByLabelText('Vrsta troška');
    expect(category).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Telekomunikacije' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: '4100 · Najam' })).toBeInTheDocument();
    expect(screen.queryByText('cost centers down')).not.toBeInTheDocument();
    const costCenter = screen.getByLabelText('Mjesto troška');
    expect(costCenter).toBeInTheDocument();
    expect(costCenter).toHaveValue('');
  });

  it('sends selected category on confirm and does not invent posting lines', async () => {
    confirmInvoiceImport.mockResolvedValue(
      extractedRun({ status: 'confirmed', confirmed_expense_id: 77 }),
    );
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        category: { id: 2, name: 'Telekomunikacije' },
        lines: [
          {
            amount_field: 'net_amount',
            description: 'Rashod',
            amount: '100.00',
            debit: { id: 11, code: '4100', name: 'Najam', active: true },
            credit: { id: 20, code: '2200', name: 'Dobavljači', active: true },
            debit_cost_center: null,
            credit_cost_center: null,
          },
        ],
      }),
    );
    render(<InvoiceReview slug="finestar" importId={9} />);
    const category = await screen.findByLabelText('Vrsta troška');
    fireEvent.change(category, { target: { value: '2' } });
    fireEvent.click(screen.getByLabelText('Zapamti vrstu troška za ovog partnera'));
    fireEvent.click(screen.getByRole('button', { name: 'Potvrdi ulazni račun' }));
    await waitFor(() => {
      expect(confirmInvoiceImport).toHaveBeenCalledWith(
        session.origin,
        'token',
        9,
        {
          duplicate_override: false,
          category_id: 2,
          expense_account_id: null,
          cost_center_id: null,
          remember_category_for_partner: true,
        },
      );
    });
    expect(await screen.findByText('4100 · Najam')).toBeInTheDocument();
    expect(fetchExpensePostingPreview).toHaveBeenCalledWith(
      session.origin,
      'token',
      77,
      expect.anything(),
    );
  });
});
