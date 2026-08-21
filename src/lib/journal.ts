import { ApiError, parseError as parseApiError } from './api';
import type { components } from './openapi/generated';

export type JournalEntryListItem = components['schemas']['JournalEntryListItem'];
export type PaginatedJournalEntries = components['schemas']['PaginatedJournalEntries'];
export type JournalSourceType = components['schemas']['SourceTypeEnum'];
export type JournalStatus = components['schemas']['StatusEnum'];

export type JournalEntryListQuery = {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export const JOURNAL_STATUS_LABELS: Record<JournalStatus, string> = {
  draft: 'Nacrt',
  posted: 'Knjižena',
  reversed: 'Stornirana',
};

export const JOURNAL_SOURCE_LABELS: Record<JournalSourceType, string> = {
  invoice: 'Račun',
  expense: 'Trošak',
  manual: 'Ručno',
  asset: 'Imovina',
  other: 'Ostalo',
};

function labelOrRaw(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return map[value] || value;
}

export function journalStatusLabel(status: string | null | undefined): string {
  return labelOrRaw(JOURNAL_STATUS_LABELS, status);
}

export function journalSourceLabel(sourceType: string | null | undefined): string {
  return labelOrRaw(JOURNAL_SOURCE_LABELS, sourceType);
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

export async function fetchJournalEntries(
  origin: string,
  token: string,
  query: JournalEntryListQuery = {},
): Promise<PaginatedJournalEntries> {
  const params = buildParams({
    status: query.status,
    date_from: query.date_from,
    date_to: query.date_to,
    search: query.search,
    page: query.page || 1,
    page_size: query.page_size || 20,
  });
  const response = await authorized(origin, `/api/finance/journal-entries/?${params}`, token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}
