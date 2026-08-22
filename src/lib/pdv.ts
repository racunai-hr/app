import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin } from './documents';
import type { components } from './openapi/generated';

export { tenantApiOrigin };

export type PdvPeriod = components['schemas']['PdvPeriod'];
export type PdvPeriodList = components['schemas']['PdvPeriodList'];

const PERIOD_STATUS_LABELS: Record<string, string> = {
  open: 'Otvoreno',
  closed: 'Zatvoreno',
  submitted: 'Predano',
};

const RETURN_STATUS_LABELS: Record<string, string> = {
  draft: 'Nacrt',
  generated: 'Generirano',
  signed: 'Potpisano',
  submitted: 'Predano',
  superseded: 'Zamijenjeno',
  imported: 'Importirano',
};

export function formatPdvPeriodLabel(period: string | null | undefined): string {
  if (!period) return '—';
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return '—';
  const month = Number(match[2]);
  if (month < 1 || month > 12) return '—';
  return `${match[2]}/${match[1]}`;
}

export function pdvPeriodStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PERIOD_STATUS_LABELS[status] || status;
}

export function pdvReturnStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return RETURN_STATUS_LABELS[status] || status;
}

async function authorized(origin: string, path: string, token: string): Promise<Response> {
  return fetch(`${origin}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchPdvPeriods(origin: string, token: string): Promise<PdvPeriodList> {
  const response = await authorized(origin, '/api/tax/pdv/periods/', token);
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}
