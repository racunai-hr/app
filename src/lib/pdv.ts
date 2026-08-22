import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin, triggerBlobDownload } from './documents';
import type { components } from './openapi/generated';

export { tenantApiOrigin };

export type PdvPeriod = components['schemas']['PdvPeriod'];
export type PdvPeriodList = components['schemas']['PdvPeriodList'];
export type PdvPeriodWorkspace = components['schemas']['PdvPeriodWorkspace'];
export type PdvBoxes = components['schemas']['PdvBoxes'];
export type PdvDraft = components['schemas']['PdvDraft'];
export type PdvLedgerRebuild = components['schemas']['PdvLedgerRebuild'];
export type PdvSPeriod = components['schemas']['PdvSPeriod'];
export type SubmissionResult = components['schemas']['SubmissionResult'];
export type ConfirmationResult = components['schemas']['ConfirmationResult'];

const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

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

export function parsePdvPeriod(value: string | null | undefined): string | null {
  if (!value) return null;
  return PERIOD_RE.test(value) ? value : null;
}

export function formatPdvPeriodLabel(period: string | null | undefined): string {
  const parsed = parsePdvPeriod(period);
  if (!parsed) return '—';
  const [, year, month] = PERIOD_RE.exec(parsed)!;
  return `${month}/${year}`;
}

export function pdvPeriodStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PERIOD_STATUS_LABELS[status] || status;
}

export function pdvReturnStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return RETURN_STATUS_LABELS[status] || status;
}

export function pdvXmlIntegrityLabel(status: string | null | undefined): string {
  if (!status) return '—';
  if (status === 'SYNC') return 'Usklađeno';
  if (status === 'OUT_OF_SYNC') return 'Nije usklađeno';
  return status;
}

export function canWriteTax(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}

export function pdvPrijavaHref(slug: string, period: string): string {
  return `/t/${slug}/porezi/pdv/prijava?period=${period}`;
}

export function pdvKontrolniHref(slug: string, period: string): string {
  return `/t/${slug}/porezi/pdv/kontrolni-pregledi?period=${period}`;
}

export function pdvSHref(slug: string, period: string): string {
  return `/t/${slug}/porezi/pdv-s?period=${period}`;
}

export function razdobljaHref(slug: string): string {
  return `/t/${slug}/porezi/pdv`;
}

export type PdvBoxRow = { code: string; value: string; tax: string };

export function pdvBoxRows(fields: PdvBoxes['fields']): PdvBoxRow[] {
  return Object.entries(fields).map(([code, raw]) => {
    if (raw && typeof raw === 'object') {
      const row = raw as Record<string, unknown>;
      if ('vrijednost' in row) {
        return { code, value: String(row.vrijednost ?? ''), tax: String(row.porez ?? '') };
      }
      if ('nabavna_vrijednost' in row) {
        return {
          code,
          value: String(row.nabavna_vrijednost ?? ''),
          tax: String(row.prodajna_vrijednost ?? ''),
        };
      }
    }
    if (typeof raw === 'boolean') {
      return { code, value: raw ? 'Da' : 'Ne', tax: '' };
    }
    return { code, value: raw == null ? '' : String(raw), tax: '' };
  });
}

async function authorized(
  origin: string,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${origin}${path}`, { ...init, headers });
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

export async function fetchPdvPeriods(origin: string, token: string): Promise<PdvPeriodList> {
  return readJson(await authorized(origin, '/api/tax/pdv/periods/', token));
}

export async function fetchPdvWorkspace(
  origin: string,
  token: string,
  period: string,
): Promise<PdvPeriodWorkspace> {
  return readJson(await authorized(origin, `/api/tax/pdv/periods/${period}/`, token));
}

export async function fetchPdvBoxes(
  origin: string,
  token: string,
  period: string,
): Promise<PdvBoxes> {
  return readJson(await authorized(origin, `/api/tax/pdv/periods/${period}/boxes/`, token));
}

export async function postPdvLedger(
  origin: string,
  token: string,
  period: string,
): Promise<PdvLedgerRebuild> {
  return readJson(
    await authorized(origin, `/api/tax/pdv/periods/${period}/ledger/`, token, { method: 'POST' }),
  );
}

export async function postPdvDraft(
  origin: string,
  token: string,
  period: string,
): Promise<PdvDraft> {
  return readJson(
    await authorized(origin, `/api/tax/pdv/periods/${period}/draft/`, token, { method: 'POST' }),
  );
}

export async function postPdvSubmit(
  origin: string,
  token: string,
  period: string,
  body: components['schemas']['PdvSubmitRequestRequest'],
): Promise<SubmissionResult> {
  return readJson(
    await authorized(origin, `/api/tax/pdv/periods/${period}/submit/`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

export async function fetchPdvSPeriod(
  origin: string,
  token: string,
  period: string,
): Promise<PdvSPeriod> {
  return readJson(await authorized(origin, `/api/tax/pdv-s/periods/${period}/`, token));
}

export async function postPdvSSubmit(
  origin: string,
  token: string,
  period: string,
  body: components['schemas']['PdvSSubmitRequestRequest'],
): Promise<SubmissionResult> {
  return readJson(
    await authorized(origin, `/api/tax/pdv-s/periods/${period}/submit/`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

export async function postSubmissionConfirmation(
  origin: string,
  token: string,
  eventUuid: string,
  file: File,
): Promise<ConfirmationResult> {
  const body = new FormData();
  body.append('confirmation', file);
  return readJson(
    await authorized(origin, `/api/tax/submissions/${eventUuid}/confirmation/`, token, {
      method: 'POST',
      body,
    }),
  );
}

async function downloadXml(
  origin: string,
  path: string,
  token: string,
  fallbackFilename: string,
): Promise<void> {
  const response = await authorized(origin, path, token, {
    headers: { Accept: 'application/xml' },
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  triggerBlobDownload(await response.blob(), match?.[1] || fallbackFilename);
}

export async function downloadPdvXml(
  origin: string,
  token: string,
  period: string,
): Promise<void> {
  await downloadXml(
    origin,
    `/api/tax/pdv/periods/${period}/xml/`,
    token,
    `PDV_${period}.xml`,
  );
}

export async function downloadPdvSXml(
  origin: string,
  token: string,
  period: string,
): Promise<void> {
  await downloadXml(
    origin,
    `/api/tax/pdv-s/periods/${period}/xml/`,
    token,
    `PDV-S_${period}.xml`,
  );
}
