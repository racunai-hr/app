import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleIncomingDetail } from '@/test/documentFixtures';

const replace = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

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

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
  clearTokens: vi.fn(),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    fetchMe: vi.fn().mockResolvedValue({
      user: { id: 1, username: 'viewer', email: '', is_superuser: false },
      tenants: [
        {
          slug: 'finestar',
          name: 'FineStar',
          role: 'viewer',
          is_default: true,
          admin_url: 'https://finestar-stage.racunai.hr/admin/',
        },
      ],
      platform_admin_url: 'https://admin.racunai.hr/admin/',
    }),
  };
});

const fetchDocument = vi.fn();
const downloadDocumentPdf = vi.fn();
const downloadDocumentUbl = vi.fn();

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocument: (...args: unknown[]) => fetchDocument(...args),
    downloadDocumentPdf: (...args: unknown[]) => downloadDocumentPdf(...args),
    downloadDocumentUbl: (...args: unknown[]) => downloadDocumentUbl(...args),
  };
});

import { IncomingExpenseDetail } from './IncomingExpenseDetail';

describe('IncomingExpenseDetail', () => {
  beforeEach(() => {
    fetchDocument.mockReset();
    downloadDocumentPdf.mockReset();
    downloadDocumentUbl.mockReset();
    replace.mockReset();
    refresh.mockReset();
  });

  it('renders PR A blocks and capability-driven actions', async () => {
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByText('Dobavljač')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: '26210-H120-5154' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Podaci o računu' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByText('Poslovi registracije')).toBeInTheDocument();
    expect(screen.getByText('KPD 71.20.04')).toBeInTheDocument();
    expect(screen.getByText('Posebna naknada za okoliš')).toBeInTheDocument();
    expect(screen.getAllByText('372,20 EUR').length).toBeGreaterThan(0);

    expect(screen.getByRole('button', { name: 'Izvorni XML' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Preuzmi PDF' })).toBeNull();
    const external = screen.getAllByRole('link', { name: 'Otvori u SUPER-u ↗' })[0];
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    expect(external.getAttribute('href')).toContain('moj.super.hr');
  });

  it('renders PR C accounting context from API without inventing state', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'partial',
          payment: 'unmatched',
        },
        accounting: {
          journal_entry_id: 9,
          entry_number: 'JE-9',
          entry_date: '2026-05-15',
          status: 'posted',
          debit_total: '50.00',
          credit_total: '50.00',
          lines: [
            {
              account_code: '4000',
              account_name: 'Troškovi',
              partner_name: null,
              debit: '50.00',
              credit: '0.00',
              description: 'ulaz',
            },
          ],
        },
        vat_context: {
          period: '2026-05',
          recorded: true,
          deductible: null,
          total_base: '40.00',
          total_vat: '10.00',
          rates: [{ rate: '25.00', base: '40.00', vat: '10.00' }],
        },
        subledger_context: {
          item_id: 3,
          state: 'partial',
          original_amount: '50.00',
          allocated_amount: '20.00',
          open_amount: '30.00',
          due_date: '2026-05-30',
          allocations: [],
        },
        payment: {
          matched: false,
          date: null,
          amount: null,
          account_mask: null,
          reference: null,
          reconcile_status: 'unmatched',
          bank_transaction_id: null,
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Knjiženje' })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'PDV' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saldakonto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plaćanje' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'JE-9' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/9',
    );
    expect(screen.getByRole('link', { name: 'JE-9' }).getAttribute('href')).not.toContain('JE-9');
    expect(screen.getAllByText('Proknjiženo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Evidentiran').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Djelomično').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Neusklađeno').length).toBeGreaterThan(0);
    expect(screen.getByText('4000')).toBeInTheDocument();
    expect(screen.getByText('2026-05')).toBeInTheDocument();
    expect(screen.queryByText('Zatvoreno')).toBeNull();
  });

  it('renders settlement trail closings, bank deep-link, and possible-duplicate alert', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        settlement_trail: {
          obligation: {
            amount: '33000.00',
            journal_entry_id: 68,
            entry_number: '202607-0010',
            entry_date: '2026-07-30',
          },
          closings: [
            {
              kind: 'bank',
              amount: '23100.00',
              journal_entry_id: 69,
              entry_number: '202607-0011',
              allocation_id: 7,
              bank_transaction_id: 39,
              bank_statement_id: 28,
              counterparty_name: 'SaM',
              private_funds_claim_id: null,
              claim_number: null,
              partner_id: null,
              partner_name: null,
              label: 'Banka',
            },
            {
              kind: 'private_funds',
              amount: '9900.00',
              journal_entry_id: 71,
              entry_number: '202607-0012',
              allocation_id: 8,
              bank_transaction_id: null,
              bank_statement_id: null,
              counterparty_name: null,
              private_funds_claim_id: 2,
              claim_number: 'PFC-202608-0001',
              partner_id: 24,
              partner_name: 'Ante Vrcan',
              label: 'Privatna sredstva',
            },
          ],
          system_entries: [
            {
              kind: 'expense_paid',
              amount: '33000.00',
              journal_entry_id: 72,
              entry_number: '202607-0013',
              note: 'Sistemski generirano (expense_paid); nije alokacija saldakonta.',
            },
          ],
          warnings: [
            {
              code: 'possible_duplicate_expense_paid',
              message:
                'Obveza je u cijelosti zatvorena alokacijama, a postoji i zasebno sistemsko expense_paid knjiženje. Provjerite predstavlja li dodatno knjiženje duplikat.',
            },
          ],
          totals: {
            obligation: '33000.00',
            allocated: '33000.00',
            open: '0.00',
          },
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={18} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tijek zatvaranja' })).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('duplikat');
    expect(screen.getByRole('link', { name: '202607-0010' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/68',
    );
    expect(screen.getByRole('link', { name: 'Transakcija #39' })).toHaveAttribute(
      'href',
      '/t/finestar/bankarstvo/transakcije?statement=28&tx=39',
    );
    expect(screen.getByText('Izvod #28')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Izvod #28' })).toBeNull();
    expect(screen.getByText('PFC-202608-0001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ante Vrcan' })).toHaveAttribute(
      'href',
      '/t/finestar/partneri/24',
    );
    expect(screen.getByRole('heading', { name: 'Sistemska knjiženja' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '202607-0013' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/72',
    );
  });

  it('links settlement_trail journal_entry_id=123 to tenant-scoped JE detail', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        settlement_trail: {
          obligation: {
            amount: '100.00',
            journal_entry_id: 123,
            entry_number: 'JE-123',
            entry_date: '2026-08-21',
          },
          closings: [
            {
              kind: 'other',
              amount: '100.00',
              journal_entry_id: 123,
              entry_number: 'JE-123',
              allocation_id: 1,
              bank_transaction_id: null,
              bank_statement_id: null,
              counterparty_name: null,
              private_funds_claim_id: null,
              claim_number: null,
              partner_id: null,
              partner_name: null,
              label: 'Ostalo',
            },
          ],
          system_entries: [],
          warnings: [],
          totals: { obligation: '100.00', allocated: '100.00', open: '0.00' },
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tijek zatvaranja' })).toBeInTheDocument();
    });
    const links = screen.getAllByRole('link', { name: 'JE-123' });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/t/finestar/glavna-knjiga/123');
      expect(link.getAttribute('href')).not.toContain('JE-123');
    }
  });

  it('does not link settlement_trail temeljnica when journal_entry_id is null', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        settlement_trail: {
          obligation: {
            amount: '50.00',
            journal_entry_id: null,
            entry_number: 'JE-NO-ID',
            entry_date: null,
          },
          closings: [
            {
              kind: 'other',
              amount: '50.00',
              journal_entry_id: null,
              entry_number: 'JE-CLOSE-NO-ID',
              allocation_id: 9,
              bank_transaction_id: null,
              bank_statement_id: null,
              counterparty_name: null,
              private_funds_claim_id: null,
              claim_number: null,
              partner_id: null,
              partner_name: null,
              label: 'Ostalo',
            },
          ],
          system_entries: [],
          warnings: [],
          totals: { obligation: '50.00', allocated: '50.00', open: '0.00' },
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tijek zatvaranja' })).toBeInTheDocument();
    });
    expect(screen.getByText('JE-CLOSE-NO-ID')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'JE-NO-ID' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'JE-CLOSE-NO-ID' })).toBeNull();
  });

  it('does not link temeljnica when journal_entry_id is missing', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        accounting: {
          journal_entry_id: null,
          entry_number: 'JE-ORPHAN',
          entry_date: null,
          status: null,
          debit_total: null,
          credit_total: null,
          lines: [],
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByText('JE-ORPHAN')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: 'JE-ORPHAN' })).toBeNull();
    expect(screen.queryByText(/Temeljnica nije dostupna/i)).toBeNull();
  });

  it('links accounting temeljnica when journal_entry_id exists without entry_number', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        accounting: {
          journal_entry_id: 42,
          entry_number: '',
          entry_date: '2026-05-15',
          status: 'posted',
          debit_total: '50.00',
          credit_total: '50.00',
          lines: [],
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Knjiženje' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '#42' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/42',
    );
  });

  it('hides SUPER action when external_view_url is null', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        integration: {
          source: 'super',
          status: 'received',
          received_at: null,
          external_id: 'abc',
          external_view_url: null,
        },
        ubl_available: false,
        pdf_available: false,
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '26210-H120-5154' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /Otvori u SUPER|Otvori izvorni/i })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Izvorni XML' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Preuzmi PDF' })).toBeNull();
  });

  it('shows human 404 state', async () => {
    const { ApiError } = await import('@/lib/api');
    fetchDocument.mockRejectedValue(new ApiError('missing', 404));
    render(<IncomingExpenseDetail slug="finestar" expenseId={999} />);
    await waitFor(() => {
      expect(screen.getByText('Dokument nije pronađen ili nemate pristup.')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Natrag na listu' })).toBeInTheDocument();
  });

  it('downloads XML when available', async () => {
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    downloadDocumentUbl.mockResolvedValue(undefined);
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => screen.getByRole('button', { name: 'Izvorni XML' }));
    fireEvent.click(screen.getByRole('button', { name: 'Izvorni XML' }));
    await waitFor(() => {
      expect(downloadDocumentUbl).toHaveBeenCalled();
    });
  });
});
