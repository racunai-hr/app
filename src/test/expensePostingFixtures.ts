import type { ExpensePostingPreview } from '@/lib/expensePosting';

export function samplePostingPreview(
  overrides: Partial<ExpensePostingPreview> = {},
): ExpensePostingPreview {
  return {
    category: { id: 1, name: 'Ostalo' },
    expense_account: {
      id: 10,
      code: '4120',
      name: 'Ostali nespomenuti rashodi',
      active: true,
    },
    account_source: 'posting_rule_fallback',
    warnings: [],
    can_approve: true,
    lines: [
      {
        amount_field: 'net_amount',
        description: 'Rashod',
        amount: '100.00',
        debit: { id: 10, code: '4120', name: 'Ostali nespomenuti rashodi', active: true },
        credit: { id: 20, code: '2200', name: 'Dobavljači', active: true },
        debit_cost_center: null,
        credit_cost_center: null,
      },
      {
        amount_field: 'tax_amount',
        description: 'Ulazni PDV',
        amount: '25.00',
        debit: { id: 30, code: '1400', name: 'Potrazivanja za PDV', active: true },
        credit: { id: 20, code: '2200', name: 'Dobavljači', active: true },
        debit_cost_center: null,
        credit_cost_center: null,
      },
    ],
    ...overrides,
  };
}
