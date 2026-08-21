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
    expect(screen.getAllByText('Proknjiženo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Evidentiran').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Djelomično').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Neusklađeno').length).toBeGreaterThan(0);
    expect(screen.getByText('4000')).toBeInTheDocument();
    expect(screen.getByText('2026-05')).toBeInTheDocument();
    expect(screen.queryByText('Zatvoreno')).toBeNull();
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
