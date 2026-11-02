import { ApiError, parseError as parseApiError } from './api';
import { tenantFetch } from './tenantRequest';

export type CloseDraftLine = {
  position: number;
  description: string;
  account_id: number | null;
  account_code: string;
  account_name: string;
  source: string;
};

export type CloseDraftPayment = {
  id: number;
  transaction_date: string;
  amount: string;
  currency: string;
  counterparty_name: string;
  description: string;
  reference: string;
  match_score: number;
  match_reasons: string[];
  recommended: boolean;
};

export type CloseDraftPreview = {
  remembered: boolean;
  lines: CloseDraftLine[];
  payments: CloseDraftPayment[];
};

export type CloseDraftResult = {
  expense_id: number;
  status: string;
  bank_transaction_id: number;
  match_status: string;
  subledger_status: string;
};

async function authorized(origin: string, path: string, token: string, init: RequestInit = {}) {
  return tenantFetch(`${origin}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (data?.detail) return JSON.stringify(data.detail);
  } catch {
    /* fall through */
  }
  return parseApiError(response);
}

export async function fetchCloseDraftPreview(
  origin: string,
  token: string,
  expenseId: number,
): Promise<CloseDraftPreview> {
  const response = await authorized(origin, `/api/banking/expenses/${expenseId}/close-candidates/`, token);
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
}

export type PrepaymentChoice = { value: string; label: string };

export type PrepaymentCandidate = {
  id: number;
  posting_date: string;
  original_amount: string;
  available_amount: string;
  currency: string;
  purchase_nature: string;
  vat_treatment: string;
  account_code: string;
};

export type PrepaymentCandidateList = {
  supplier_id: number | null;
  currency: string;
  ubl_prepaid_amount: string | null;
  ubl_payable_amount: string | null;
  purchase_natures: PrepaymentChoice[];
  vat_treatments: PrepaymentChoice[];
  prepayments: PrepaymentCandidate[];
};

export async function fetchPrepaymentCandidates(
  origin: string,
  token: string,
  expenseId: number,
): Promise<PrepaymentCandidateList> {
  const response = await authorized(
    origin,
    `/api/finance/payables/expense/${expenseId}/prepayment-candidates/`,
    token,
  );
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
}

export async function postSupplierPrepayment(
  origin: string,
  token: string,
  bankTransactionId: number,
  idempotencyKey: string,
  body: { partner_id: number; purchase_nature: string; vat_treatment: string },
): Promise<{ id: number; original_amount: string }> {
  const response = await authorized(
    origin,
    `/api/banking/transactions/${bankTransactionId}/supplier-prepayment/`,
    token,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
}

export async function applyExpensePrepayments(
  origin: string,
  token: string,
  expenseId: number,
  idempotencyKey: string,
  body: {
    applications: Array<{ prepayment_id: number; amount: string }>;
    remember: boolean;
    lines?: Array<{ position: number; account_id: number }>;
    answers?: Record<string, string | number | boolean | null>;
  },
): Promise<{ status: string; subledger_status: string }> {
  const response = await authorized(
    origin,
    `/api/finance/payables/expense/${expenseId}/apply-prepayments/`,
    token,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
}

export async function closeDraftFromBank(
  origin: string,
  token: string,
  expenseId: number,
  idempotencyKey: string,
  body: {
    bank_transaction_id: number;
    remember: boolean;
    lines?: Array<{ position: number; account_id: number }>;
    answers?: Record<string, string | number | boolean | null>;
  },
): Promise<CloseDraftResult> {
  const response = await authorized(origin, `/api/banking/expenses/${expenseId}/close-from-bank/`, token, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
}
