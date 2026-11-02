import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const fetchCostCenter = vi.fn();
const fetchCostCenterReport = vi.fn();
const fetchJournalEntries = vi.fn();
const fetchDocuments = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
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
    fetchMe: vi.fn(() =>
      Promise.resolve({
        user: { id: 1, username: 'u', email: '', is_superuser: false },
        tenants: [
          {
            slug: 'finestar',
            name: 'FineStar',
            role: 'owner',
            is_default: true,
            admin_url: 'https://finestar-stage.racunai.hr/admin/',
          },
        ],
        platform_admin_url: 'https://admin.racunai.hr/admin/',
      }),
    ),
  };
});

vi.mock('@/lib/costCenters', async () => {
  const actual = await vi.importActual<typeof import('@/lib/costCenters')>('@/lib/costCenters');
  return {
    ...actual,
    fetchCostCenter: (...args: unknown[]) => fetchCostCenter(...args),
    fetchCostCenterReport: (...args: unknown[]) => fetchCostCenterReport(...args),
  };
});

vi.mock('@/lib/journal', async () => {
  const actual = await vi.importActual<typeof import('@/lib/journal')>('@/lib/journal');
  return {
    ...actual,
    fetchJournalEntries: (...args: unknown[]) => fetchJournalEntries(...args),
  };
});

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocuments: (...args: unknown[]) => fetchDocuments(...args),
  };
});

import { CostCenterCard } from './CostCenterCard';

const center = {
  id: 18,
  code: '701',
  name: 'Audi A8 Lang 50 TDI',
  kind: 'object',
  is_active: true,
  is_bookable: true,
  notes: '',
  parent_id: 7,
  parent: { id: 7, code: '7', name: 'Vozni park' },
  vehicle: { id: 3, name: 'Audi A8 Lang 50 TDI', vin: 'WAUZZZF86RN003268', fixed_asset_id: 4 },
  fixed_assets: [{ id: 4, name: 'Audi A8 Lang 50 TDI' }],
};

describe('CostCenterCard', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchCostCenter.mockReset();
    fetchCostCenterReport.mockReset();
    fetchJournalEntries.mockReset();
    fetchDocuments.mockReset();
    fetchCostCenter.mockResolvedValue(center);
    fetchCostCenterReport.mockResolvedValue({
      year: 2026,
      month: 9,
      cumulative: true,
      total: '0.00',
      assigned_total: '0.00',
      unassigned_total: '0.00',
      groups: [],
      results: [],
    });
    fetchJournalEntries.mockResolvedValue({ count: 0, page: 1, page_size: 50, results: [] });
    fetchDocuments.mockResolvedValue({ count: 0, results: [] });
  });

  it('shows header, linked asset, and empty posted state', async () => {
    render(<CostCenterCard slug="finestar" costCenterId={18} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: '701 Audi A8 Lang 50 TDI' })).toBeInTheDocument());
    expect(screen.getByText(/Objektno/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Audi A8 Lang 50 TDI' })).toHaveAttribute(
      'href',
      '/t/finestar/imovina/4/dokumenti',
    );
    expect(screen.getByText(/Nema knjiženih RDG stavki s ovim MT/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'kartici imovine' })).toHaveAttribute(
      'href',
      '/t/finestar/imovina/4/dokumenti',
    );
    expect(fetchJournalEntries).toHaveBeenCalledWith(
      expect.any(String),
      'token',
      expect.objectContaining({ cost_center: 18 }),
    );
    expect(fetchDocuments).toHaveBeenCalledWith(
      expect.any(String),
      'token',
      expect.objectContaining({ cost_center: 18 }),
    );
  });

  it('links posted journal entries to the ledger', async () => {
    fetchCostCenterReport.mockResolvedValue({
      year: 2026,
      month: 9,
      cumulative: true,
      total: '120.00',
      assigned_total: '120.00',
      unassigned_total: '0.00',
      groups: [],
      results: [
        {
          cost_center_id: 18,
          code: '701',
          name: 'Audi A8 Lang 50 TDI',
          kind: 'object',
          parent_id: 7,
          total: '120.00',
          accounts: [{ account_code: '4100', account_name: 'Najam', account_class: '4', amount: '120.00' }],
        },
      ],
    });
    fetchJournalEntries.mockResolvedValue({
      count: 1,
      page: 1,
      page_size: 50,
      results: [
        {
          id: 91,
          entry_number: '202609-0041',
          entry_date: '2026-09-03',
          description: 'Servis',
          status: 'posted',
          is_auto: true,
          source_type: 'expense',
          total_debit: '120.00',
          total_credit: '120.00',
        },
      ],
    });
    render(<CostCenterCard slug="finestar" costCenterId={18} />);
    await waitFor(() => expect(screen.getByRole('link', { name: '202609-0041' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: '202609-0041' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/91',
    );
    expect(screen.getByText('4100')).toBeInTheDocument();
    expect(screen.queryByText(/Nema knjiženih RDG stavki/)).not.toBeInTheDocument();
  });
});
