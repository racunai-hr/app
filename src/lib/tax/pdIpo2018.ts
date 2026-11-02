/** Filed Obrazac PD-IPO v1-0. Related-party loans. Not the profit-tax return. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_PD_IPO_2022_YEAR = 2022;
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

export type PdIpoLoanTotals = {
  amountAtOrigin: string;
  openingPrincipal: string;
  closingPrincipal: string;
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
  loans?: PdIpoReceivable[];
  totals?: PdIpoLoanTotals;
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
      obligationTotals?: PdIpoLoanTotals;
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

const RELATED_COMPANY = {
  country: 'Hrvatska',
  capitalShare: '0.00',
  votingShare: '0.00',
  relation: 'P',
  relationLabel: 'za pravnu osobu koja nije član uprave ili srodnik',
  privilegedTaxStatus: false as const,
  carriedTaxLoss: false as const,
};

function loan(
  originatedOn: string,
  amountAtOrigin: string,
  openingPrincipal: string,
  closingPrincipal: string,
  interestInYear = '0.00',
  interestAtYearEnd = '0.00',
): PdIpoReceivable {
  return {
    originatedOn,
    amountAtOrigin,
    openingPrincipal,
    closingPrincipal,
    interestRate: '2.68',
    interestInYear,
    taxBaseIncrease: '0.00',
    interestAtYearEnd,
  };
}

const SUPINA_LOANS_2022: PdIpoReceivable[] = [
  loan('2022-01-01', '185600.00', '185600.00', '185600.00', '5032.27', '10182.73'),
  loan('2022-05-31', '3000.00', '0.00', '3000.00'),
  loan('2022-06-03', '600.00', '0.00', '600.00'),
  loan('2022-06-10', '100.00', '0.00', '100.00'),
];

const TONI_LOANS_2022: PdIpoReceivable[] = [
  loan('2022-01-05', '80000.00', '0.00', '80000.00'),
  loan('2022-01-12', '35.00', '0.00', '35.00'),
  loan('2022-02-24', '42000.00', '0.00', '42000.00'),
  loan('2022-03-10', '1000.00', '0.00', '1000.00'),
  loan('2022-03-22', '60000.00', '0.00', '60000.00'),
  loan('2022-04-11', '23000.00', '0.00', '23000.00'),
  loan('2022-05-03', '17000.00', '0.00', '17000.00'),
  loan('2022-05-06', '14000.00', '0.00', '14000.00'),
  loan('2022-06-21', '3100.00', '0.00', '934.79'),
  loan('2022-07-13', '4000.00', '0.00', '0.00'),
  loan('2022-07-15', '22700.00', '0.00', '0.00'),
  loan('2022-10-05', '3180.00', '0.00', '0.00'),
];

const PD_IPO_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_PD_IPO_2022_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2022-01-01',
    periodTo: '2022-12-31',
    taxpayerName: 'FINE STAR D.O.O.',
    oib: '36619131370',
    street: 'Bana Josipa Jelačića 58',
    place: 'ŠIEBNIK',
    officeCode: '3383',
    formId: '344f8b3a-e81c-4148-935f-f66901e65ec6',
    signedAt: '2023-06-14T12:12:00+02:00',
    signedBy: 'Zorana Lambaša',
    obligations: [
      {
        name: 'ŠUPINA POLJICA J.D.O.O.',
        oib: '91381354893',
        address: 'ŠIBENIK',
        ...RELATED_COMPANY,
        receivable: SUPINA_LOANS_2022[0],
        loans: SUPINA_LOANS_2022,
        totals: {
          amountAtOrigin: '189300.00',
          openingPrincipal: '185600.00',
          closingPrincipal: '189300.00',
          interestInYear: '5032.27',
          taxBaseIncrease: '0.00',
          interestAtYearEnd: '10182.73',
        },
      },
      {
        name: 'TONI ŠUPE',
        oib: '63281973348',
        address: 'ŠIBENIK',
        ...RELATED_MEMBER,
        receivable: TONI_LOANS_2022[0],
        loans: TONI_LOANS_2022,
        totals: {
          amountAtOrigin: '270015.00',
          openingPrincipal: '0.00',
          closingPrincipal: '237969.79',
          interestInYear: '0.00',
          taxBaseIncrease: '0.00',
          interestAtYearEnd: '0.00',
        },
      },
    ],
    obligationTotals: {
      amountAtOrigin: '459315.00',
      openingPrincipal: '185600.00',
      closingPrincipal: '427269.79',
      interestInYear: '5032.27',
      taxBaseIncrease: '0.00',
      interestAtYearEnd: '10182.73',
    },
    person: {
      name: 'TONI ŠUPE',
      oib: '63281973348',
      address: 'ŠIBENIK',
      ...RELATED_MEMBER,
      receivable: loan('2022-01-01', '17736.25', '17736.25', '0.00', '6.43', '0.00'),
    },
  },
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
