import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';

export { tenantApiOrigin };

export type PurchasingConflict = {
  code: string;
  detail: string;
};

export type PartnerDiff = {
  field: string;
  existing: string;
  extracted: string;
};

export type IncomingInvoiceImport = {
  id: number;
  status: string;
  original_filename: string;
  content_type: string;
  file_sha256: string;
  file_size: number;
  ocr_provider: string;
  ocr_model: string;
  ocr_schema_version: string;
  ocr_extracted_at: string | null;
  extracted: {
    supplier: {
      name: string;
      oib: string;
      vat_number: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
      country_code: string;
      iban: string;
    };
    invoice_number: string;
    issue_date: string;
    due_date: string | null;
    currency: string;
    net_amount: string;
    tax_amount: string;
    total_amount: string;
    iban: string;
    vat_breakdown: Array<Record<string, string>>;
    line_items: Array<Record<string, string | null>>;
  };
  warnings: string[];
  partner: {
    match: string;
    partner_id: number | null;
    candidate_id: number | null;
    name: string;
    tax_number: string;
    diff: PartnerDiff[];
  };
  duplicate: {
    kind: string;
    expense_id: number | null;
    label: string;
    detail: Record<string, unknown>;
  };
  confirmed_expense_id: number | null;
  last_error: string;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  created?: boolean;
};

export class PurchasingApiError extends ApiError {
  conflict: PurchasingConflict | null;

  constructor(message: string, status: number, conflict: PurchasingConflict | null = null) {
    super(message, status);
    this.name = 'PurchasingApiError';
    this.conflict = conflict;
  }
}

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

async function parsePurchasingError(response: Response): Promise<PurchasingApiError> {
  try {
    const data = await response.json();
    if (data?.code && data?.detail) {
      return new PurchasingApiError(String(data.detail), response.status, {
        code: String(data.code),
        detail: String(data.detail),
      });
    }
  } catch {
    /* fall through */
  }
  return new PurchasingApiError(await parseApiError(response), response.status);
}

export async function createInvoiceImport(
  origin: string,
  token: string,
  file: File,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<IncomingInvoiceImport> {
  const body = new FormData();
  body.append('file', file);
  const response = await authorized(origin, '/api/purchasing/invoices/import/', token, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
    signal,
  });
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function fetchInvoiceImport(
  origin: string,
  token: string,
  id: number,
  signal?: AbortSignal,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(origin, `/api/purchasing/invoices/import/${id}/`, token, {
    signal,
  });
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function retryInvoiceImport(
  origin: string,
  token: string,
  id: number,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(origin, `/api/purchasing/invoices/import/${id}/retry/`, token, {
    method: 'POST',
  });
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function createPartnerFromImport(
  origin: string,
  token: string,
  id: number,
  payload: Record<string, string>,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(
    origin,
    `/api/purchasing/invoices/import/${id}/create-partner/`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function applyPartnerUpdates(
  origin: string,
  token: string,
  id: number,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(
    origin,
    `/api/purchasing/invoices/import/${id}/apply-partner-updates/`,
    token,
    { method: 'POST' },
  );
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function confirmInvoiceImport(
  origin: string,
  token: string,
  id: number,
  payload: Record<string, unknown>,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(origin, `/api/purchasing/invoices/import/${id}/confirm/`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export async function discardInvoiceImport(
  origin: string,
  token: string,
  id: number,
): Promise<IncomingInvoiceImport> {
  const response = await authorized(origin, `/api/purchasing/invoices/import/${id}/discard/`, token, {
    method: 'POST',
  });
  if (!response.ok) throw await parsePurchasingError(response);
  return response.json();
}

export function canWritePurchasing(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}
