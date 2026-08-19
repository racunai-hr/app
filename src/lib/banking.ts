import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';
import type { components } from './openapi/generated';

export { tenantApiOrigin };

export type BalanceDto = components['schemas']['Balance'];
export type ConnectionSummary = components['schemas']['ConnectionSummary'] | null;
export type BankAccountDto = components['schemas']['BankAccount'];
export type BankingOverviewResponse = components['schemas']['BankingOverview'];
export type StatementDto = components['schemas']['StatementListItem'];
export type TransactionDto = components['schemas']['Transaction'];
export type PaymentOrderDto = components['schemas']['PaymentOrder'];
export type ImportRunCreateResponse = components['schemas']['ImportRunCreateResponse'];
export type ImportRunDetail = components['schemas']['ImportRunDetail'];

export type Paginated<T> = {
  as_of: string;
  count: number;
  page: number;
  page_size: number;
  results: T[];
};

export type StatementListQuery = {
  bank_account?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type TransactionListQuery = {
  bank_account?: string;
  statement?: string;
  match_status?: string;
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type PaymentOrderListQuery = {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type BankAccountListQuery = {
  page?: number;
  page_size?: number;
};

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

function buildParams(entries: Record<string, string | number | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  return params;
}

export function maskIban(iban: string | null | undefined): string {
  const raw = (iban || '').replace(/\s/g, '');
  if (!raw) return '—';
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 4)}${'*'.repeat(raw.length - 8)}${raw.slice(-4)}`;
}

export async function fetchBankingOverview(
  origin: string,
  token: string,
): Promise<BankingOverviewResponse> {
  const response = await authorized(origin, '/api/banking/overview/', token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchBankAccounts(
  origin: string,
  token: string,
  query: BankAccountListQuery = {},
): Promise<Paginated<BankAccountDto>> {
  const params = buildParams({
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/banking/bank-accounts/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchStatements(
  origin: string,
  token: string,
  query: StatementListQuery = {},
): Promise<Paginated<StatementDto>> {
  const params = buildParams({
    bank_account: query.bank_account,
    status: query.status,
    date_from: query.date_from,
    date_to: query.date_to,
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/banking/statements/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchTransactions(
  origin: string,
  token: string,
  query: TransactionListQuery = {},
): Promise<Paginated<TransactionDto>> {
  const params = buildParams({
    bank_account: query.bank_account,
    statement: query.statement,
    match_status: query.match_status,
    transaction_type: query.transaction_type,
    date_from: query.date_from,
    date_to: query.date_to,
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/banking/transactions/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchPaymentOrders(
  origin: string,
  token: string,
  query: PaymentOrderListQuery = {},
): Promise<Paginated<PaymentOrderDto>> {
  const params = buildParams({
    status: query.status,
    date_from: query.date_from,
    date_to: query.date_to,
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/banking/payment-orders/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function createStatementImport(
  origin: string,
  token: string,
  file: File,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<ImportRunCreateResponse> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${origin}/api/banking/statement-imports/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey,
    },
    body,
    signal,
  });
  if (response.status === 202) return response.json();
  throw new ApiError(await parseApiError(response), response.status);
}

export async function fetchStatementImport(
  origin: string,
  token: string,
  id: number,
  signal?: AbortSignal,
): Promise<ImportRunDetail> {
  const response = await authorized(origin, `/api/banking/statement-imports/${id}/`, token, {
    signal,
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}
