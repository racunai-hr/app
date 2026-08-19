import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';

export { tenantApiOrigin };

export type BalanceDto = {
  balance_type: string;
  amount: string;
  currency: string;
  as_of: string;
  source: string;
  is_stale: boolean;
};

export type ConnectionSummary = {
  id: number;
  status: string;
  provider_code: string | null;
  last_sync_at: string | null;
} | null;

export type BankAccountDto = {
  id: number;
  account_name: string;
  bank_name: string;
  account_number: string;
  iban: string;
  currency: string;
  status: string;
  is_active: boolean;
  connection: ConnectionSummary;
  balances: BalanceDto[];
};

export type BankingOverviewResponse = {
  as_of: string;
  accounts: BankAccountDto[];
  account_count_by_currency: Record<string, number>;
  unmatched_transaction_count: number;
  suggested_transaction_count: number;
  statement_count: number;
};

export type Paginated<T> = {
  as_of: string;
  count: number;
  page: number;
  page_size: number;
  results: T[];
};

export type StatementDto = {
  id: number;
  statement_number: string;
  bank_account_id: number;
  statement_date: string;
  opening_balance: string;
  closing_balance: string;
  status: string;
  currency: string | null;
  imported_at: string | null;
  reconciled_at: string | null;
  transaction_count: number | null;
};

export type TransactionDto = {
  id: number;
  bank_statement_id: number;
  bank_account_id: number | null;
  transaction_date: string;
  value_date: string | null;
  amount: string;
  currency: string;
  transaction_type: string;
  description: string;
  reference: string;
  counterparty_name: string;
  counterparty_iban: string;
  external_id: string;
  match_status: string;
  matched_payment_id: number | null;
  matched_journal_entry_id: number | null;
};

export type PaymentOrderDto = {
  id: number;
  status: string;
  amount: string;
  currency: string;
  debtor_iban: string;
  creditor_iban: string;
  creditor_name: string;
  reference: string;
  created_at: string | null;
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

async function authorized(origin: string, path: string, token: string): Promise<Response> {
  return fetch(`${origin}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
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
