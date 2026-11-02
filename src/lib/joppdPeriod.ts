/**
 * Live Obrazac JOPPD, generated from the payroll module (domains/tax/forms/joppd).
 *
 * Not to be confused with `lib/tax/joppd2022.ts`, which renders a fixed
 * historical record of filings already submitted before this module existed.
 */
import { ApiError, parseError as parseApiError } from './api';
import { triggerBlobDownload } from './documents';
import type { components } from './openapi/generated';
import { tenantFetch } from './tenantRequest';

export type JoppdRow = components['schemas']['JoppdRow'];
export type JoppdPeriod = components['schemas']['JoppdPeriod'];

export type JoppdDraft = { period: string; return_version: number };
export type JoppdSubmissionResult = {
  event_uuid: string;
  external_identifier: string;
  submitted_at: string;
  has_confirmation: boolean;
};

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
  return response.json();
}

export function joppdHref(slug: string, period: string): string {
  return `/t/${slug}/place/joppd?period=${period}`;
}

export function joppdListHref(slug: string): string {
  return `/t/${slug}/place/joppd`;
}

export async function fetchJoppdPeriod(
  origin: string,
  token: string,
  period: string,
): Promise<JoppdPeriod> {
  return readJson(await authorized(origin, `/api/tax/joppd/periods/${period}/`, token));
}

export async function postJoppdDraft(
  origin: string,
  token: string,
  period: string,
): Promise<JoppdDraft> {
  return readJson(
    await authorized(origin, `/api/tax/joppd/periods/${period}/draft/`, token, { method: 'POST' }),
  );
}

export async function postJoppdSubmit(
  origin: string,
  token: string,
  period: string,
  body: { eporezna_identifier: string; submitted_at: string },
): Promise<JoppdSubmissionResult> {
  return readJson(
    await authorized(origin, `/api/tax/joppd/periods/${period}/submit/`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

export async function downloadJoppdXml(origin: string, token: string, period: string): Promise<void> {
  const response = await authorized(origin, `/api/tax/joppd/periods/${period}/xml/`, token, {
    headers: { Accept: 'application/xml' },
  });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  triggerBlobDownload(await response.blob(), match?.[1] || `JOPPD_${period}.xml`);
}
