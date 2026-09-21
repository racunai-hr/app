import { ApiError, parseError as parseApiError } from './api';
import { tenantFetch } from './tenantRequest';

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

export type OfficialDocumentDto = {
  id: number;
  official_kind: 'tax_decision' | 'other';
  issuer_id: number;
  issuer_name: string;
  document_number: string;
  reference: string;
  issue_date: string | null;
  due_date: string | null;
  amount: string;
  currency: string;
  status: string;
  workflow_status: string;
  original_filename: string;
  has_file: boolean;
  related_fixed_asset_id: number | null;
  posting_profile_id: number | null;
  posting_profile_code: string | null;
  posting_profile_name: string | null;
  notes: string;
};

export type OfficialDocumentPostingProfileDto = {
  id: number;
  code: string;
  name: string;
  economic_effect: 'capitalize' | 'expense';
  allowed_kinds: string[];
  requires_fixed_asset: boolean;
  is_active: boolean;
};

export async function createOfficialDocument(
  origin: string,
  token: string,
  body: FormData,
): Promise<OfficialDocumentDto> {
  const response = await authorized(origin, '/api/finance/official-documents/', token, {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function cancelOfficialDocument(
  origin: string,
  token: string,
  documentId: number,
): Promise<OfficialDocumentDto> {
  const response = await authorized(
    origin,
    `/api/finance/official-documents/${documentId}/cancel/`,
    token,
    { method: 'POST' },
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function linkOfficialDocumentJournal(
  origin: string,
  token: string,
  documentId: number,
  journalEntryId: number,
): Promise<OfficialDocumentDto> {
  const response = await authorized(
    origin,
    `/api/finance/official-documents/${documentId}/link-journal/`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journal_entry_id: journalEntryId }),
    },
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchOfficialDocumentPostingProfiles(
  origin: string,
  token: string,
): Promise<OfficialDocumentPostingProfileDto[]> {
  const response = await authorized(
    origin,
    '/api/finance/official-document-posting-profiles/',
    token,
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function setOfficialDocumentPostingProfile(
  origin: string,
  token: string,
  documentId: number,
  postingProfileId: number,
): Promise<OfficialDocumentDto> {
  const response = await authorized(
    origin,
    `/api/finance/official-documents/${documentId}/posting-profile/`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posting_profile_id: postingProfileId }),
    },
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function postOfficialDocument(
  origin: string,
  token: string,
  documentId: number,
  idempotencyKey: string,
): Promise<OfficialDocumentDto> {
  const response = await authorized(
    origin,
    `/api/finance/official-documents/${documentId}/post/`,
    token,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

async function authorized(origin: string, path: string, token: string, init?: RequestInit): Promise<Response> {
  return tenantFetch(`${origin}${path}`, {
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

export type PrivateFundsClaimDto = {
  id: number;
  number: string;
  claim_type: string;
  partner_id: number;
  partner_name: string;
  amount: string;
  currency: string;
  claim_date: string | null;
  status: string;
  operational_status: string;
  open_amount: string;
  reference: string;
  notes: string;
  related_type: string;
  related_id: number;
  journal_entry_id: number | null;
  created_at: string | null;
};

export type CreatePrivateFundsClaimInput = {
  partner_id: number;
  claim_type: 'supplier_payment' | 'deposit_funding';
  amount: string;
  currency?: string;
  claim_date: string;
  related_type: 'expense' | 'deposit';
  related_id: number;
  reference?: string;
  notes?: string;
};

export async function createPrivateFundsClaim(
  origin: string,
  token: string,
  body: CreatePrivateFundsClaimInput,
  idempotencyKey: string,
): Promise<PrivateFundsClaimDto> {
  const response = await authorized(origin, '/api/finance/private-funds-claims/', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      currency: 'EUR',
      ...body,
    }),
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function postPrivateFundsClaim(
  origin: string,
  token: string,
  claimId: number,
  idempotencyKey: string,
): Promise<PrivateFundsClaimDto> {
  const response = await authorized(
    origin,
    `/api/finance/private-funds-claims/${claimId}/post/`,
    token,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
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
