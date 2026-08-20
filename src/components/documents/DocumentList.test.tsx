import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDocument } from '@/test/documentFixtures';

const replace = vi.fn();
const router = { replace };
const exportDocuments = vi.fn();
const searchParams = new URLSearchParams();

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
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

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocuments: vi.fn().mockResolvedValue({
      as_of: '2026-08-19T10:00:00Z',
      count: 1,
      page: 1,
      page_size: 20,
      results: [sampleDocument()],
      summary: {
        by_currency: {
          EUR: {
            outgoing_count: 1,
            incoming_count: 0,
            outgoing_gross: '125.00',
            incoming_gross: '0.00',
            open_receivables: '120.00',
            open_payables: '0.00',
          },
        },
      },
    }),
    exportDocuments: (...args: unknown[]) => exportDocuments(...args),
  };
});

import { DocumentList } from './DocumentList';

describe('DocumentList', () => {
  beforeEach(() => {
    replace.mockReset();
    exportDocuments.mockReset();
  });

  it('shows tabs, KPI, controls and export without write or detail actions', async () => {
    const { container } = render(<DocumentList slug="finestar" />);
    await waitFor(() => {
      expect(screen.getByTestId('document-kpi')).toBeInTheDocument();
    });
    expect(screen.getByText('Saldakonti — FineStar')).toBeInTheDocument();
    expect(screen.getByText('Pregled ulaznih i izlaznih računa te otvorenih stavaka.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Svi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Izlazni' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ulazni' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XLSX' })).toBeInTheDocument();
    expect(screen.getByLabelText('Od datuma')).toHaveAttribute('placeholder', 'dd.mm.gggg.');
    expect(screen.getByLabelText('Do datuma')).toHaveAttribute('placeholder', 'dd.mm.gggg.');
    expect(screen.queryByLabelText('Od datuma')?.getAttribute('type')).not.toBe('date');
    expect(screen.getByText('Plaćen bez saldakonta')).toBeInTheDocument();
    expect(screen.getByText('nije dokazivo')).toHaveAttribute('data-tone', 'unknown');
    expect(screen.getByText('Status dokumenta: Poslan')).toBeInTheDocument();
    expect(screen.getByText('19. 8. 2026. u 12:00')).toBeInTheDocument();
    expect(container.querySelector('a[href*="/saldakonti/"]')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Učitaj račun' })).toBeNull();
    expect(screen.queryByRole('button', { name: /spremi|obriši|pošalji/i })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
    expect(screen.queryByText('Otvori admin')).toBeNull();
  });
});
