import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCOUNT_PICKER_DEBOUNCE_MS } from '@/components/finance/AccountPicker';
import { fetchMe } from '@/lib/api';
import { sampleIncomingDetail } from '@/test/documentFixtures';
import { samplePostingPreview } from '@/test/expensePostingFixtures';

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
const fetchDocumentPdfBlob = vi.fn();
const fetchDocumentAttachmentBlob = vi.fn();
const downloadDocumentAttachment = vi.fn();

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocument: (...args: unknown[]) => fetchDocument(...args),
    downloadDocumentPdf: (...args: unknown[]) => downloadDocumentPdf(...args),
    downloadDocumentUbl: (...args: unknown[]) => downloadDocumentUbl(...args),
    fetchDocumentPdfBlob: (...args: unknown[]) => fetchDocumentPdfBlob(...args),
    fetchDocumentAttachmentBlob: (...args: unknown[]) => fetchDocumentAttachmentBlob(...args),
    downloadDocumentAttachment: (...args: unknown[]) => downloadDocumentAttachment(...args),
  };
});

const fetchExpensePostingPreview = vi.fn();
const patchDraftExpense = vi.fn();
const approveExpense = vi.fn();
const fetchExpenseCategories = vi.fn();
const fetchChartOfAccounts = vi.fn();
const fetchCostCenters = vi.fn();

vi.mock('@/lib/costCenters', async () => {
  const actual = await vi.importActual<typeof import('@/lib/costCenters')>('@/lib/costCenters');
  return {
    ...actual,
    fetchCostCenters: (...args: unknown[]) => fetchCostCenters(...args),
  };
});

vi.mock('@/lib/expensePosting', async () => {
  const actual = await vi.importActual<typeof import('@/lib/expensePosting')>('@/lib/expensePosting');
  return {
    ...actual,
    fetchExpensePostingPreview: (...args: unknown[]) => fetchExpensePostingPreview(...args),
    patchDraftExpense: (...args: unknown[]) => patchDraftExpense(...args),
    approveExpense: (...args: unknown[]) => approveExpense(...args),
    fetchExpenseCategories: (...args: unknown[]) => fetchExpenseCategories(...args),
    fetchChartOfAccounts: (...args: unknown[]) => fetchChartOfAccounts(...args),
  };
});

const fetchPartners = vi.fn();
vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    fetchPartners: (...args: unknown[]) => fetchPartners(...args),
  };
});

const createPrivateFundsClaim = vi.fn();
const postPrivateFundsClaim = vi.fn();
vi.mock('@/lib/finance', async () => {
  const actual = await vi.importActual<typeof import('@/lib/finance')>('@/lib/finance');
  return {
    ...actual,
    createPrivateFundsClaim: (...args: unknown[]) => createPrivateFundsClaim(...args),
    postPrivateFundsClaim: (...args: unknown[]) => postPrivateFundsClaim(...args),
  };
});

import { IncomingExpenseDetail } from './IncomingExpenseDetail';

const viewerMe = {
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
};

const ownerMe = {
  ...viewerMe,
  user: { ...viewerMe.user, username: 'owner' },
  tenants: [{ ...viewerMe.tenants[0], role: 'owner' }],
};

const statusTone = (container: HTMLElement, label: string) =>
  Array.from(container.querySelectorAll('.incoming-status-dl .badge'))
    .find((el) => el.textContent === label)
    ?.getAttribute('data-tone');

describe('IncomingExpenseDetail', () => {
  beforeEach(() => {
    fetchDocument.mockReset();
    downloadDocumentPdf.mockReset();
    downloadDocumentUbl.mockReset();
    fetchDocumentPdfBlob.mockReset();
    fetchDocumentAttachmentBlob.mockReset();
    downloadDocumentAttachment.mockReset();
    fetchDocumentPdfBlob.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));
    fetchDocumentAttachmentBlob.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));
    downloadDocumentPdf.mockResolvedValue(undefined);
    downloadDocumentAttachment.mockResolvedValue(undefined);
    fetchExpensePostingPreview.mockReset();
    patchDraftExpense.mockReset();
    approveExpense.mockReset();
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    replace.mockReset();
    refresh.mockReset();
    vi.mocked(fetchMe).mockResolvedValue(viewerMe as never);
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview());
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [{ id: 1, name: 'Ostalo', is_active: true, default_account: null }],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [{ id: 10, code: '4120', name: 'Ostali nespomenuti rashodi', active: true }],
    });
    fetchCostCenters.mockReset();
    fetchCostCenters.mockResolvedValue({
      count: 1,
      results: [{ id: 6, code: '110', name: 'Kuhinja', kind: 'location', notes: '', parent: null }],
    });
    fetchPartners.mockReset();
    fetchPartners.mockResolvedValue({ count: 0, results: [] });
    createPrivateFundsClaim.mockReset();
    postPrivateFundsClaim.mockReset();
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
    const { container } = render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

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
    expect(statusTone(container, 'Djelomično')).toBe('warning');
    expect(screen.getByRole('link', { name: 'Zatvori bankom' })).toHaveAttribute(
      'href',
      '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=3',
    );
    expect(screen.getByText('4000')).toBeInTheDocument();
    expect(screen.getByText('2026-05')).toBeInTheDocument();
    expect(screen.queryByText('Zatvoreno')).toBeNull();
  });

  it('renders Status badges with one representative tone per axis', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'rejected',
          integration: 'received',
          posting: 'posted',
          vat: 'absent',
          subledger: 'partial',
          payment: null,
        },
      }),
    );
    const { container } = render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    });

    expect(statusTone(container, 'Proknjiženo')).toBe('success');
    expect(statusTone(container, 'Odbijen')).toBe('danger');
    expect(statusTone(container, 'Djelomično')).toBe('warning');
    expect(statusTone(container, 'Zaprimljen')).toBe('neutral');
    expect(statusTone(container, 'Uspješno zaprimljen')).toBe('neutral');
    expect(statusTone(container, 'Nije evidentiran')).toBe('neutral');
    expect(statusTone(container, '—')).toBe('unknown');
  });

  it('renders open subledger as a neutral Status badge', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'open',
          payment: 'unmatched',
        },
      }),
    );
    const { container } = render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    });

    expect(statusTone(container, 'Neplaćeno')).toBe('neutral');
  });

  it('renders cancelled subledger as an unknown Podmirenje badge', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'cancelled',
          payment: null,
        },
      }),
    );
    const { container } = render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    });

    expect(container.querySelectorAll('.incoming-status-dl .badge-unknown')).toHaveLength(2);
    expect(
      Array.from(container.querySelectorAll('.incoming-status-dl .badge')).some(
        (el) => el.textContent === 'Otkazano',
      ),
    ).toBe(false);
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

  it('shows Odbij when actions.reject.available is true', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        actions: {
          reject: {
            available: true,
            reason_codes: ['REJECTED_BY_RECIPIENT', 'OTHER'],
            unavailable_code: null,
          },
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByRole('button', { name: 'Odbij' })).toBeInTheDocument();
  });

  it('hides Odbij when reject is unavailable', async () => {
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await screen.findByRole('heading', { name: '26210-H120-5154' });
    expect(screen.queryByRole('button', { name: 'Odbij' })).not.toBeInTheDocument();
  });

  it('shows banking close CTA when subledger is open with item_id', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        subledger: {
          state: { value: 'open', reason: null, source: 'subledger_item' },
          open_amount: { value: '372.20', reason: null, source: 'subledger_item' },
          original_amount: { value: '372.20', reason: null, source: 'subledger_item' },
          aging_bucket: { value: 'current', reason: null, source: 'subledger_item' },
          days: { value: 0, reason: null, source: 'subledger_item' },
        },
        subledger_context: {
          item_id: 55,
          state: 'open',
          original_amount: '372.20',
          allocated_amount: '0.00',
          open_amount: '372.20',
          due_date: '2026-08-06',
          allocations: [],
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Zatvori bankom' })).toHaveAttribute(
        'href',
        '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=55',
      );
    });
    expect(screen.queryByRole('button', { name: 'Platio partner' })).toBeNull();
  });

  it('hides banking close CTA when subledger is closed', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        subledger: {
          state: { value: 'closed', reason: null, source: 'subledger_item' },
          open_amount: { value: '0.00', reason: null, source: 'subledger_item' },
          original_amount: { value: '372.20', reason: null, source: 'subledger_item' },
          aging_bucket: { value: null, reason: 'not_applicable', source: null },
          days: { value: null, reason: 'not_applicable', source: null },
        },
        subledger_context: {
          item_id: 55,
          state: 'closed',
          original_amount: '372.20',
          allocated_amount: '372.20',
          open_amount: '0.00',
          due_date: '2026-08-06',
          allocations: [],
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '26210-H120-5154' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: 'Zatvori bankom' })).toBeNull();
  });

  it('renders posting preview lines from the API without inventing accounts', async () => {
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        expense_account: { id: 88, code: '4100', name: 'Najam', active: true },
        account_source: 'category_default',
        lines: [
          {
            amount_field: 'net_amount',
            description: 'Rashod',
            amount: '100.00',
            debit: { id: 88, code: '4100', name: 'Najam', active: true },
            credit: { id: 20, code: '2200', name: 'Dobavljači', active: true },
            debit_cost_center: null,
            credit_cost_center: null,
          },
        ],
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByRole('cell', { name: '4100 · Najam' })).toBeInTheDocument();
    expect(screen.getByText('Prijedlog knjiženja')).toBeInTheDocument();
  });

  it('keeps posting inputs usable when the cost center codebook fails', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchCostCenters.mockRejectedValue(new Error('cost centers down'));
    fetchExpenseCategories.mockResolvedValue({
      count: 2,
      results: [
        { id: 1, name: 'Ostalo', is_active: true, default_account: null },
        { id: 2, name: 'Telekomunikacije', is_active: true, default_account: null },
      ],
    });
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview());
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByLabelText('Vrsta troška')).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Telekomunikacije' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Konto rashoda' })).toHaveAttribute(
      'placeholder',
      'Zadano konto vrste',
    );
    expect(screen.queryByText('cost centers down')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mjesto troška')).toHaveValue('');
  });

  it('lets an owner assign an account per expense line', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        ubl_available: false,
        lines: [
          {
            id: 11,
            position: 1,
            classification: null,
            name: 'ENC nadoplata',
            description: null,
            unit: null,
            quantity: null,
            unit_price: null,
            vat_rate: null,
            net_amount: '80.00',
            vat_amount: '20.00',
            gross_amount: '100.00',
            posting_account: null,
          },
          {
            id: 12,
            position: 2,
            classification: null,
            name: 'ENC uređaj',
            description: null,
            unit: null,
            quantity: null,
            unit_price: null,
            vat_rate: null,
            net_amount: '24.00',
            vat_amount: '6.00',
            gross_amount: '30.00',
            posting_account: null,
          },
        ],
      }),
    );
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [{ id: 1, name: 'Ostalo', is_active: true, default_account: null }],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1909,
          code: '1909',
          name: 'Unaprijed plaćeni ostali troškovi poslovanja',
          active: true,
        },
      ],
    });
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview());
    patchDraftExpense.mockResolvedValue({ id: 30, status: 'draft' });
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByText('ENC nadoplata')).toBeInTheDocument();
    const picker = screen.getByRole('combobox', { name: 'Konto stavke 1' });
    fireEvent.focus(picker);
    fireEvent.change(picker, { target: { value: '1909' } });
    const option = await screen.findByRole(
      'option',
      { name: '1909 · Unaprijed plaćeni ostali troškovi poslovanja' },
      { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 2000 },
    );
    fireEvent.click(option);
    await waitFor(() => {
      expect(patchDraftExpense).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        { line_accounts: [{ position: 1, posting_account_id: 1909 }] },
      );
    });
  });

  it('hides header vrsta and konto when every line already has a posting account', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        ubl_available: false,
        lines: [
          {
            id: 11,
            position: 1,
            classification: null,
            name: 'ENC nadoplata',
            description: null,
            unit: null,
            quantity: null,
            unit_price: null,
            vat_rate: null,
            net_amount: '80.00',
            vat_amount: '20.00',
            gross_amount: '100.00',
            posting_account: {
              id: 1900,
              code: '1900',
              name: 'Unaprijed plaćeni troškovi',
              active: true,
            },
          },
          {
            id: 12,
            position: 2,
            classification: null,
            name: 'ENC uređaj',
            description: null,
            unit: null,
            quantity: null,
            unit_price: null,
            vat_rate: null,
            net_amount: '24.00',
            vat_amount: '6.00',
            gross_amount: '30.00',
            posting_account: {
              id: 4040,
              code: '4040',
              name: 'Troškovi uredskog sitnog inventara',
              active: true,
            },
          },
        ],
      }),
    );
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [{ id: 1, name: 'Cestarine', is_active: true, default_account: null }],
    });
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        category: { id: 1, name: 'Cestarine' },
        account_source: 'posting_rule_fallback',
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByRole('heading', { name: 'Mjesto troška' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Vrsta troška')).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Konto rashoda' })).toBeNull();
    expect(screen.queryByText(/Izvor konta/)).toBeNull();
    expect(screen.getByLabelText('Mjesto troška')).toBeInTheDocument();
    expect(
      screen.getByText(/Konto se bira na stavkama/),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Osnovica i PDV knjiže se po stavkama. Header konto se ne koristi.'),
    ).toBeInTheDocument();
  });

  it('omits the header posting card after split lines are posted', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        ubl_available: false,
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'closed',
          payment: 'matched',
        },
        accounting: {
          journal_entry_id: 9,
          entry_number: '202609-0026',
          entry_date: '2026-09-20',
          status: 'posted',
          debit_total: '130.00',
          credit_total: '130.00',
          lines: [],
        },
        lines: [
          {
            id: 11,
            position: 1,
            classification: null,
            name: 'ENC nadoplata',
            description: null,
            unit: null,
            quantity: null,
            unit_price: null,
            vat_rate: null,
            net_amount: '80.00',
            vat_amount: '20.00',
            gross_amount: '100.00',
            posting_account: {
              id: 1900,
              code: '1900',
              name: 'Unaprijed plaćeni troškovi',
              active: true,
            },
          },
        ],
      }),
    );
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: false }));
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    expect(await screen.findByRole('heading', { name: 'Knjiženje' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Vrsta troška' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Mjesto troška' })).toBeNull();
    expect(screen.queryByLabelText('Vrsta troška')).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Konto rashoda' })).toBeNull();
  });

  it('refetches preview after a successful draft PATCH', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpenseCategories.mockResolvedValue({
      count: 2,
      results: [
        { id: 1, name: 'Ostalo', is_active: true, default_account: null },
        {
          id: 2,
          name: 'Telekomunikacije',
          is_active: true,
          default_account: { id: 11, code: '4100', name: 'Najam', active: true },
        },
      ],
    });
    patchDraftExpense.mockResolvedValue({ id: 30, status: 'draft' });
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview());
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const select = await screen.findByLabelText('Vrsta troška');
    await screen.findByRole('option', { name: 'Telekomunikacije' });
    const previewCallsBeforePatch = fetchExpensePostingPreview.mock.calls.length;
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        category: { id: 2, name: 'Telekomunikacije' },
        expense_account: { id: 11, code: '4100', name: 'Najam', active: true },
        account_source: 'category_default',
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
    fireEvent.change(select, { target: { value: '2' } });
    await waitFor(() => {
      expect(patchDraftExpense).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        { category_id: 2 },
      );
    });
    await waitFor(() => {
      expect(fetchExpensePostingPreview.mock.calls.length).toBeGreaterThan(previewCallsBeforePatch);
    });
    expect(await screen.findByRole('cell', { name: '4100 · Najam' })).toBeInTheDocument();
  });

  it('shows a read-only lock message on 409 not_draft instead of a generic error', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpenseCategories.mockResolvedValue({
      count: 2,
      results: [
        { id: 1, name: 'Ostalo', is_active: true, default_account: null },
        { id: 2, name: 'Telekomunikacije', is_active: true, default_account: null },
      ],
    });
    const { FinanceApiError } = await import('@/lib/expensePosting');
    patchDraftExpense.mockRejectedValue(
      new FinanceApiError('Vrsta troška i konto mogu se mijenjati samo dok je nalog u nacrtu.', 409, 'not_draft'),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const select = await screen.findByLabelText('Vrsta troška');
    await screen.findByRole('option', { name: 'Telekomunikacije' });
    fireEvent.change(select, { target: { value: '2' } });
    expect(
      await screen.findByText(/zaključani jer je nalog već odobren/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Detalje dokumenta trenutno nije moguće učitati.')).toBeNull();
    expect(screen.queryByLabelText('Vrsta troška')).toBeNull();
  });

  it('hides Odobri for viewers even when preview.can_approve is true', async () => {
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: true }));
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await screen.findByRole('heading', { name: '26210-H120-5154' });
    expect(screen.queryByRole('button', { name: 'Odobri' })).not.toBeInTheDocument();
  });

  it('hides Odobri on posted expenses', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'open',
          payment: 'unmatched',
        },
        accounting: {
          journal_entry_id: 182,
          entry_number: '202608-0020',
          entry_date: '2026-08-23',
          status: 'posted',
          debit_total: '125.00',
          credit_total: '125.00',
          lines: [],
        },
      }),
    );
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: false }));
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await screen.findByRole('link', { name: '202608-0020' });
    expect(screen.queryByRole('button', { name: 'Odobri' })).not.toBeInTheDocument();
  });

  it('hides Odobri when preview.can_approve is false', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: false }));
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await screen.findByRole('heading', { name: 'Vrsta troška' });
    expect(screen.queryByRole('button', { name: 'Odobri' })).not.toBeInTheDocument();
  });

  it('approves a draft via the existing endpoint then refreshes expense and JE', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: true }));
    approveExpense.mockResolvedValue({ id: 30, status: 'approved' });
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const approveButtons = await screen.findAllByRole('button', { name: 'Odobri' });
    expect(approveButtons.length).toBeGreaterThan(0);

    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        status: {
          document: 'received',
          workflow: 'approved',
          integration: 'received',
          posting: 'posted',
          vat: 'recorded',
          subledger: 'open',
          payment: 'unmatched',
        },
        accounting: {
          journal_entry_id: 182,
          entry_number: '202608-0020',
          entry_date: '2026-08-23',
          status: 'posted',
          debit_total: '125.00',
          credit_total: '125.00',
          lines: [
            {
              account_code: '4100',
              account_name: 'Troškovi telefona, interneta i sl.',
              partner_name: null,
              debit: '100.00',
              credit: '0.00',
              description: 'Rashod',
            },
          ],
        },
      }),
    );
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: false }));

    fireEvent.click(approveButtons[0]);
    await waitFor(() => {
      expect(approveExpense).toHaveBeenCalledWith(expect.any(String), 'token', 30);
    });
    await waitFor(() => {
      expect(fetchDocument.mock.calls.length).toBeGreaterThan(1);
    });
    expect(await screen.findByRole('link', { name: '202608-0020' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/182',
    );
    expect(screen.getByText('4100')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Odobri' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Vrsta troška')).toBeNull();
    expect(screen.queryByText('Prijedlog knjiženja')).toBeNull();
  });

  it('shows a readable approve conflict instead of a page error', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpensePostingPreview.mockResolvedValue(samplePostingPreview({ can_approve: true }));
    const { FinanceApiError } = await import('@/lib/expensePosting');
    approveExpense.mockRejectedValue(
      new FinanceApiError('Trošak nije u statusu koji se može odobriti.', 409, 'invalid_status'),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    fireEvent.click((await screen.findAllByRole('button', { name: 'Odobri' }))[0]);
    expect(await screen.findByText('Trošak nije u statusu koji se može odobriti.')).toBeInTheDocument();
    expect(screen.queryByText('Detalje dokumenta trenutno nije moguće učitati.')).toBeNull();
  });

  const openApDetail = () =>
    sampleIncomingDetail({
      id: 54,
      document: {
        issue_date: '2026-09-09',
        delivery_date: '2026-09-09',
        due_date: '2026-09-09',
        received_at: '2026-09-09T10:00:00+02:00',
        currency: 'EUR',
        business_process: 'P5',
        source_label: 'SUPER eRačun',
        format: 'UBL',
        primary_reference: null,
      },
      status: {
        document: 'received',
        workflow: 'approved',
        integration: 'received',
        posting: 'posted',
        vat: 'recorded',
        subledger: 'open',
        payment: 'unmatched',
      },
      subledger: {
        state: { value: 'open', reason: null, source: 'subledger_item' },
        open_amount: { value: '8.99', reason: null, source: 'subledger_item' },
        original_amount: { value: '8.99', reason: null, source: 'subledger_item' },
        aging_bucket: { value: 'current', reason: null, source: 'subledger_item' },
        days: { value: 0, reason: null, source: 'subledger_item' },
      },
      subledger_context: {
        item_id: 84,
        state: 'open',
        original_amount: '8.99',
        allocated_amount: '0.00',
        open_amount: '8.99',
        due_date: '2026-09-09',
        allocations: [],
      },
    });

  it('shows Platio partner for owner when AP is open', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(openApDetail());
    render(<IncomingExpenseDetail slug="finestar" expenseId={54} />);
    expect(await screen.findByRole('button', { name: 'Platio partner' })).toBeInTheDocument();
  });

  it('hides Platio partner for owner when AP is closed', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        subledger: {
          state: { value: 'closed', reason: null, source: 'subledger_item' },
          open_amount: { value: '0.00', reason: null, source: 'subledger_item' },
          original_amount: { value: '8.99', reason: null, source: 'subledger_item' },
          aging_bucket: { value: null, reason: 'not_applicable', source: null },
          days: { value: null, reason: 'not_applicable', source: null },
        },
        subledger_context: {
          item_id: 84,
          state: 'closed',
          original_amount: '8.99',
          allocated_amount: '8.99',
          open_amount: '0.00',
          due_date: '2026-09-09',
          allocations: [],
        },
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={54} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '26210-H120-5154' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Platio partner' })).toBeNull();
  });

  it('posts supplier_payment then refetches the document', async () => {
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(openApDetail());
    fetchPartners.mockResolvedValue({
      count: 2,
      results: [
        {
          id: 14,
          partner_code: '00005',
          name: 'LINKS d.o.o.',
          short_name: '',
          partner_type: 'supplier',
          status: 'active',
          jurisdiction: 'HR',
          country_code: 'HR',
          tax_number: '32614011568',
          city: 'Zagreb',
          country: 'Hrvatska',
          email: '',
          phone: '',
        },
        {
          id: 24,
          partner_code: '00012',
          name: 'Ante Vrcan',
          short_name: 'Ante',
          partner_type: 'other',
          status: 'active',
          jurisdiction: 'HR',
          country_code: 'HR',
          tax_number: '11528564544',
          city: 'Hanau',
          country: 'Hrvatska',
          email: '',
          phone: '',
        },
      ],
    });
    createPrivateFundsClaim.mockResolvedValue({
      id: 99,
      number: 'PFC-202609-0001',
      claim_type: 'supplier_payment',
      partner_id: 24,
      partner_name: 'Ante Vrcan',
      amount: '8.99',
      currency: 'EUR',
      claim_date: '2026-09-09',
      status: 'draft',
      operational_status: 'none',
      open_amount: '8.99',
      reference: '',
      notes: '',
      related_type: 'expense',
      related_id: 54,
      journal_entry_id: null,
      created_at: null,
    });
    postPrivateFundsClaim.mockResolvedValue({
      id: 99,
      number: 'PFC-202609-0001',
      claim_type: 'supplier_payment',
      partner_id: 24,
      partner_name: 'Ante Vrcan',
      amount: '8.99',
      currency: 'EUR',
      claim_date: '2026-09-09',
      status: 'posted',
      operational_status: 'open',
      open_amount: '8.99',
      reference: '',
      notes: '',
      related_type: 'expense',
      related_id: 54,
      journal_entry_id: 501,
      created_at: null,
    });

    render(<IncomingExpenseDetail slug="finestar" expenseId={54} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Platio partner' }));
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Partner' })).toHaveValue('24');
    });
    expect(screen.getByLabelText('Iznos')).toHaveValue('8.99');
    expect(screen.getByLabelText('Datum')).toHaveValue('2026-09-09');

    fireEvent.click(screen.getByRole('button', { name: 'Proknjiži' }));

    await waitFor(() => {
      expect(createPrivateFundsClaim).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        {
          partner_id: 24,
          claim_type: 'supplier_payment',
          amount: '8.99',
          claim_date: '2026-09-09',
          related_type: 'expense',
          related_id: 54,
        },
        expect.any(String),
      );
    });
    expect(postPrivateFundsClaim).toHaveBeenCalledWith(
      expect.any(String),
      'token',
      99,
      expect.any(String),
    );
    expect(fetchDocument).toHaveBeenCalledTimes(2);
  });

  it('keeps Preuzmi for XML, Pregled for PDFs and images', async () => {
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        pdf_available: true,
        ubl_available: true,
        attachments: [
          {
            id: 7,
            original_filename: 'petrol_832827.pdf',
            created_at: null,
            uploaded_by: null,
            download_available: { value: true, reason: null, source: 'test' },
            kind: 'upload',
          },
          {
            id: 8,
            original_filename: 'scan.jpg',
            created_at: null,
            uploaded_by: null,
            download_available: { value: true, reason: null, source: 'test' },
            kind: 'upload',
          },
          {
            id: 9,
            original_filename: 'notes.xml',
            created_at: null,
            uploaded_by: null,
            download_available: { value: true, reason: null, source: 'test' },
            kind: 'upload',
          },
        ],
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByText('petrol_832827.pdf')).toBeInTheDocument();
    });

    expect(screen.getByText('račun.pdf')).toBeInTheDocument();
    expect(screen.getByText('invoice.xml')).toBeInTheDocument();
    expect(screen.getByText('scan.jpg')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Pregled' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Preuzmi' })).toHaveLength(2);
  });

  it('opens a PDF modal from Pregled and downloads from the dialog', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:pdf'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        pdf_available: true,
        attachments: [
          {
            id: 7,
            original_filename: 'petrol_832827.pdf',
            created_at: null,
            uploaded_by: null,
            download_available: { value: true, reason: null, source: 'test' },
            kind: 'upload',
          },
        ],
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByText('petrol_832827.pdf')).toBeInTheDocument();
    });

    const previewButtons = screen.getAllByRole('button', { name: 'Pregled' });
    fireEvent.click(previewButtons[1]);

    const attachmentDialog = await screen.findByRole('dialog', { name: 'petrol_832827.pdf' });
    await waitFor(() => {
      expect(fetchDocumentAttachmentBlob).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        7,
      );
    });

    fireEvent.click(within(attachmentDialog).getByRole('button', { name: 'Preuzmi' }));
    await waitFor(() => {
      expect(downloadDocumentAttachment).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        7,
      );
    });

    fireEvent.click(within(attachmentDialog).getByRole('button', { name: 'Zatvori' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'petrol_832827.pdf' })).toBeNull();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Pregled' })[0]);
    const invoiceDialog = await screen.findByRole('dialog', { name: 'račun.pdf' });
    fireEvent.click(within(invoiceDialog).getByRole('button', { name: 'Preuzmi' }));
    await waitFor(() => {
      expect(downloadDocumentPdf).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        'incoming',
        30,
      );
    });
  });

  it('opens an image modal from Pregled on JPG and downloads from the dialog', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:jpg'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    fetchDocumentAttachmentBlob.mockResolvedValue(
      new Blob(['jpeg'], { type: 'image/jpeg' }),
    );
    fetchDocument.mockResolvedValue(
      sampleIncomingDetail({
        pdf_available: false,
        ubl_available: false,
        attachments: [
          {
            id: 8,
            original_filename: 'scan.jpg',
            created_at: null,
            uploaded_by: null,
            download_available: { value: true, reason: null, source: 'test' },
            kind: 'upload',
          },
        ],
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);

    await waitFor(() => {
      expect(screen.getByText('scan.jpg')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pregled' }));

    const imageDialog = await screen.findByRole('dialog', { name: 'scan.jpg' });
    await waitFor(() => {
      expect(fetchDocumentAttachmentBlob).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        8,
      );
    });
    expect(within(imageDialog).getByRole('img', { name: 'scan.jpg' })).toHaveAttribute(
      'src',
      'blob:jpg',
    );

    fireEvent.click(within(imageDialog).getByRole('button', { name: 'Preuzmi' }));
    await waitFor(() => {
      expect(downloadDocumentAttachment).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        8,
      );
    });

    fireEvent.click(within(imageDialog).getByRole('button', { name: 'Zatvori' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'scan.jpg' })).toBeNull();
    });
  });
});

const ACCOUNT_4198 = {
  id: 38413,
  code: '4198',
  name: 'Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
  active: true,
};

const ACCOUNT_4100 = {
  id: 11,
  code: '4100',
  name: 'Najam',
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

describe('IncomingExpenseDetail account picker', () => {
  beforeEach(() => {
    fetchDocument.mockReset();
    fetchExpensePostingPreview.mockReset();
    patchDraftExpense.mockReset();
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    vi.mocked(fetchMe).mockResolvedValue(ownerMe as never);
    fetchDocument.mockResolvedValue(sampleIncomingDetail());
    fetchExpenseCategories.mockResolvedValue({
      count: 2,
      results: [
        { id: 1, name: 'Ostalo', is_active: true, default_account: null },
        {
          id: 2,
          name: 'Telekomunikacije',
          is_active: true,
          default_account: ACCOUNT_4100,
        },
      ],
    });
    fetchChartOfAccounts.mockResolvedValue({ count: 1, results: [ACCOUNT_4198] });
    fetchCostCenters.mockResolvedValue({
      count: 1,
      results: [{ id: 6, code: '110', name: 'Kuhinja', kind: 'location', notes: '', parent: null }],
    });
  });

  it('does not fetch the chart until the user types at least one character', async () => {
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        account_source: 'category_default',
        expense_account: ACCOUNT_4100,
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const input = await screen.findByRole('combobox', { name: 'Konto rashoda' });
    await waitFor(() => {
      expect(fetchExpenseCategories).toHaveBeenCalled();
    });
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '4' } });
    await waitFor(
      () => {
        expect(fetchChartOfAccounts).toHaveBeenCalled();
      },
      { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 500 },
    );
  });

  it('shows a manual override as the committed picker value', async () => {
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        account_source: 'manual_override',
        expense_account: ACCOUNT_4198,
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const input = await screen.findByRole('combobox', { name: 'Konto rashoda' });
    await waitFor(() => {
      expect(input).toHaveValue(
        '4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
      );
    });
  });

  it('shows the category default placeholder instead of a derived account', async () => {
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        category: { id: 2, name: 'Telekomunikacije' },
        account_source: 'category_default',
        expense_account: ACCOUNT_4100,
      }),
    );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const input = await screen.findByRole('combobox', { name: 'Konto rashoda' });
    expect(input).toHaveValue('');
    await waitFor(() => {
      expect(input).toHaveAttribute('placeholder', 'Zadano konto vrste (4100 · Najam)');
    });
  });

  it('clears a previous override when a later preview is a derived source', async () => {
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        account_source: 'manual_override',
        expense_account: ACCOUNT_4198,
      }),
    );
    patchDraftExpense.mockResolvedValue({ id: 30, status: 'draft' });
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    const overrideInput = await screen.findByRole('combobox', { name: 'Konto rashoda' });
    await waitFor(() => {
      expect(overrideInput).toHaveValue(
        '4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
      );
    });

    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        category: { id: 2, name: 'Telekomunikacije' },
        account_source: 'category_default',
        expense_account: ACCOUNT_4100,
      }),
    );
    fireEvent.change(screen.getByLabelText('Vrsta troška'), { target: { value: '2' } });
    await waitFor(() => {
      expect(patchDraftExpense).toHaveBeenCalled();
    });
    const input = screen.getByRole('combobox', { name: 'Konto rashoda' });
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
    expect(input).toHaveAttribute('placeholder', 'Zadano konto vrste (4100 · Najam)');
    expect(input).not.toHaveValue(
      '4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
    );
  });

  it('persists the selected AccountRef id, not the typed search text', async () => {
    fetchExpensePostingPreview.mockResolvedValue(
      samplePostingPreview({
        account_source: 'category_default',
        expense_account: ACCOUNT_4100,
      }),
    );
    patchDraftExpense.mockResolvedValue({ id: 30, status: 'draft' });
    fetchExpensePostingPreview
      .mockResolvedValueOnce(
        samplePostingPreview({
          account_source: 'category_default',
          expense_account: ACCOUNT_4100,
        }),
      )
      .mockResolvedValue(
        samplePostingPreview({
          account_source: 'manual_override',
          expense_account: ACCOUNT_4198,
        }),
      );
    render(<IncomingExpenseDetail slug="finestar" expenseId={30} />);
    await screen.findByRole('combobox', { name: 'Konto rashoda' });
    await searchAndSelectAccount(/4198/);
    await waitFor(() => {
      expect(patchDraftExpense).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        30,
        { expense_account_id: 38413 },
      );
    });
    expect(patchDraftExpense).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ expense_account_id: '4198' }),
    );
  });
});
