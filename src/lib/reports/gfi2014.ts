/** Filed 2014 annual financial report covers and FINA registry receipts. Not an AOP statement. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_GFI_YEAR = 2014;
export const FINESTAR_GFI_2015_YEAR = 2015;
export const FINESTAR_GFI_2016_YEAR = 2016;
export const FINESTAR_GFI_2017_YEAR = 2017;
export const FINESTAR_GFI_2018_YEAR = 2018;
export const FINESTAR_GFI_2019_YEAR = 2019;
export const FINESTAR_GFI_2020_YEAR = 2020;
export const FINESTAR_GFI_2021_YEAR = 2021;
export const FINESTAR_GFI_INACTIVE_YEAR = 2013;

export type GfiDocument = {
  label: string;
  note?: 'odluka' | 'biljeske';
};

export type GfiPayment = {
  amount: string;
  fee: string;
  total: string;
  paidOn: string;
  account: string;
  reference: string;
};

export type GfiFiling = {
  id: string;
  kind: 'statistika' | 'javna-objava' | 'statistika-i-javna-objava';
  title: string;
  purpose: string;
  receiptId: string;
  filedOn: string;
  controlNumber: string;
  documents: GfiDocument[];
  payment?: GfiPayment;
};

type GfiCover = {
  taxpayerName: string;
  oib: string;
  mb: string;
  mbs: string;
  nkd: string;
  place: string;
  street: string;
  reportKind: string;
  sizeLabel: string;
  ownershipLabel: string;
  domesticCapitalPercent: string;
  foreignCapitalPercent: string;
  employees: string;
  monthsPrevious: string;
  monthsCurrent: string;
  auditRequired: false;
  representative: string;
  excelVersion: string;
  accountingStandard?: string;
  filings: GfiFiling[];
};

export type GfiInactive = {
  taxpayerName: string;
  oib: string;
  street: string;
  place: string;
  signedOn: string;
  signedBy: string;
  statement: string;
  receiptId: string;
  filedOn: string;
  receiptTitle: string;
  purpose: string;
  documentLabel: string;
};

export type GfiView =
  | ({ status: 'snapshot'; kind: 'filed'; year: number } & GfiCover)
  | ({ status: 'snapshot'; kind: 'inactive'; year: number } & GfiInactive)
  | { status: 'empty' };

const FINESTAR_GFI_2014_FILINGS: GfiFiling[] = [
  {
    id: 'statistika',
    kind: 'statistika',
    title: 'Statistika',
    purpose: 'Samo u statističke svrhe',
    receiptId: '5573651',
    filedOn: '2015-03-27',
    controlNumber: '368478303.70',
    documents: [
      { label: 'Bilanca za poduzetnike' },
      { label: 'Račun dobiti i gubitka za poduzetnike' },
      { label: 'Dodatni podaci za poduzetnike' },
    ],
  },
  {
    id: 'javna-objava',
    kind: 'javna-objava',
    title: 'Javna objava',
    purpose: 'Javna objava',
    receiptId: '5676163',
    filedOn: '2015-06-12',
    controlNumber: '368394236.76',
    documents: [
      { label: 'Bilanca za poduzetnike' },
      { label: 'Račun dobiti i gubitka za poduzetnike' },
      { label: 'Bilješke uz financijske izvještaje' },
      { label: 'Odluka o raspodjeli dobiti ili pokriću gubitka' },
      { label: 'Odluka o utvrđivanju godišnjeg financijskog izvještaja' },
    ],
  },
];

const FINESTAR_GFI_DOCUMENTS: GfiDocument[] = [
  { label: 'Bilanca za poduzetnike' },
  { label: 'Račun dobiti i gubitka za poduzetnike' },
  { label: 'Dodatni podaci za poduzetnike' },
  { label: 'Bilješke uz financijske izvještaje' },
  { label: 'Odluka o raspodjeli dobiti ili pokriću gubitka' },
  { label: 'Odluka o utvrđivanju godišnjeg financijskog izvještaja' },
];

const FINESTAR_GFI_2021_DOCUMENTS: GfiDocument[] = FINESTAR_GFI_DOCUMENTS.map((document) => {
  if (document.label.startsWith('Bilješke')) return { ...document, note: 'biljeske' as const };
  if (document.label.startsWith('Odluka o raspodjeli')) return { ...document, note: 'odluka' as const };
  return document;
});

const FINESTAR_GFI_2021_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '7122844',
    filedOn: '2022-03-28',
    controlNumber: '377619595.69',
    documents: FINESTAR_GFI_2021_DOCUMENTS,
  },
];

const FINESTAR_GFI_2020_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '6910660',
    filedOn: '2021-04-20',
    controlNumber: '384750620.68',
    documents: FINESTAR_GFI_DOCUMENTS,
  },
];

const FINESTAR_GFI_2019_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '6687228',
    filedOn: '2020-03-27',
    controlNumber: '368528561.45',
    documents: FINESTAR_GFI_DOCUMENTS,
  },
];

const FINESTAR_GFI_2018_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '6464204',
    filedOn: '2019-04-02',
    controlNumber: '368531075.37',
    documents: FINESTAR_GFI_DOCUMENTS,
  },
];

const FINESTAR_GFI_2017_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '6236191',
    filedOn: '2018-03-09',
    controlNumber: '368535563.68',
    documents: FINESTAR_GFI_DOCUMENTS,
    payment: {
      amount: '230.00',
      fee: '2.00',
      total: '232.00',
      paidOn: '2018-03-01',
      account: 'HR4223900001100017042',
      reference: 'HR05 7543000-36619131370',
    },
  },
];

const FINESTAR_GFI_2016_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '6024452',
    filedOn: '2017-03-31',
    controlNumber: '368526521.28',
    documents: [
      { label: 'Bilanca za poduzetnike' },
      { label: 'Račun dobiti i gubitka za poduzetnike' },
      { label: 'Dodatni podaci za poduzetnike' },
      { label: 'Bilješke uz financijske izvještaje' },
      { label: 'Odluka o raspodjeli dobiti ili pokriću gubitka' },
      { label: 'Odluka o utvrđivanju godišnjeg financijskog izvještaja' },
    ],
  },
];

const FINESTAR_GFI_2015_FILINGS: GfiFiling[] = [
  {
    id: 'statistika-i-javna-objava',
    kind: 'statistika-i-javna-objava',
    title: 'Statistika i javna objava',
    purpose: 'Predaja i za statističke svrhe i za javnu objavu',
    receiptId: '5783448',
    filedOn: '2016-03-15',
    controlNumber: '368698172.35',
    documents: [
      { label: 'Bilanca za poduzetnike' },
      { label: 'Račun dobiti i gubitka za poduzetnike' },
      { label: 'Dodatni podaci za poduzetnike' },
      { label: 'Bilješke uz financijske izvještaje' },
      { label: 'Odluka o raspodjeli dobiti ili pokriću gubitka' },
      { label: 'Odluka o utvrđivanju godišnjeg financijskog izvještaja' },
    ],
  },
];

const FINESTAR_GFI_2013_INACTIVE: GfiInactive = {
  taxpayerName: 'FINE STAR d.o.o.',
  oib: '36619131370',
  street: 'A. T. Mimare 46',
  place: 'Zagreb',
  signedOn: '2014-02-15',
  signedBy: 'Nikola Banović',
  statement:
    'U 2013. nije bilo poduzetničke djelatnosti, prometa na žiro-računu, poslovnih promjena u knjigama ni zaposlenih.',
  receiptId: '5314026',
  filedOn: '2014-02-26',
  receiptTitle: 'Javna objava',
  purpose:
    'Oslobođenje od predaje godišnjeg financijskog izvještaja, i za statistiku i za javnu objavu',
  documentLabel: 'Izjava o neaktivnosti',
};

const GFI_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    kind: 'inactive' as const,
    year: FINESTAR_GFI_INACTIVE_YEAR,
    ...FINESTAR_GFI_2013_INACTIVE,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mali poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '0',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Nikola Banović',
    excelVersion: '2.0.4',
    filings: FINESTAR_GFI_2014_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2015_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mali poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Nikola Banović',
    excelVersion: '2.0.4',
    filings: FINESTAR_GFI_2015_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2016_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mali poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Nikola Banović',
    excelVersion: '3.0.3',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2016_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2017_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mikro poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Martina Banović',
    excelVersion: '3.0.3',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2017_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2018_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mikro poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Martina Banović',
    excelVersion: '3.0.4',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2018_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2019_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mikro poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Martina Banović',
    excelVersion: '3.0.4',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2019_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2020_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Zagreb',
    street: 'A. T. Mimare 46',
    reportKind: '10',
    sizeLabel: 'Mikro poduzetnik',
    ownershipLabel: 'Privatno vlasništvo od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Martina Banović',
    excelVersion: '3.0.4',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2020_FILINGS,
  },
  {
    slug: FINESTAR_SLUG,
    kind: 'filed' as const,
    year: FINESTAR_GFI_2021_YEAR,
    taxpayerName: 'FINE STAR d.o.o. za usluge',
    oib: '36619131370',
    mb: '04139828',
    mbs: '080885494',
    nkd: '4690',
    place: 'Šibenik',
    street: 'Bana Josipa Jelačića 58',
    reportKind: '10',
    sizeLabel: 'Mikro poduzetnik',
    ownershipLabel: 'Privatno od osnivanja',
    domesticCapitalPercent: '100',
    foreignCapitalPercent: '0',
    employees: '0',
    monthsPrevious: '12',
    monthsCurrent: '12',
    auditRequired: false as const,
    representative: 'Toni Šupe',
    excelVersion: '4.0.1',
    accountingStandard: 'HSFI',
    filings: FINESTAR_GFI_2021_FILINGS,
  },
];

/** Years that already have a filed annual report, newest first. */
export function gfiYears(slug: string): number[] {
  return GFI_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function gfiForTenantYear(slug: string, year: number): GfiView {
  const snapshot = GFI_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (!snapshot) return { status: 'empty' };
  return { status: 'snapshot', ...snapshot };
}
