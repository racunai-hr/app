import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      results: [{ id: 1, name: 'Ostalo', code: null, is_active: true, default_account: null }],
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
      code: null,
      is_active: true,
      default_account: { id: 11, code: '4100', name: 'Najam', active: true },
    });
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite />);
    const select = await screen.findByLabelText('Zadano konto za Ostalo');
    fireEvent.change(select, { target: { value: '11' } });
    await waitFor(() => {
      expect(patchExpenseCategoryDefaultAccount).toHaveBeenCalledWith(
        'http://api.test',
        'token',
        1,
        { default_account_id: 11 },
      );
    });
  });

  it('skips the write-only list without a write role', async () => {
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite={false} />);
    expect(await screen.findByRole('note')).toBeInTheDocument();
    expect(fetchExpenseCategories).not.toHaveBeenCalled();
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();
  });
});
