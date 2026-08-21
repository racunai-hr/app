import { ApiError, parseError as parseApiError } from './api';

export type DepositDto = {
  id: number;
  number: string;
  partner_id: number;
  partner_name: string;
  direction: string;
  amount: string;
  currency: string;
  deposit_date: string | null;
  workflow_status: string;
  operational_status: string;
  open_amount: string;
  reference: string;
  notes: string;
  return_date: string | null;
  return_bank_account_id: number | null;
  given_journal_entry_id: number | null;
  return_journal_entry_id: number | null;
  reverse_journal_entry_id: number | null;
  created_at: string | null;
};

export type DepositListResponse = {
  count: number;
  results: DepositDto[];
};

export type CreateDepositInput = {
  partner_id: number;
  amount: string;
  currency?: string;
  deposit_date: string;
  reference?: string;
  notes?: string;
};

export type ReturnDepositInput = {
  return_bank_account_id: number;
  return_date?: string;
  amount?: string;
};

export function canWriteFinance(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

async function authorized(origin: string, path: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(`${origin}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
}

export async function fetchDeposits(
  origin: string,
  token: string,
  partnerId?: number,
): Promise<DepositListResponse> {
  const params = new URLSearchParams();
  if (partnerId != null) params.set('partner_id', String(partnerId));
  const qs = params.toString();
  const response = await authorized(
    origin,
    `/api/finance/deposits/${qs ? `?${qs}` : ''}`,
    token,
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function createDeposit(
  origin: string,
  token: string,
  body: CreateDepositInput,
): Promise<DepositDto> {
  const response = await authorized(origin, '/api/finance/deposits/', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

async function depositAction(
  origin: string,
  token: string,
  depositId: number,
  action: 'post' | 'return' | 'reverse' | 'cancel',
  idempotencyKey: string | null,
  body?: unknown,
): Promise<DepositDto> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await authorized(origin, `/api/finance/deposits/${depositId}/${action}/`, token, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export function postDeposit(origin: string, token: string, depositId: number, key: string) {
  return depositAction(origin, token, depositId, 'post', key);
}

export function returnDeposit(
  origin: string,
  token: string,
  depositId: number,
  key: string,
  body: ReturnDepositInput,
) {
  return depositAction(origin, token, depositId, 'return', key, body);
}

export function reverseDeposit(origin: string, token: string, depositId: number, key: string) {
  return depositAction(origin, token, depositId, 'reverse', key);
}

export function cancelDeposit(origin: string, token: string, depositId: number) {
  return depositAction(origin, token, depositId, 'cancel', null);
}

export function depositWorkflowLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Nacrt',
    open: 'Otvoreno',
    returned: 'Vraćeno',
    reversed: 'Stornirano',
    cancelled: 'Otkazano',
  };
  return labels[status] || status;
}
