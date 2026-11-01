/** Fine Star decision and notes for 2021. Amounts follow the public filing and the notes. */

const FINESTAR_SLUG = 'finestar';

export type BiljeskePair = {
  label: string;
  previous: number;
  current: number;
};

export type BiljeskeMoney = {
  label: string;
  amount: string;
};

export type BiljeskeSnapshot = {
  slug: string;
  year: number;
  currency: 'HRK';
  place: string;
  street: string;
  decidedOn: string;
  approvedOn: string;
  foundedYear: number;
  mbs: string;
  nkd: string;
  representative: string;
  cash: string;
  decision: BiljeskeMoney[];
  assets: BiljeskePair[];
  capital: BiljeskePair[];
  liabilities: BiljeskePair[];
  income: BiljeskePair[];
  tax: BiljeskeMoney[];
};

const FINESTAR_BILJESKE_2021: BiljeskeSnapshot = {
  slug: FINESTAR_SLUG,
  year: 2021,
  currency: 'HRK',
  place: 'Šibenik',
  street: 'Bana Josipa Jelačića 58',
  decidedOn: '2022-03-24',
  approvedOn: '2022-03-24',
  foundedYear: 2013,
  mbs: '080885494',
  nkd: '4690',
  representative: 'Toni Šupe',
  cash: '9604.00',
  decision: [
    { label: 'Gubitak nakon oporezivanja', amount: '8775.11' },
    { label: 'Iz zadržane dobiti', amount: '0.00' },
    { label: 'Iz rezervi', amount: '0.00' },
    { label: 'Prijenos na nepokrivene gubitke', amount: '8775.11' },
  ],
  assets: [
    { label: 'Zemljište', previous: 664768, current: 664768 },
    { label: 'Potraživanja od države', previous: 245, current: 605 },
    { label: 'Ostala potraživanja', previous: 3275, current: 0 },
    { label: 'Potraživanja', previous: 3520, current: 605 },
    { label: 'Dani zajmovi, depoziti i slično', previous: 17736, current: 21544 },
    { label: 'Novac u banci i blagajni', previous: 0, current: 9604 },
    { label: 'Ukupno aktiva', previous: 686024, current: 696521 },
  ],
  capital: [
    { label: 'Temeljni kapital', previous: 20000, current: 20000 },
    { label: 'Zadržana dobit ili preneseni gubitak', previous: -2019, current: -2020 },
    { label: 'Dobit ili gubitak poslovne godine', previous: -1, current: -8775 },
    { label: 'Kapital i rezerve', previous: 17980, current: 9205 },
  ],
  liabilities: [
    { label: 'Obveze za zajmove, depozite i slično', previous: 0, current: 364954 },
    { label: 'Obveze prema dobavljačima', previous: 664768, current: 317443 },
    { label: 'Obveze za poreze, doprinose i slična davanja', previous: 1, current: 4919 },
    { label: 'Ostale obveze', previous: 3275, current: 0 },
    { label: 'Kratkoročne obveze', previous: 668044, current: 687316 },
  ],
  income: [
    { label: 'Materijalni troškovi', previous: 0, current: 1440 },
    { label: 'Ostali troškovi', previous: 1, current: 1728 },
    { label: 'Poslovni rashodi', previous: 1, current: 3168 },
    { label: 'Kamate', previous: 0, current: 534 },
    { label: 'Nerealizirani dobici', previous: 0, current: 3275 },
    { label: 'Financijski prihodi', previous: 0, current: 3809 },
    { label: 'Kamate u rashodima', previous: 0, current: 5500 },
    { label: 'Tečajne razlike', previous: 0, current: 371 },
    { label: 'Ostali financijski rashodi', previous: 0, current: 3545 },
    { label: 'Financijski rashodi', previous: 0, current: 9416 },
    { label: 'Ukupni prihodi', previous: 0, current: 3809 },
    { label: 'Ukupni rashodi', previous: 1, current: 12584 },
    { label: 'Dobit ili gubitak prije oporezivanja', previous: -1, current: -8775 },
  ],
  tax: [
    { label: 'Prihodi', amount: '3809.35' },
    { label: 'Rashodi', amount: '12584.46' },
    { label: 'Gubitak', amount: '8775.11' },
    { label: 'Preneseni gubitak', amount: '1590.00' },
    { label: 'Porezna osnovica', amount: '10365.11' },
    { label: 'Stopa', amount: '10' },
    { label: 'Porez', amount: '0.00' },
  ],
};

const BILJESKE_SNAPSHOTS = [FINESTAR_BILJESKE_2021];

export function biljeskeYears(slug: string): number[] {
  return BILJESKE_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function biljeskeForTenantYear(slug: string, year: number): BiljeskeSnapshot | null {
  return BILJESKE_SNAPSHOTS.find((snapshot) => snapshot.slug === slug && snapshot.year === year) ?? null;
}
