import { API_URL, ApiError, parseError as parseApiError } from './api';
import type { components } from './openapi/generated';
import type { Provenance } from './provenance';

export type DocumentDirection = 'incoming' | 'outgoing' | 'deposit';
export type DocumentKind = 'invoice' | 'expense' | 'deposit';

/** Incoming/outgoing detail payload — OpenAPI SSOT (PR A fields included). */
export type DocumentDetail = components['schemas']['DocumentDetail'];

export type DocumentAmounts = {
  currency: string;
  net: string | null;
  vat: string | null;
  gross: string | null;
  fx_rate: Provenance;
};

export type DocumentSummary = {
  id: number;
  kind?: DocumentKind;
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

export type DocumentDetailItem = {
  item_name: string;
  quantity: string | null;
  unit_price: string | null;
  tax_rate: string | null;
  vat_procedure?: string | null;
  line_total: string | null;
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
  // Local WSL: ignore remote admin_url origin so evidence endpoints hit local API.
  const override = process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE || '';
  if (override) {
    try {
      return new URL(override).origin;
    } catch {
      /* fall through */
    }
  }
  try {
    return new URL(adminUrl).origin;
  } catch {
    return API_URL;
  }
}

export function buildDocumentQuery(query: DocumentListQuery, options?: { includePage?: boolean }): URLSearchParams {
  const params = new URLSearchParams();
  const includePage = options?.includePage !== false;
  if (query.direction === 'incoming' || query.direction === 'outgoing' || query.direction === 'deposit') {
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

function filenameFromDisposition(disposition: string | null, fallback: string): string {
  const match = (disposition || '').match(/filename="([^"]+)"/i);
  return match?.[1] || fallback;
}

/** Trigger a browser download and always revoke the object URL. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function downloadAuthorizedBlob(
  origin: string,
  path: string,
  token: string,
  options: { accept: string; fallbackFilename: string },
): Promise<void> {
  const response = await authorized(origin, path, token, {
    headers: { Accept: options.accept },
  });
  if (!response.ok) {
    throw new ApiError(await parseApiError(response), response.status);
  }
  const filename = filenameFromDisposition(
    response.headers.get('Content-Disposition'),
    options.fallbackFilename,
  );
  triggerBlobDownload(await response.blob(), filename);
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

export async function fetchDocument(
  origin: string,
  token: string,
  direction: DocumentDirection,
  id: number,
): Promise<DocumentDetail> {
  const response = await authorized(origin, `/api/documents/${direction}/${id}/`, token);
  if (!response.ok) {
    throw new ApiError(await parseApiError(response), response.status);
  }
  return response.json();
}

export async function downloadDocumentPdf(
  origin: string,
  token: string,
  direction: DocumentDirection,
  id: number,
): Promise<void> {
  await downloadAuthorizedBlob(origin, `/api/documents/${direction}/${id}/pdf/`, token, {
    accept: 'application/pdf',
    fallbackFilename: `document-${id}.pdf`,
  });
}

export async function downloadDocumentUbl(
  origin: string,
  token: string,
  direction: DocumentDirection,
  id: number,
): Promise<void> {
  await downloadAuthorizedBlob(origin, `/api/documents/${direction}/${id}/ubl/`, token, {
    accept: 'application/xml',
    fallbackFilename: `document-${id}.xml`,
  });
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
  const filename = filenameFromDisposition(
    response.headers.get('Content-Disposition'),
    `documents.${format}`,
  );
  return { blob: await response.blob(), filename };
}
