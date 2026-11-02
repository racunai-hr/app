import { ApiError, parseError as parseApiError } from './api';
import { tenantFetch } from './tenantRequest';
import { triggerBlobDownload } from './documents';

export type Tz2Taxpayer = {
  first_name: string;
  last_name: string;
  oib: string;
  municipality_code: string;
  city: string;
  street: string;
  house_number: string;
};

export type Tz2Submission = {
  event_uuid: string;
  submission_no: number;
  submission_type: string;
  external_identifier: string;
  submitted_at: string | null;
  has_confirmation: boolean;
  payload_hash: string;
};

export type Tz2Year = {
  tax_year: number;
  version: number | null;
  persisted: boolean;
  schema_version: string;
  mapping_version: number;
  period_from: string;
  period_to: string;
  rates: Record<string, string>;
  taxpayer: Tz2Taxpayer;
  room_beds: number;
  aux_beds: number;
  camp_units: number;
  robinson_units: number;
  opg_room_beds: number;
  opg_aux_beds: number;
  opg_camp_units: number;
  opg_robinson_units: number;
  room_bed_rate: string;
  aux_bed_rate: string;
  camp_rate: string;
  robinson_rate: string;
  opg_room_bed_rate: string;
  opg_aux_bed_rate: string;
  opg_camp_rate: string;
  opg_robinson_rate: string;
  room_bed_total: string;
  aux_bed_total: string;
  total_assessed: string;
  amount_after_discount: string;
  payment_installments: boolean;
  installment_flag: string;
  installment_amount: string;
  ep_receipts: string;
  event_uuid: string | null;
  current_submission: Tz2Submission | null;
  submissions: Tz2Submission[];
  payload_hash?: string;
};

export type Tz2SaveBody = {
  first_name: string;
  last_name: string;
  oib: string;
  municipality_code: string;
  city: string;
  street: string;
  house_number: string;
  room_beds: number;
  aux_beds: number;
  payment_installments: boolean;
  ep_receipts: string;
  room_bed_rate?: string;
  aux_bed_rate?: string;
};

export function tz2Href(slug: string, year = 2026): string {
  return `/t/${slug}/porezi/tz2?year=${year}`;
}

export function parseTz2Year(value: string | null | undefined): number {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return 2026;
  return year;
}

export function tz2SubmissionLabel(
  submission: { submission_no: number } | null | undefined,
): string {
  if (!submission) return '—';
  if (submission.submission_no === 1) return 'Predaja #1';
  return `Potvrda obrade #${submission.submission_no}`;
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
  return tenantFetch(`${origin}${path}`, { ...init, headers });
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json() as Promise<T>;
}

export async function fetchTz2Year(origin: string, token: string, year: number): Promise<Tz2Year> {
  return readJson(await authorized(origin, `/api/tax/tz2/years/${year}/`, token));
}

export async function saveTz2Year(
  origin: string,
  token: string,
  year: number,
  body: Tz2SaveBody,
): Promise<Tz2Year> {
  return readJson(
    await authorized(origin, `/api/tax/tz2/years/${year}/`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

export async function downloadTz2Xml(origin: string, token: string, year: number): Promise<void> {
  const response = await authorized(origin, `/api/tax/tz2/years/${year}/xml/`, token, {
    headers: { Accept: 'application/xml' },
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  triggerBlobDownload(await response.blob(), match?.[1] || `TZ2_${year}.xml`);
}

export async function postTz2Submit(
  origin: string,
  token: string,
  year: number,
  body: { eporezna_identifier: string; submitted_at: string },
): Promise<{ event_uuid: string; has_confirmation: boolean }> {
  return readJson(
    await authorized(origin, `/api/tax/tz2/years/${year}/submit/`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}
