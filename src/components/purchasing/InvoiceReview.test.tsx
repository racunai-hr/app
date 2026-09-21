import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCOUNT_PICKER_DEBOUNCE_MS } from '@/components/finance/AccountPicker';

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
const retryInvoiceImport = vi.fn();
const applySupplier = vi.fn();

vi.mock('@/lib/purchasing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/purchasing')>('@/lib/purchasing');
  return {
    ...actual,
    fetchInvoiceImport: (...args: unknown[]) => fetchInvoiceImport(...args),
    confirmInvoiceImport: (...args: unknown[]) => confirmInvoiceImport(...args),
    discardInvoiceImport: (...args: unknown[]) => discardInvoiceImport(...args),
    applyPartnerUpdates: (...args: unknown[]) => applyPartnerUpdates(...args),
    createPartnerFromImport: (...args: unknown[]) => createPartnerFromImport(...args),
    retryInvoiceImport: (...args: unknown[]) => retryInvoiceImport(...args),
    applySupplier: (...args: unknown[]) => applySupplier(...args),
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

const pollInvoiceImport = vi.fn();

vi.mock('@/lib/purchasingImport', () => ({
  pollInvoiceImport: (...args: unknown[]) => pollInvoiceImport(...args),
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

function emptyParty() {
  return {
    name: '',
    oib: '',
    vat_number: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    country_code: '',
    iban: '',
  };
}

function extractedRun(overrides: Record<string, unknown> = {}) {
  const supplier = {
    name: 'INA d.d.',
    oib: '27759560625',
    vat_number: '',
    address: 'A',
    city: 'Zagreb',
    postal_code: '10000',
    country: 'Hrvatska',
    country_code: 'HR',
    iban: 'HR1210010051863000160',
  };
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
      supplier,
      issuer: supplier,
      buyer: emptyParty(),
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
    direction: {
      code: 'ok',
      supplier_source: 'issuer',
      override_required: false,
      unresolved: false,
      party_candidates: [
        { role: 'issuer', ...supplier, is_own_company: false, suspected_own_company: false, blank: false },
        {
          role: 'buyer',
          ...emptyParty(),
          is_own_company: false,
          suspected_own_company: false,
          blank: true,
        },
      ],
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

const ACCOUNT_4198 = {
  id: 38413,
  code: '4198',
  name: 'Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
  active: true,
};

async function searchAndSelectAccount(label: string | RegExp) {
  const input = screen.getByRole('combobox', { name: 'Konto rashoda' });
  fireEvent.change(input, { target: { value: '4198' } });
  await waitFor(
    () => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    },
    { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 500 },
  );
  fireEvent.click(screen.getByRole('option', { name: label }));
}

describe('InvoiceReview', () => {
  beforeEach(() => {
    fetchInvoiceImport.mockReset();
    confirmInvoiceImport.mockReset();
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    fetchExpensePostingPreview.mockReset();
    fetchInvoiceImport.mockResolvedValue(extractedRun());
    retryInvoiceImport.mockReset();
    applySupplier.mockReset();
    pollInvoiceImport.mockReset();
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
    expect(screen.getByRole('combobox', { name: 'Konto rashoda' })).toHaveAttribute(
      'placeholder',
      'Zadano konto vrste',
    );
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();
    expect(screen.queryByText('cost centers down')).not.toBeInTheDocument();
    const costCenter = screen.getByLabelText('Mjesto troška');
    expect(costCenter).toBeInTheDocument();
    expect(costCenter).toHaveValue('');
  });

  it('lets the user pick posting accounts on allocated OCR lines before confirm', async () => {
    fetchInvoiceImport.mockResolvedValue(
      extractedRun({
        extracted: {
          ...extractedRun().extracted,
          net_amount: '104.00',
          tax_amount: '26.00',
          total_amount: '130.00',
          line_items: [
            { description: 'Uplata iznosa - ENC za kat. I', quantity: '1', unit_price: '127.78', amount: '100.00' },
            { description: 'UREDAJ ENC - KOMPLET Prepaid, za kat. I', quantity: '1', unit_price: '15.00', amount: '15.00' },
            { description: 'UREDAJ ENC - KOMPLET Prepaid, za kat. I', quantity: '1', unit_price: '15.00', amount: '15.00' },
          ],
          allocated_lines: [
            {
              position: 1,
              description: 'Uplata iznosa - ENC za kat. I',
              net_amount: '80.00',
              vat_amount: '20.00',
              gross_amount: '100.00',
            },
            {
              position: 2,
              description: 'UREDAJ ENC - KOMPLET Prepaid, za kat. I',
              net_amount: '12.00',
              vat_amount: '3.00',
              gross_amount: '15.00',
            },
            {
              position: 3,
              description: 'UREDAJ ENC - KOMPLET Prepaid, za kat. I',
              net_amount: '12.00',
              vat_amount: '3.00',
              gross_amount: '15.00',
            },
          ],
        },
      }),
    );
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1900,
          code: '1900',
          name: 'Unaprijed plaćeni troškovi održavanja',
          active: true,
        },
      ],
    });
    confirmInvoiceImport.mockResolvedValue(
      extractedRun({ status: 'confirmed', confirmed_expense_id: 18 }),
    );
    render(<InvoiceReview slug="finestar" importId={9} />);
    expect(await screen.findByText('Uplata iznosa - ENC za kat. I')).toBeInTheDocument();
    expect(screen.getAllByText('Prepaid / unaprijed plaćeni trošak?').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Konto po stavci birate nakon potvrde/)).not.toBeInTheDocument();
    const picker = screen.getByRole('combobox', { name: 'Konto stavke 1' });
    fireEvent.change(picker, { target: { value: '1900' } });
    await waitFor(
      () => {
        expect(
          screen.getByRole('option', {
            name: '1900 · Unaprijed plaćeni troškovi održavanja',
          }),
        ).toBeInTheDocument();
      },
      { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 500 },
    );
    fireEvent.click(
      screen.getByRole('option', {
        name: '1900 · Unaprijed plaćeni troškovi održavanja',
      }),
    );
    expect(screen.getByText('Sve stavke moraju imati konto, ili nijedna.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Potvrdi ulazni račun' })).toBeDisabled();
  });

  it('sends all-empty line_accounts on confirm when OCR lines have no posting account', async () => {
    fetchInvoiceImport.mockResolvedValue(
      extractedRun({
        extracted: {
          ...extractedRun().extracted,
          line_items: [
            { description: 'ENC nadoplata', quantity: '1', unit_price: '100.00', amount: '100.00' },
            { description: 'ENC uređaj', quantity: '2', unit_price: '15.00', amount: '30.00' },
          ],
          allocated_lines: [
            {
              position: 1,
              description: 'ENC nadoplata',
              net_amount: '80.00',
              vat_amount: '20.00',
              gross_amount: '100.00',
            },
            {
              position: 2,
              description: 'ENC uređaj',
              net_amount: '24.00',
              vat_amount: '6.00',
              gross_amount: '30.00',
            },
          ],
        },
      }),
    );
    confirmInvoiceImport.mockResolvedValue(
      extractedRun({ status: 'confirmed', confirmed_expense_id: 77 }),
    );
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview());
    render(<InvoiceReview slug="finestar" importId={9} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Potvrdi ulazni račun' }));
    await waitFor(() => {
      expect(confirmInvoiceImport).toHaveBeenCalledWith(
        session.origin,
        'token',
        9,
        expect.objectContaining({
          line_accounts: [
            { position: 1, posting_account_id: null },
            { position: 2, posting_account_id: null },
          ],
        }),
      );
    });
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
          direction_override: false,
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

  it('shows a preview account without searching and confirms the selected AccountRef id', async () => {
    fetchInvoiceImport.mockResolvedValue(extractedRun({ confirmed_expense_id: 77, status: 'extracted' }));
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        expense_account: ACCOUNT_4198,
        account_source: 'manual_override',
      }),
    );
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [ACCOUNT_4198],
    });
    confirmInvoiceImport.mockResolvedValue(
      extractedRun({ status: 'confirmed', confirmed_expense_id: 77 }),
    );

    render(<InvoiceReview slug="finestar" importId={9} />);
    const input = await screen.findByRole('combobox', { name: 'Konto rashoda' });
    await waitFor(() => {
      expect(input).toHaveValue(
        '4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
      );
    });
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();

    await searchAndSelectAccount(/4198/);
    expect(fetchChartOfAccounts).toHaveBeenCalledWith(
      session.origin,
      'token',
      '4198',
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Potvrdi ulazni račun' }));
    await waitFor(() => {
      expect(confirmInvoiceImport).toHaveBeenCalledWith(
        session.origin,
        'token',
        9,
        expect.objectContaining({
          expense_account_id: 38413,
        }),
      );
    });
  });

  it('retries OCR from a discarded draft', async () => {
    fetchInvoiceImport.mockResolvedValue(extractedRun({ status: 'discarded' }));
    retryInvoiceImport.mockResolvedValue(extractedRun({ status: 'queued' }));
    pollInvoiceImport.mockResolvedValue({
      outcome: 'done',
      run: extractedRun({ status: 'extracted' }),
    });
    render(<InvoiceReview slug="finestar" importId={9} />);
    expect(await screen.findByText('Nacrt je odbačen.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ponovi OCR' }));
    await waitFor(() => {
      expect(retryInvoiceImport).toHaveBeenCalledWith(session.origin, 'token', 9);
    });
    expect(await screen.findByRole('button', { name: 'Potvrdi ulazni račun' })).toBeInTheDocument();
  });

  it('blocks confirm while document direction is unresolved', async () => {
    const hac = {
      name: 'Hrvatske autoceste d.o.o.',
      oib: '57500462912',
      vat_number: '',
      address: 'A',
      city: 'Zagreb',
      postal_code: '10000',
      country: 'Hrvatska',
      country_code: 'HR',
      iban: '',
    };
    const fineStar = {
      name: 'FINE STAR DOO',
      oib: '36619131370',
      vat_number: '',
      address: 'B',
      city: 'Šibenik',
      postal_code: '22000',
      country: 'Hrvatska',
      country_code: 'HR',
      iban: '',
    };
    fetchInvoiceImport.mockResolvedValue(
      extractedRun({
        extracted: {
          supplier: emptyParty(),
          issuer: fineStar,
          buyer: hac,
          invoice_number: '1432082-608-600',
          issue_date: '2026-09-18',
          due_date: '2026-09-18',
          currency: 'EUR',
          net_amount: '104.00',
          tax_amount: '26.00',
          total_amount: '130.00',
          iban: '',
          vat_breakdown: [],
          line_items: [],
        },
        direction: {
          code: 'suspected_wrong_document_direction',
          supplier_source: '',
          override_required: false,
          unresolved: true,
          party_candidates: [
            {
              role: 'issuer',
              ...fineStar,
              is_own_company: true,
              suspected_own_company: false,
              blank: false,
            },
            {
              role: 'buyer',
              ...hac,
              is_own_company: false,
              suspected_own_company: false,
              blank: false,
            },
          ],
        },
        partner: {
          match: 'missing',
          partner_id: null,
          candidate_id: null,
          name: '',
          tax_number: '',
          diff: [],
        },
      }),
    );
    render(<InvoiceReview slug="finestar" importId={9} />);
    expect(
      await screen.findByText(/Izdavatelj je vaša tvrtka/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Potvrdi ulazni račun' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Izdavatelj/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /Kupac/ }));
    await waitFor(() => {
      expect(applySupplier).toHaveBeenCalledWith(session.origin, 'token', 9, { source: 'buyer' });
    });
  });
});
