/** Fine Star OPZ-STAT-1 for 2022. Empty filing. */

const FINESTAR_SLUG = 'finestar';

export type OpzYear = {
  slug: string;
  year: number;
  periodFrom: string;
  periodTo: string;
  asOf: string;
  taxpayerName: string;
  oib: string;
  street: string;
  place: string;
  formId: string;
  composedAt: string;
  signedAt: string;
  signedBy: string;
  receiptId: string;
  receivedAt: string;
  status: string;
  invoiceTotal: string;
  vatTotal: string;
  grossTotal: string;
  paidTotal: string;
  unpaidTotal: string;
};

const OPZ_YEARS: OpzYear[] = [
  {
    slug: FINESTAR_SLUG,
    year: 2022,
    periodFrom: '2022-01-01',
    periodTo: '2022-12-31',
    asOf: '2022-12-31',
    taxpayerName: 'FINE STAR D.O.O.',
    oib: '36619131370',
    street: 'Bana Josipa Jelacica 58',
    place: 'Sibenik',
    formId: '215fe8c3-59c4-48d4-bb9e-b51c6693a283',
    composedAt: '2023-05-03T14:24:33+02:00',
    signedAt: '2023-05-04T07:50:03+02:00',
    signedBy: 'Zorana Lambasa',
    receiptId: '806fbbf3-0b39-4e0a-9082-987899f43dde',
    receivedAt: '2023-05-04T07:50:29+02:00',
    status: 'Obrazac je zaprimljen i čeka provjeru.',
    invoiceTotal: '0.00',
    vatTotal: '0.00',
    grossTotal: '0.00',
    paidTotal: '0.00',
    unpaidTotal: '0.00',
  },
];

export function opzHref(slug: string): string {
  return `/t/${slug}/porezi/opz`;
}

export function opzYears(slug: string): number[] {
  return OPZ_YEARS.filter((item) => item.slug === slug)
    .map((item) => item.year)
    .sort((left, right) => right - left);
}

export function opzForTenantYear(slug: string, year: number): OpzYear | null {
  return OPZ_YEARS.find((item) => item.slug === slug && item.year === year) ?? null;
}
