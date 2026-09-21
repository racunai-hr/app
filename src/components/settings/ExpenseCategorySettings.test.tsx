import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCOUNT_PICKER_DEBOUNCE_MS } from '@/components/finance/AccountPicker';

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

const ACCOUNT_4100 = { id: 11, code: '4100', name: 'Najam', active: true };
const ACCOUNT_4198 = {
  id: 38413,
  code: '4198',
  name: 'Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
  active: true,
};

async function searchAndSelectAccount(label: string | RegExp) {
  const input = screen.getByRole('combobox', { name: 'Zadano konto za Ostalo' });
  fireEvent.change(input, { target: { value: '4198' } });
  await waitFor(
    () => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    },
    { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 500 },
  );
  fireEvent.click(screen.getByRole('option', { name: label }));
}

describe('ExpenseCategorySettings', () => {
  beforeEach(() => {
    fetchExpenseCategories.mockReset();
    fetchChartOfAccounts.mockReset();
    patchExpenseCategoryDefaultAccount.mockReset();
    fetchExpenseCategories.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1,
          name: 'Ostalo',
          code: null,
          is_active: true,
          default_account: ACCOUNT_4100,
        },
      ],
    });
    fetchChartOfAccounts.mockResolvedValue({
      count: 1,
      results: [ACCOUNT_4198],
    });
  });

  it('shows the existing default account without searching the chart', async () => {
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite />);
    const input = await screen.findByRole('combobox', { name: 'Zadano konto za Ostalo' });
    await waitFor(() => {
      expect(input).toHaveValue('4100 · Najam');
    });
    expect(fetchExpenseCategories).toHaveBeenCalled();
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();
  });

  it('searches after one character and persists the selected AccountRef id', async () => {
    patchExpenseCategoryDefaultAccount.mockResolvedValue({
      id: 1,
      name: 'Ostalo',
      code: null,
      is_active: true,
      default_account: ACCOUNT_4198,
    });
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite />);
    const input = await screen.findByRole('combobox', { name: 'Zadano konto za Ostalo' });
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '4' } });
    await waitFor(
      () => {
        expect(fetchChartOfAccounts).toHaveBeenCalledWith(
          'http://api.test',
          'token',
          '4',
          expect.any(AbortSignal),
        );
      },
      { timeout: ACCOUNT_PICKER_DEBOUNCE_MS + 500 },
    );

    await searchAndSelectAccount(/4198/);
    await waitFor(() => {
      expect(patchExpenseCategoryDefaultAccount).toHaveBeenCalledWith(
        'http://api.test',
        'token',
        1,
        { default_account_id: 38413 },
      );
    });
    await waitFor(() => {
      expect(input).toHaveValue(
        '4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
      );
    });
  });

  it('clears the default account and then uses the backend response as canonical', async () => {
    patchExpenseCategoryDefaultAccount.mockResolvedValue({
      id: 1,
      name: 'Ostalo',
      code: null,
      is_active: true,
      default_account: null,
    });
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite />);
    const input = await screen.findByRole('combobox', { name: 'Zadano konto za Ostalo' });
    await waitFor(() => {
      expect(input).toHaveValue('4100 · Najam');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Očisti' }));
    await waitFor(() => {
      expect(patchExpenseCategoryDefaultAccount).toHaveBeenCalledWith(
        'http://api.test',
        'token',
        1,
        { default_account_id: null },
      );
    });
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
    expect(input).toHaveAttribute('placeholder', 'Nije zadano');
  });

  it('skips the write-only list without a write role', async () => {
    render(<ExpenseCategorySettings origin="http://api.test" token="token" canWrite={false} />);
    expect(await screen.findByRole('note')).toBeInTheDocument();
    expect(fetchExpenseCategories).not.toHaveBeenCalled();
    expect(fetchChartOfAccounts).not.toHaveBeenCalled();
  });
});
