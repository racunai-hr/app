import { API_URL, ApiError, parseError as parseApiError } from './api';
import type { Provenance } from './provenance';

export type DocumentDirection = 'incoming' | 'outgoing';

export type DocumentAmounts = {
  currency: string;
  net: string | null;
  vat: string | null;
  gross: string | null;
  fx_rate: Provenance;
};

export type DocumentSummary = {
  id: number;
  direction: DocumentDirection;
  internal_number: string | null;
  source_number: string | null;
  partner_name: string | null;
  partner_oib: string | null;
  document_date: string | null;
  due_date: string | null;
  document_status: Provenance;
  operational_status: Provenance;
  posting: { state: Provenance };
  subledger: { state: Provenance; open_amount: Provenance };
  vat: { lifecycle: Provenance; period?: Provenance; disclaimer: string | null };
  eracun: { as4_status: Provenance; source: Provenance };
  controls: string[];
  notices: string[];
  amounts: DocumentAmounts;
};

export type CurrencyKpi = {
  outgoing_count: number;
  incoming_count: number;
  outgoing_gross: string;
  incoming_gross: string;
  open_receivables: string;
  open_payables: string;
};

export type DocumentListResponse = {
  as_of: string;
  count: number;
  page: number;
  page_size: number;
  results: DocumentSummary[];
  summary: { by_currency: Record<string, CurrencyKpi> };
};

export type DocumentListQuery = {
  direction?: DocumentDirection | '';
  view?: string;
  search?: string;
  year?: string;
  month?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  partner?: number | string;
  page?: number;
  page_size?: number;
};

export function tenantApiOrigin(adminUrl: string): string {
  try {
    return new URL(adminUrl).origin;
  } catch {
    return API_URL;
  }
}

export function buildDocumentQuery(query: DocumentListQuery, options?: { includePage?: boolean }): URLSearchParams {
  const params = new URLSearchParams();
  const includePage = options?.includePage !== false;
  if (query.direction === 'incoming' || query.direction === 'outgoing') {
    params.set('direction', query.direction);
  }
  if (query.view) params.set('view', query.view);
  if (query.search) params.set('search', query.search);
  if (query.year) params.set('year', query.year);
  if (query.month) params.set('month', query.month);
  if (query.status) params.set('status', query.status);
  if (query.date_from) params.set('date_from', query.date_from);
  if (query.date_to) params.set('date_to', query.date_to);
  if (query.partner !== undefined && query.partner !== '') {
    params.set('partner', String(query.partner));
  }
  if (includePage) {
    params.set('page', String(query.page || 1));
    params.set('page_size', String(query.page_size || 20));
  }
  return params;
}

async function authorized(origin: string, path: string, token: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${origin}${path}`, {
    ...init,
    headers: {
      Accept: (init?.headers as Record<string, string> | undefined)?.Accept || 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  return response;
}

export async function fetchDocuments(
  origin: string,
  token: string,
  query: DocumentListQuery,
): Promise<DocumentListResponse> {
  const params = buildDocumentQuery(query);
  const response = await authorized(origin, `/api/documents/?${params}`, token);
  if (!response.ok) {
    throw new ApiError(await parseApiError(response), response.status);
  }
  return response.json();
}

export async function exportDocuments(
  origin: string,
  token: string,
  query: DocumentListQuery,
  format: 'csv' | 'xlsx',
): Promise<{ blob: Blob; filename: string }> {
  const params = buildDocumentQuery(query, { includePage: false });
  params.set('format', format);
  const accept =
    format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';
  const response = await authorized(origin, `/api/documents/export/?${params}`, token, {
    headers: { Accept: accept },
  });
  if (!response.ok) {
    throw new ApiError(await parseApiError(response), response.status);
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  const filename = match?.[1] || `documents.${format}`;
  return { blob: await response.blob(), filename };
}
