import { ApiError, parseError as parseApiError } from './api';
import { tenantFetch } from './tenantRequest';

export type PdHeader = {
  company_name: string;
  oib: string;
  street: string;
  house_number: string;
  city: string;
  tax_office_code: string;
};

export type PdRow = {
  code: string;
  label: string;
  amount: string;
  filed: string | null;
};

export type PdFoundingItem = {
  entry_date: string;
  entry_number: string;
  account_code: string;
  account_name: string;
  amount: string;
  description: string;
};

export type PdMissingHrk = {
  entry_date: string;
  entry_number: string;
  account_code: string;
  account_name: string;
  reason: string;
};

export type PdYear = {
  tax_year: number;
  currency: string;
  period_from: string;
  period_to: string;
  tax_rate: string;
  founding_year: number | null;
  header: PdHeader;
  rows: PdRow[];
  founding_items: PdFoundingItem[];
  missing_hrk: PdMissingHrk[];
  matches_filed: boolean | null;
};

export const PD_FILED_YEARS = [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014] as const;

export type PdReceipt = {
  formId: string;
  signedAt: string;
  signedBy: string;
  receivedAt?: string;
  statuses: string[];
};

const PD_RECEIPTS: Record<number, PdReceipt> = {
  2022: {
    formId: '0e80a4c0-55a9-4138-b027-a6566b6ee6f0',
    signedAt: '2023-04-14T13:40:52+02:00',
    signedBy: 'Zorana Lambaša',
    statuses: [],
  },
  2021: {
    formId: 'd50aca02-ab21-465d-abc8-2ba9769522b4',
    signedAt: '2022-03-25T13:03:31+01:00',
    signedBy: 'Zorana Lambaša',
    statuses: [],
  },
  2020: {
    formId: '9ae236ef-aaab-4b7f-9fc0-b4ebada27b3c',
    signedAt: '2021-05-24T13:35:37+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2021-05-24T13:35:59+02:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
  2019: {
    formId: '2ac7908f-dbac-48d5-9c84-4348a88b07f4',
    signedAt: '2020-05-06T09:20:37+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2020-05-06T09:20:44+02:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
  2018: {
    formId: 'eab61b76-c30c-478a-82ef-4d26a920d69d',
    signedAt: '2019-03-25T08:30:12+01:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2019-03-25T08:30:23+01:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
  2017: {
    formId: '3add0393-4faa-4524-baea-5be3de77a562',
    signedAt: '2018-04-25T11:07:37+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2018-04-25T11:07:43+02:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
  2016: {
    formId: 'd47889fd-afeb-4c03-ad98-931a6d01406e',
    signedAt: '2017-03-22T13:34:10+01:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2017-03-22T14:34:16+01:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
  2015: {
    formId: '1a659210-d70d-4c06-bfc6-fa3f866de2c2',
    signedAt: '2016-04-12T11:37:50+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2016-04-12T13:37:52+02:00',
    statuses: [
      'Poslani PD obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
      'Obrazac je uspješno obrađen.',
    ],
  },
};

export function pdReceipt(year: number): PdReceipt | null {
  return PD_RECEIPTS[year] ?? null;
}

export function pdHref(slug: string, year = 2014): string {
  return `/t/${slug}/porezi/pd?year=${year}`;
}

export function parsePdYear(value: string | null | undefined): number {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return 2014;
  return year;
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

export async function fetchPdYear(origin: string, token: string, year: number): Promise<PdYear> {
  return readJson(await authorized(origin, `/api/tax/pd/years/${year}/`, token));
}
