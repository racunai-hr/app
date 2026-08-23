import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useParams: () => ({ slug: 'finestar' }),
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
      user: { id: 1, username: 'owner', email: '', is_superuser: false },
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
  };
});

const fetchExpenseCategories = vi.fn();
const fetchChartOfAccounts = vi.fn();
const patchExpenseCategoryDefaultAccount = vi.fn();

vi.mock('@/lib/expensePosting', async () => {
  const actual = await vi.importActual<typeof import('@/lib/expensePosting')>('@/lib/expensePosting');
  return {
    ...actual,
    fetchExpenseCategories: (...args: unknown[]) => fetchExpenseCategories(...args),
    fetchChartOfAccounts: (...args: unknown[]) => fetchChartOfAccounts(...args),
    patchExpenseCategoryDefaultAccount: (...args: unknown[]) =>
      patchExpenseCategoryDefaultAccount(...args),
  };
});

import { ExpenseCategorySettings } from './ExpenseCategorySettings';

describe('ExpenseCategorySettings', () => {
  beforeEach(() => {
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    patchExpenseCategoryDefaultAccount.mockReset();
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [{ id: 1, name: 'Ostalo', is_active: true, default_account: null }],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [{ id: 11, code: '4100', name: 'Najam', active: true }],
    });
  });

  it('patches only the category default account', async () => {
    patchExpenseCategoryDefaultAccount.mockResolvedValue({
      id: 1,
      name: 'Ostalo',
      is_active: true,
      default_account: { id: 11, code: '4100', name: 'Najam', active: true },
    });
    render(<ExpenseCategorySettings slug="finestar" />);
    const select = await screen.findByLabelText('Zadano konto za Ostalo');
    fireEvent.change(select, { target: { value: '11' } });
    await waitFor(() => {
      expect(patchExpenseCategoryDefaultAccount).toHaveBeenCalledWith(
        expect.any(String),
        'token',
        1,
        { default_account_id: 11 },
      );
    });
  });
});
