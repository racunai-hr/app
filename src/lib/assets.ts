import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';
import type { components } from './openapi/generated';

export { tenantApiOrigin };

export type FixedAssetListItem = components['schemas']['FixedAssetListItem'];
export type FixedAssetDetail = components['schemas']['FixedAssetDetail'];
export type PaginatedFixedAssets = components['schemas']['PaginatedFixedAssets'];
export type DepreciationScheduleItem = components['schemas']['DepreciationScheduleItem'];
export type DepreciationScheduleList = components['schemas']['DepreciationScheduleList'];
export type AssetJournalEntry = components['schemas']['AssetJournalEntry'];
export type AssetJournalEntryList = components['schemas']['AssetJournalEntryList'];
export type CapitalizationReconciliation = components['schemas']['CapitalizationReconciliation'];

export type FixedAssetListQuery = {
  status?: string;
  origin?: string;
  search?: string;
  page?: number;
};

export const FIXED_ASSET_STATUS_LABELS: Record<string, string> = {
  in_preparation: 'U pripremi',
  active: 'Aktivno',
  disposed: 'Otpisano',
};

export const ASSET_ORIGIN_LABELS: Record<string, string> = {
  purchase: 'Nabava',
  opening_balance: 'Početno stanje',
};

export const DEPRECIATION_METHOD_LABELS: Record<string, string> = {
  linear: 'Linearna',
};

export const ASSET_JOURNAL_ROLE_LABELS: Record<string, string> = {
  purchase: 'Nabava',
  dependent_cost: 'Ovisni trošak',
  payment: 'Plaćanje',
  activation: 'Aktivacija',
  depreciation: 'Amortizacija',
  disposal: 'Otpis',
  other: 'Ostalo',
};

function labelOrRaw(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return map[value] || value;
}

export function fixedAssetStatusLabel(status: string | null | undefined): string {
  return labelOrRaw(FIXED_ASSET_STATUS_LABELS, status);
}

export function assetOriginLabel(origin: string | null | undefined): string {
  return labelOrRaw(ASSET_ORIGIN_LABELS, origin);
}

export function depreciationMethodLabel(method: string | null | undefined): string {
  return labelOrRaw(DEPRECIATION_METHOD_LABELS, method);
}

export function formatDepreciationPeriod(year: number, month: number): string {
  return `${String(month).padStart(2, '0')}.${year}.`;
}

export function assetJournalRoleLabel(role: string | null | undefined): string {
  return labelOrRaw(ASSET_JOURNAL_ROLE_LABELS, role);
}

export function journalAuditStatusLabel(
  auditKind: string | null | undefined,
  status: string | null | undefined,
): string {
  if (auditKind === 'reversed') return 'Stornirana';
  if (auditKind === 'storno') return 'Storno';
  if (status === 'posted') return 'Knjižena';
  if (status === 'reversed') return 'Stornirana';
  return status || '—';
}

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

export async function fetchFixedAssets(
  origin: string,
  token: string,
  query: FixedAssetListQuery = {},
): Promise<PaginatedFixedAssets> {
  const params = buildParams({
    status: query.status,
    origin: query.origin,
    search: query.search,
    page: query.page || 1,
  });
  const response = await authorized(origin, `/api/assets/fixed-assets/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchFixedAsset(
  origin: string,
  token: string,
  id: number,
): Promise<FixedAssetDetail> {
  const response = await authorized(origin, `/api/assets/fixed-assets/${id}/`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchDepreciationSchedule(
  origin: string,
  token: string,
  id: number,
): Promise<DepreciationScheduleList> {
  const response = await authorized(
    origin,
    `/api/assets/fixed-assets/${id}/depreciation-schedule/`,
    token,
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchAssetJournalEntries(
  origin: string,
  token: string,
  id: number,
): Promise<AssetJournalEntryList> {
  const response = await authorized(
    origin,
    `/api/assets/fixed-assets/${id}/journal-entries/`,
    token,
  );
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}
