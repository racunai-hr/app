/** Filed Obrazac PD-IPO v1-0. Related-party loans. Not the profit-tax return. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_PD_IPO_2021_YEAR = 2021;
export const FINESTAR_PD_IPO_2020_YEAR = 2020;
export const FINESTAR_PD_IPO_2019_YEAR = 2019;
export const FINESTAR_PD_IPO_YEAR = 2018;
export const FINESTAR_PD_IPO_2017_YEAR = 2017;
export const FINESTAR_PD_IPO_2016_YEAR = 2016;

export type PdIpoReceivable = {
  originatedOn: string;
  amountAtOrigin: string;
  openingPrincipal: string;
  closingPrincipal: string;
  interestRate: string;
  interestInYear: string;
  taxBaseIncrease: string;
  interestAtYearEnd: string;
};

export type PdIpoPerson = {
  name: string;
  oib: string;
  address: string;
  country: string;
  capitalShare: string;
  votingShare: string;
  relation: string;
  relationLabel: string;
  privilegedTaxStatus: false;
  carriedTaxLoss: false;
  receivable: PdIpoReceivable;
};

export type PdIpoView =
  | {
      status: 'snapshot';
      year: number;
      currency: 'HRK';
      periodFrom: string;
      periodTo: string;
      taxpayerName: string;
      oib: string;
      street: string;
      place: string;
      officeCode: string;
      formId: string;
      signedAt: string;
      signedBy: string;
      receivedAt?: string;
      processedAt?: string;
      person: PdIpoPerson;
      obligations?: PdIpoPerson[];
    }
  | { status: 'empty' };

const RELATED_MEMBER = {
  country: 'Hrvatska',
  capitalShare: '0.00',
  votingShare: '0.00',
  relation: 'U',
  relationLabel: 'član uprave',
  privilegedTaxStatus: false as const,
  carriedTaxLoss: false as const,
};

const PD_IPO_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2021_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2021-01-01',
    periodTo: '2021-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'Bana Josipa Jelačića 58',
    place: 'Šibenik',
    officeCode: '3383',
    formId: 'db457038-6b58-46e7-a776-b4df18e7f5e0',
    signedAt: '2022-08-25T09:42:13+02:00',
    signedBy: 'Zorana Lambaša',
    person: {
      name: 'Toni Šupe',
      oib: '63281973348',
      address: 'Šibenik',
      ...RELATED_MEMBER,
      receivable: {
        originatedOn: '2021-01-01',
        amountAtOrigin: '17736.25',
        openingPrincipal: '17736.25',
        closingPrincipal: '17736.25',
        interestRate: '3.00',
        interestInYear: '3807.53',
        taxBaseIncrease: '0.00',
        interestAtYearEnd: '3807.53',
      },
    },
    obligations: [
      {
        name: 'Šupina Poljica j.d.o.o.',
        oib: '91381354893',
        address: 'Šibenik',
        ...RELATED_MEMBER,
        receivable: {
          originatedOn: '2021-10-31',
          amountAtOrigin: '185600.00',
          openingPrincipal: '0.00',
          closingPrincipal: '185600.00',
          interestRate: '3.00',
          interestInYear: '5150.46',
          taxBaseIncrease: '0.00',
          interestAtYearEnd: '5150.46',
        },
      },
      {
        name: 'Toni Šupe',
        oib: '63281973348',
        address: 'Šibenik',
        ...RELATED_MEMBER,
        receivable: {
          originatedOn: '2021-10-31',
          amountAtOrigin: '189000.00',
          openingPrincipal: '0.00',
          closingPrincipal: '0.00',
          interestRate: '3.00',
          interestInYear: '0.00',
          taxBaseIncrease: '0.00',
          interestAtYearEnd: '0.00',
        },
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2020_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2020-01-01',
    periodTo: '2020-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'A. T. Mimare 46',
    place: 'Zagreb',
    officeCode: '3409',
    formId: '97a0fd51-f5c3-42a5-8271-316dacc7a73e',
    signedAt: '2021-05-24T13:36:40+02:00',
    signedBy: 'Bernard Ulični',
    person: {
      name: 'Marina Banović',
      oib: '53531930627',
      address: 'Zagreb, Ivane Brlić-Mažuranić 23',
      country: 'Hrvatska',
      capitalShare: '0.00',
      votingShare: '100.00',
      relation: 'U',
      relationLabel: 'član uprave',
      privilegedTaxStatus: false as const,
      carriedTaxLoss: false as const,
      receivable: {
        originatedOn: '2014-12-31',
        amountAtOrigin: '10000.00',
        openingPrincipal: '17736.25',
        closingPrincipal: '17736.25',
        interestRate: '2.00',
        interestInYear: '354.73',
        taxBaseIncrease: '0.00',
        interestAtYearEnd: '3275.44',
      },
    },
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2019_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2019-01-01',
    periodTo: '2019-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'Ante Topić-Mimare 46',
    place: 'Zagreb',
    officeCode: '3409',
    formId: 'be271c71-f4a1-4478-86a8-188256c5226e',
    signedAt: '2020-05-06T09:21:46+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2020-05-06T09:21:52+02:00',
    processedAt: '2020-05-06T22:00:18+02:00',
    person: {
      name: 'Martina Banović',
      oib: '53531930627',
      address: 'Zagreb, Ivane Brlić-Mažuranić 23',
      country: 'Hrvatska',
      capitalShare: '100.00',
      votingShare: '100.00',
      relation: 'D',
      relationLabel: 'udjeli u kapitalu ili glasačkom pravu dužnika ili vjerovnika',
      privilegedTaxStatus: false as const,
      carriedTaxLoss: false as const,
      receivable: {
        originatedOn: '2014-12-31',
        amountAtOrigin: '10000.00',
        openingPrincipal: '17966.25',
        closingPrincipal: '17736.25',
        interestRate: '2.00',
        interestInYear: '354.73',
        taxBaseIncrease: '0.00',
        interestAtYearEnd: '2920.71',
      },
    },
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2018-01-01',
    periodTo: '2018-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'Ante Topić-Mimare 46',
    place: 'Zagreb',
    officeCode: '3409',
    formId: '8e80ddfd-c074-4fd7-be66-25b43e439c72',
    signedAt: '2019-03-25T08:33:57+01:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2019-03-25T08:34:04+01:00',
    processedAt: '2019-03-25T22:01:05+01:00',
    person: {
      name: 'Martina Banović',
      oib: '53531930627',
      address: 'Zagreb, Ivane Brlić-Mažuranić 23',
      country: 'Hrvatska',
      capitalShare: '100.00',
      votingShare: '100.00',
      relation: 'D',
      relationLabel: 'član društva',
      privilegedTaxStatus: false as const,
      carriedTaxLoss: false as const,
      receivable: {
        originatedOn: '2014-12-31',
        amountAtOrigin: '10000.00',
        openingPrincipal: '18196.25',
        closingPrincipal: '17966.25',
        interestRate: '3.00',
        interestInYear: '538.99',
        taxBaseIncrease: '0.00',
        interestAtYearEnd: '2565.98',
      },
    },
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2017_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2017-01-01',
    periodTo: '2017-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'Ante Topić-Mimare 46',
    place: 'Zagreb',
    officeCode: '3409',
    formId: '46edd356-9919-4016-b433-ee32eebb4944',
    signedAt: '2018-04-25T11:12:28+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2018-04-25T11:12:40+02:00',
    processedAt: '2018-04-25T22:03:41+02:00',
    person: {
      name: 'Martina Banović',
      oib: '53531930627',
      address: 'Zagreb, Ivane Brlić-Mažuranić 23',
      country: 'Hrvatska',
      capitalShare: '100.00',
      votingShare: '100.00',
      relation: 'U',
      relationLabel: 'član uprave',
      privilegedTaxStatus: false as const,
      carriedTaxLoss: false as const,
      receivable: {
        originatedOn: '2014-12-31',
        amountAtOrigin: '10000.00',
        openingPrincipal: '19570.00',
        closingPrincipal: '18196.25',
        interestRate: '3.00',
        interestInYear: '545.89',
        taxBaseIncrease: '0.00',
        interestAtYearEnd: '2026.99',
      },
    },
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2016_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2016-01-01',
    periodTo: '2016-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'Ante Topić-Mimare 46',
    place: 'Zagreb',
    officeCode: '3409',
    formId: 'e5af7652-a3ea-460d-a567-85eae3973c1b',
    signedAt: '2017-10-24T14:05:13+02:00',
    signedBy: 'Bernard Ulični',
    receivedAt: '2017-10-24T14:05:24+02:00',
    processedAt: '2017-10-24T22:01:10+02:00',
    person: {
      name: 'Nikola Banović',
      oib: '03626641565',
      address: 'Zagreb, I. B. Mažuranić 23',
      country: 'Hrvatska',
      capitalShare: '100.00',
      votingShare: '100.00',
      relation: 'D',
      relationLabel: 'udjeli u kapitalu ili glasačkom pravu dužnika ili vjerovnika',
      privilegedTaxStatus: false as const,
      carriedTaxLoss: false as const,
      receivable: {
        originatedOn: '2014-12-31',
        amountAtOrigin: '10000.00',
        openingPrincipal: '19800.00',
        closingPrincipal: '19570.00',
        interestRate: '3.00',
        interestInYear: '894.00',
        taxBaseIncrease: '587.10',
        interestAtYearEnd: '1481.10',
      },
    },
  },
];

export function pdIpoHref(slug: string): string {
  return `/t/${slug}/porezi/pd-ipo`;
}

/** Years that already have a filed PD-IPO, newest first. */
export function pdIpoYears(slug: string): number[] {
  return PD_IPO_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function pdIpoForTenantYear(slug: string, year: number): PdIpoView {
  const snapshot = PD_IPO_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (!snapshot) return { status: 'empty' };
  return { status: 'snapshot', ...snapshot };
}
