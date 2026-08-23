import { ApiError, parseError as parseApiError } from './api';
import type { components } from './openapi/generated';

export type AccountRef = components['schemas']['AccountRef'];
export type ChartOfAccountsList = components['schemas']['ChartOfAccountsList'];
export type ConfirmInvoiceImportRequest = components['schemas']['ConfirmInvoiceImportRequest'];
export type ExpenseApproveResponse = components['schemas']['ExpenseApproveResponse'];
export type ExpenseCategory = components['schemas']['ExpenseCategory'];
export type ExpenseCategoryList = components['schemas']['ExpenseCategoryList'];
export type ExpensePostingPreview = components['schemas']['ExpensePostingPreview'];
export type PatchedExpenseCategoryPatchRequest =
  components['schemas']['PatchedExpenseCategoryPatchRequest'];
export type PatchedExpenseDraftPatchRequest =
  components['schemas']['PatchedExpenseDraftPatchRequest'];
export type PostingPlanLine = components['schemas']['PostingPlanLine'];

export const NOT_DRAFT_USER_MESSAGE =
  'Vrsta troška i konto su zaključani jer je nalog već odobren. Knjiženje ostaje nepromijenjeno.';

export const EXPENSE_ACCOUNT_SOURCE_LABELS: Record<string, string> = {
  manual_override: 'Ručno odabrano konto',
  category_default: 'Zadano konto vrste troška',
  partner_default: 'Zadana vrsta troška partnera',
  partner_history: 'Zadnja odobrena faktura partnera',
  posting_rule_fallback: 'Konto iz pravila knjiženja',
  fallback: 'Vrsta Ostalo',
};

export class FinanceApiError extends ApiError {
  code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message, status);
    this.name = 'FinanceApiError';
    this.code = code;
  }
}

export function isNotDraftConflict(err: unknown): boolean {
  return err instanceof FinanceApiError && err.status === 409 && err.code === 'not_draft';
}

export function accountSourceLabel(source: string | null | undefined): string {
  if (!source) return '—';
  return EXPENSE_ACCOUNT_SOURCE_LABELS[source] || source;
}

export function formatAccountOption(account: { code: string; name: string }): string {
  return `${account.code} · ${account.name}`;
}

async function authorized(
  origin: string,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${origin}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

async function parseFinanceError(response: Response): Promise<FinanceApiError> {
  try {
    const data = await response.json();
    if (data?.code && data?.detail) {
      return new FinanceApiError(String(data.detail), response.status, String(data.code));
    }
    if (data?.detail) {
      return new FinanceApiError(String(data.detail), response.status);
    }
  } catch {
    /* fall through */
  }
  return new FinanceApiError(await parseApiError(response), response.status);
}

export async function fetchChartOfAccounts(
  origin: string,
  token: string,
  search = '',
  signal?: AbortSignal,
): Promise<ChartOfAccountsList> {
  const params = new URLSearchParams();
  params.set('postable', '1');
  if (search.trim()) params.set('search', search.trim());
  const response = await authorized(
    origin,
    `/api/finance/chart-of-accounts/?${params}`,
    token,
    { signal },
  );
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}

export async function fetchExpenseCategories(
  origin: string,
  token: string,
  signal?: AbortSignal,
): Promise<ExpenseCategoryList> {
  const response = await authorized(origin, '/api/purchasing/expense-categories/', token, {
    signal,
  });
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}

export async function patchExpenseCategoryDefaultAccount(
  origin: string,
  token: string,
  categoryId: number,
  body: PatchedExpenseCategoryPatchRequest,
): Promise<ExpenseCategory> {
  const response = await authorized(
    origin,
    `/api/purchasing/expense-categories/${categoryId}/`,
    token,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}

export async function fetchExpensePostingPreview(
  origin: string,
  token: string,
  expenseId: number,
  signal?: AbortSignal,
): Promise<ExpensePostingPreview> {
  const response = await authorized(
    origin,
    `/api/finance/expenses/${expenseId}/posting-preview/`,
    token,
    { signal },
  );
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}

export async function patchDraftExpense(
  origin: string,
  token: string,
  expenseId: number,
  body: PatchedExpenseDraftPatchRequest,
): Promise<ExpenseApproveResponse> {
  const response = await authorized(origin, `/api/finance/expenses/${expenseId}/`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}

export async function approveExpense(
  origin: string,
  token: string,
  expenseId: number,
): Promise<ExpenseApproveResponse> {
  const response = await authorized(origin, `/api/finance/expenses/${expenseId}/approve/`, token, {
    method: 'POST',
  });
  if (!response.ok) throw await parseFinanceError(response);
  return response.json();
}
