import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/t/finestar/postavke';
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ slug: 'finestar' }),
  usePathname: () => pathname,
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

let role = 'owner';

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
            role,
            is_default: true,
            admin_url: 'https://finestar-stage.racunai.hr/admin/',
          },
        ],
        platform_admin_url: 'https://admin.racunai.hr/admin/',
      }),
    ),
  };
});

const fetchExpenseCategories = vi.fn();
const fetchChartOfAccounts = vi.fn();

vi.mock('@/lib/expensePosting', async () => {
  const actual = await vi.importActual<typeof import('@/lib/expensePosting')>('@/lib/expensePosting');
  return {
    ...actual,
    fetchExpenseCategories: (...args: unknown[]) => fetchExpenseCategories(...args),
    fetchChartOfAccounts: (...args: unknown[]) => fetchChartOfAccounts(...args),
  };
});

const fetchCostCenters = vi.fn();

vi.mock('@/lib/costCenters', async () => {
  const actual = await vi.importActual<typeof import('@/lib/costCenters')>('@/lib/costCenters');
  return {
    ...actual,
    fetchCostCenters: (...args: unknown[]) => fetchCostCenters(...args),
  };
});

import { CostCentersRoute, ExpenseCategoriesRoute, SettingsOverviewRoute } from './routes';

const WRITE_ROLES = ['owner', 'accountant'] as const;

describe('settings routes', () => {
  beforeEach(() => {
    role = 'owner';
    pathname = '/t/finestar/postavke';
    replace.mockReset();
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    fetchCostCenters.mockReset();
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [{ id: 1, name: 'Ostalo', code: null, is_active: true, default_account: null }],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [{ id: 11, code: '4100', name: 'Najam', active: true }],
    });
    fetchCostCenters.mockResolvedValue({
      count: 2,
      results: [
        { id: 5, code: '1', name: 'Ugostiteljstvo', kind: 'group', notes: '', parent: null },
        { id: 6, code: '110', name: 'Kuhinja', kind: 'location', notes: '', parent: null },
      ],
    });
  });

  it.each(['owner', 'accountant', 'viewer'])('keeps the subnav on the overview for %s', async (r) => {
    role = r;
    render(<SettingsOverviewRoute />);
    expect(await screen.findByRole('navigation', { name: 'Postavke tvrtke' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Šifarnici' })).toBeInTheDocument();
    expect(screen.getByText(/Šifarnik mjesta troška/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['owner', 'accountant', 'viewer'])('renders the cost center codebook for %s', async (r) => {
    role = r;
    pathname = '/t/finestar/postavke/mjesta-troska';
    render(<CostCentersRoute />);
    expect(await screen.findByText('Kuhinja')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Postavke tvrtke' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(WRITE_ROLES)('offers the cost center create form to %s', async (r) => {
    role = r;
    pathname = '/t/finestar/postavke/mjesta-troska';
    render(<CostCentersRoute />);
    expect(await screen.findByRole('button', { name: 'Dodaj' })).toBeInTheDocument();
  });

  it('hides the cost center create form from a viewer', async () => {
    role = 'viewer';
    pathname = '/t/finestar/postavke/mjesta-troska';
    render(<CostCentersRoute />);
    expect(await screen.findByText('Kuhinja')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dodaj' })).not.toBeInTheDocument();
  });

  it.each(WRITE_ROLES)('loads expense categories for %s', async (r) => {
    role = r;
    pathname = '/t/finestar/postavke/vrste-troska';
    render(<ExpenseCategoriesRoute />);
    expect(await screen.findByLabelText('Zadano konto za Ostalo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Postavke tvrtke' })).toBeInTheDocument();
  });

  it('shows a scoped notice on expense categories for a viewer without breaking the shell', async () => {
    role = 'viewer';
    pathname = '/t/finestar/postavke/vrste-troska';
    render(<ExpenseCategoriesRoute />);
    expect(await screen.findByRole('note')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Postavke tvrtke' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(fetchExpenseCategories).not.toHaveBeenCalled();
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
