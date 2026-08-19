import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';
import type { components } from './openapi/generated';

export { tenantApiOrigin };

export type PartnerListItem = components['schemas']['PartnerListItem'];
export type PartnerDto = components['schemas']['Partner'];
export type PartnerContact = components['schemas']['Contact'];
export type PartnerBankAccount = components['schemas']['PartnerBankAccount'];
export type PartnerFinancialSummary = components['schemas']['PartnerFinancialSummary'];
export type PartnerSubledgerList = components['schemas']['PartnerSubledgerList'];

export type PaginatedPartners = components['schemas']['PaginatedPartners'];
export type ContactList = components['schemas']['ContactList'];
export type PartnerBankAccountList = components['schemas']['PartnerBankAccountList'];

export type PartnerListQuery = {
  filter?: 'all' | 'inactive' | '';
  partner_type?: string;
  status?: string;
  jurisdiction?: 'HR' | 'EU' | 'NON_EU' | '';
  search?: string;
  page?: number;
  page_size?: number;
};

export type PartnerConflict = {
  code: string;
  field: string;
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
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
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

async function parseConflict(response: Response): Promise<PartnerConflict | null> {
  try {
    const data = await response.clone().json();
    if (data && typeof data.code === 'string' && typeof data.field === 'string') {
      return { code: data.code, field: data.field };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export class PartnerApiError extends ApiError {
  conflict: PartnerConflict | null;

  constructor(message: string, status: number, conflict: PartnerConflict | null = null) {
    super(message, status);
    this.conflict = conflict;
  }
}

async function raise(response: Response): Promise<never> {
  const conflict = response.status === 409 ? await parseConflict(response) : null;
  throw new PartnerApiError(await parseApiError(response), response.status, conflict);
}

export async function fetchPartners(
  origin: string,
  token: string,
  query: PartnerListQuery = {},
): Promise<PaginatedPartners> {
  const params = buildParams({
    filter: query.filter,
    partner_type: query.partner_type,
    status: query.status,
    jurisdiction: query.jurisdiction,
    search: query.search,
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/partners/?${params}`, token);
  if (!response.ok) await raise(response);
  return response.json();
}

export async function fetchPartner(origin: string, token: string, id: number): Promise<PartnerDto> {
  const response = await authorized(origin, `/api/partners/${id}/`, token);
  if (!response.ok) await raise(response);
  return response.json();
}

export async function createPartner(
  origin: string,
  token: string,
  body: Record<string, unknown>,
): Promise<PartnerDto> {
  const response = await authorized(origin, '/api/partners/', token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) await raise(response);
  return response.json();
}

export async function patchPartner(
  origin: string,
  token: string,
  id: number,
  body: Record<string, unknown>,
): Promise<PartnerDto> {
  const response = await authorized(origin, `/api/partners/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!response.ok) await raise(response);
  return response.json();
}

export async function fetchPartnerContacts(
  origin: string,
  token: string,
  partnerId: number,
): Promise<ContactList> {
  const response = await authorized(origin, `/api/partners/${partnerId}/contacts/`, token);
  if (!response.ok) await raise(response);
  return response.json();
}

export async function createPartnerContact(
  origin: string,
  token: string,
  partnerId: number,
  body: Record<string, unknown>,
): Promise<PartnerContact> {
  const response = await authorized(origin, `/api/partners/${partnerId}/contacts/`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) await raise(response);
  return response.json();
}

export async function patchPartnerContact(
  origin: string,
  token: string,
  partnerId: number,
  contactId: number,
  body: Record<string, unknown>,
): Promise<PartnerContact> {
  const response = await authorized(
    origin,
    `/api/partners/${partnerId}/contacts/${contactId}/`,
    token,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
  if (!response.ok) await raise(response);
  return response.json();
}

export async function deletePartnerContact(
  origin: string,
  token: string,
  partnerId: number,
  contactId: number,
): Promise<void> {
  const response = await authorized(
    origin,
    `/api/partners/${partnerId}/contacts/${contactId}/`,
    token,
    { method: 'DELETE' },
  );
  if (!response.ok) await raise(response);
}

export async function fetchPartnerBankAccounts(
  origin: string,
  token: string,
  partnerId: number,
): Promise<PartnerBankAccountList> {
  const response = await authorized(origin, `/api/partners/${partnerId}/bank-accounts/`, token);
  if (!response.ok) await raise(response);
  return response.json();
}

export async function createPartnerBankAccount(
  origin: string,
  token: string,
  partnerId: number,
  body: Record<string, unknown>,
): Promise<PartnerBankAccount> {
  const response = await authorized(origin, `/api/partners/${partnerId}/bank-accounts/`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) await raise(response);
  return response.json();
}

export async function patchPartnerBankAccount(
  origin: string,
  token: string,
  partnerId: number,
  accountId: number,
  body: Record<string, unknown>,
): Promise<PartnerBankAccount> {
  const response = await authorized(
    origin,
    `/api/partners/${partnerId}/bank-accounts/${accountId}/`,
    token,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
  if (!response.ok) await raise(response);
  return response.json();
}

export async function deletePartnerBankAccount(
  origin: string,
  token: string,
  partnerId: number,
  accountId: number,
): Promise<void> {
  const response = await authorized(
    origin,
    `/api/partners/${partnerId}/bank-accounts/${accountId}/`,
    token,
    { method: 'DELETE' },
  );
  if (!response.ok) await raise(response);
}

export async function fetchPartnerFinancialSummary(
  origin: string,
  token: string,
  partnerId: number,
): Promise<PartnerFinancialSummary> {
  const response = await authorized(
    origin,
    `/api/finance/partners/${partnerId}/financial-summary/`,
    token,
  );
  if (!response.ok) await raise(response);
  return response.json();
}

export async function fetchPartnerSubledger(
  origin: string,
  token: string,
  partnerId: number,
): Promise<PartnerSubledgerList> {
  const response = await authorized(origin, `/api/finance/partners/${partnerId}/subledger/`, token);
  if (!response.ok) await raise(response);
  return response.json();
}

export function partnerTypeLabel(value: string): string {
  switch (value) {
    case 'customer':
      return 'Kupac';
    case 'supplier':
      return 'Dobavljač';
    case 'both':
      return 'Kupac i dobavljač';
    case 'other':
      return 'Ostalo';
    default:
      return value;
  }
}

export function partnerStatusLabel(value: string): string {
  switch (value) {
    case 'active':
      return 'Aktivan';
    case 'inactive':
      return 'Neaktivan';
    case 'blocked':
      return 'Blokiran';
    case 'prospect':
      return 'Potencijalni';
    default:
      return value;
  }
}

export function partnerTaxLabel(jurisdiction?: string): string {
  switch (jurisdiction) {
    case 'HR':
      return 'OIB';
    case 'EU':
      return 'Porezni broj';
    case 'NON_EU':
      return 'Porezni broj';
    default:
      return 'Porezni broj';
  }
}

export function partnerVatLabel(jurisdiction?: string): string {
  return jurisdiction === 'HR' ? 'PDV broj' : 'VAT ID';
}

export function partnerJurisdictionLabel(value?: string): string {
  switch (value) {
    case 'HR':
      return 'Hrvatska';
    case 'EU':
      return 'EU';
    case 'NON_EU':
      return 'Ostale zemlje';
    default:
      return value || '';
  }
}

export function canWritePartners(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}
