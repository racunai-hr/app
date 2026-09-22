import { ApiError, parseError as parseApiError } from './api';
import { tenantFetch } from './tenantRequest';

export type CostCenterRef = {
  id: number;
  code: string;
  name: string;
  kind?: string;
  is_active?: boolean;
  is_bookable?: boolean;
  parent_id?: number | null;
};

export type CostCenter = CostCenterRef & {
  kind: string;
  notes: string;
  parent: CostCenterRef | null;
  vehicle?: { id: number; name: string; vin: string; fixed_asset_id: number | null } | null;
  fixed_assets?: { id: number; name: string }[];
};

export const COST_CENTER_KIND_LABELS: Record<string, string> = {
  location: 'Lokacijsko',
  object: 'Objektno',
  overhead: 'Režijsko',
  group: 'Grupa',
};

export function costCenterHref(slug: string, id: number): string {
  return `/t/${slug}/izvjestaji/mjesta-troska/${id}`;
}

/** Journal and preview DTOs carry only the display parts of a cost center. */
export type CostCenterLabelParts = {
  code: string;
  name: string;
};

export type CostCenterList = {
  count: number;
  results: CostCenter[];
};

export type CostCenterReportAccount = {
  account_code: string;
  account_name: string;
  account_class: string;
  amount: string;
};

export type CostCenterReportRow = {
  cost_center_id: number | null;
  code: string;
  name: string;
  kind: string;
  parent_id: number | null;
  parent_code?: string | null;
  total: string;
  accounts?: CostCenterReportAccount[];
};

export type CostCenterReport = {
  year: number;
  month: number;
  cumulative: boolean;
  total: string;
  assigned_total: string;
  unassigned_total: string;
  groups: CostCenterReportRow[];
  results: CostCenterReportRow[];
};

export function formatCostCenterOption(row: CostCenterLabelParts): string {
  return `${row.code} · ${row.name}`;
}

export function costCenterLabel(row: CostCenterLabelParts | null | undefined): string {
  if (!row) return '—';
  return formatCostCenterOption(row);
}

async function authorized(
  origin: string,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  return tenantFetch(`${origin}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    if (data?.detail) {
      const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      return new ApiError(detail, response.status);
    }
  } catch {
    /* fall through */
  }
  return new ApiError(await parseApiError(response), response.status);
}

export async function fetchCostCenters(
  origin: string,
  token: string,
  signal?: AbortSignal,
): Promise<CostCenterList> {
  const response = await authorized(origin, '/api/finance/cost-centers/', token, { signal });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function fetchCostCenter(
  origin: string,
  token: string,
  id: number,
  signal?: AbortSignal,
): Promise<CostCenter> {
  const response = await authorized(origin, `/api/finance/cost-centers/${id}/`, token, { signal });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function createCostCenter(
  origin: string,
  token: string,
  body: { code: string; name: string; kind: string; parent_id?: number | null; notes?: string },
): Promise<CostCenter> {
  const response = await authorized(origin, '/api/finance/cost-centers/', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function patchCostCenter(
  origin: string,
  token: string,
  id: number,
  body: Partial<{ code: string; name: string; kind: string; parent_id: number | null; is_active: boolean; notes: string }>,
): Promise<CostCenter> {
  const response = await authorized(origin, `/api/finance/cost-centers/${id}/`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function fetchCostCenterReport(
  origin: string,
  token: string,
  year: number,
  month: number,
  cumulative = true,
  signal?: AbortSignal,
): Promise<CostCenterReport> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    cumulative: cumulative ? '1' : '0',
  });
  const response = await authorized(
    origin,
    `/api/finance/reports/cost-centers/?${params}`,
    token,
    { signal },
  );
  if (!response.ok) throw await parseError(response);
  return response.json();
}
