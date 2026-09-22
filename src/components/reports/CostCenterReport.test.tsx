import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const fetchCostCenterReport = vi.fn();

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
    fetchCostCenterReport: (...args: unknown[]) => fetchCostCenterReport(...args),
  };
});

import { CostCenterReportView } from './CostCenterReport';

describe('CostCenterReportView', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchCostCenterReport.mockReset();
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
        },
        {
          cost_center_id: null,
          code: '',
          name: 'Bez MT',
          kind: '',
          parent_id: null,
          total: '0.00',
        },
      ],
    });
  });

  it('links named cost centers to the MT card', async () => {
    render(<CostCenterReportView slug="finestar" />);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Audi A8 Lang 50 TDI' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Audi A8 Lang 50 TDI' })).toHaveAttribute(
      'href',
      '/t/finestar/izvjestaji/mjesta-troska/18',
    );
    expect(screen.getByText('Bez MT').closest('a')).toBeNull();
  });
});
