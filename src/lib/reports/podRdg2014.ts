/** POD-RDG snapshots. Through 2015 the pre-2016 AOP scheme, from 2016 the GFI scheme. */

import { FINESTAR_SLUG, formatPodBilAmount } from './podBil2014';

import { FINESTAR_POD_RDG_2016 } from './podRdg2016';
import { FINESTAR_POD_RDG_2017 } from './podRdg2017';
import { FINESTAR_POD_RDG_2018 } from './podRdg2018';
import { FINESTAR_POD_RDG_2019 } from './podRdg2019';
import { FINESTAR_POD_RDG_2020 } from './podRdg2020';
import { FINESTAR_POD_RDG_2021 } from './podRdg2021';

export const FINESTAR_POD_RDG_YEAR = 2014;
export const FINESTAR_POD_RDG_2015_YEAR = 2015;
export const FINESTAR_POD_RDG_2016_YEAR = 2016;
export const FINESTAR_POD_RDG_2017_YEAR = 2017;
export const FINESTAR_POD_RDG_2018_YEAR = 2018;
export const FINESTAR_POD_RDG_2019_YEAR = 2019;
export const FINESTAR_POD_RDG_2020_YEAR = 2020;
export const FINESTAR_POD_RDG_2021_YEAR = 2021;

export type PodRdgKind = 'banner' | 'section' | 'group' | 'line' | 'total';

export type PodRdgRow = {
  aop: string;
  label: string;
  depth: 0 | 1 | 2;
  kind: PodRdgKind;
  previous: number;
  current: number;
};

export type PodRdgView =
  | {
      status: 'snapshot';
      year: number;
      scheme: 'pre-2016' | 'from-2016';
      currency: 'HRK';
      periodFrom: string;
      periodTo: string;
      rows: PodRdgRow[];
    }
  | { status: 'empty'; year: number; scheme: 'pre-2016' | 'from-2016' };

function row(
  aop: string,
  label: string,
  depth: 0 | 1 | 2,
  kind: PodRdgKind,
  current = 0,
): PodRdgRow {
  return { aop, label, depth, kind, previous: 0, current };
}

function banner(label: string): PodRdgRow {
  return row('', label, 0, 'banner');
}

/** Fine Star income statement, 01.01.–31.12.2014., whole kuna, prior period zero. */
export const FINESTAR_POD_RDG_2014: PodRdgRow[] = [
  row('111', 'Poslovni prihodi (112+113)', 0, 'section'),
  row('112', '1. Prihodi od prodaje', 1, 'group'),
  row('113', '2. Ostali poslovni prihodi', 1, 'group'),
  row('114', 'I. Poslovni rashodi (115+116+120+124+125+126+129+130)', 0, 'section', 205),
  row('115', '1. Promjene vrijednosti zaliha proizvodnje u tijeku i gotovih proizvoda', 1, 'group'),
  row('116', '2. Materijalni troškovi (117 do 119)', 1, 'group'),
  row('117', 'a) Troškovi sirovina i materijala', 2, 'line'),
  row('118', 'b) Troškovi prodane robe', 2, 'line'),
  row('119', 'c) Ostali vanjski troškovi', 2, 'line'),
  row('120', '3. Troškovi osoblja (121 do 123)', 1, 'group'),
  row('121', 'a) Neto plaće i nadnice', 2, 'line'),
  row('122', 'b) Troškovi poreza i doprinosa iz plaća', 2, 'line'),
  row('123', 'c) Doprinosi na plaće', 2, 'line'),
  row('124', '4. Amortizacija', 1, 'group'),
  row('125', '5. Ostali troškovi', 1, 'group', 205),
  row('126', '6. Vrijednosno usklađivanje (127+128)', 1, 'group'),
  row('127', 'a) Dugotrajne imovine (osim financijske imovine)', 2, 'line'),
  row('128', 'b) Kratkotrajne imovine (osim financijske imovine)', 2, 'line'),
  row('129', '7. Rezerviranja', 1, 'group'),
  row('130', '8. Ostali poslovni rashodi', 1, 'group'),
  row('131', 'III. Financijski prihodi (132 do 136)', 0, 'section', 5),
  row('132', '1. Kamate, tečajne razlike, dividende i slični prihodi iz odnosa s povezanim poduzetnicima', 1, 'group'),
  row('133', '2. Kamate, tečajne razlike, dividende i slični prihodi iz odnosa s nepovezanim poduzetnicima i drugim osobama', 1, 'group', 5),
  row('134', '3. Dio prihoda od pridruženih poduzetnika i sudjelujućih interesa', 1, 'group'),
  row('135', '4. Nerealizirani dobici (prihodi) od financijske imovine', 1, 'group'),
  row('136', '5. Ostali financijski prihodi', 1, 'group'),
  row('137', 'IV. Financijski rashodi (138 do 141)', 0, 'section'),
  row('138', '1. Kamate, tečajne razlike i drugi rashodi s povezanim poduzetnicima', 1, 'group'),
  row('139', '2. Kamate, tečajne razlike i drugi rashodi iz odnosa s nepovezanim poduzetnicima i drugim osobama', 1, 'group'),
  row('140', '3. Nerealizirani gubici (rashodi) financijske imovine', 1, 'group'),
  row('141', '4. Ostali financijski rashodi', 1, 'group'),
  row('142', 'V. Udio u dobiti od pridruženih poduzetnika', 0, 'section'),
  row('143', 'VI. Udio u gubitku od pridruženih poduzetnika', 0, 'section'),
  row('144', 'VII. Izvanredni — ostali prihodi', 0, 'section'),
  row('145', 'VIII. Izvanredni — ostali rashodi', 0, 'section'),
  row('146', 'IX. Ukupni prihodi (111+131+142+144)', 0, 'total', 5),
  row('147', 'X. Ukupni rashodi (114+137+143+145)', 0, 'total', 205),
  row('148', 'XI. Dobit ili gubitak prije oporezivanja (146−147)', 0, 'total', -200),
  row('149', '1. Dobit prije oporezivanja (146−147)', 1, 'group'),
  row('150', '2. Gubitak prije oporezivanja (147−146)', 1, 'group', 200),
  row('151', 'XII. Porezna dobit', 0, 'section'),
  row('152', 'XIII. Dobit ili gubitak razdoblja (148−151)', 0, 'total', -200),
  row('153', '1. Dobit razdoblja (149−151)', 1, 'group'),
  row('154', '2. Gubitak razdoblja (151−148)', 1, 'group', 200),
  banner('Dodatak RDG-u'),
  row('155', '1. Pripisana imateljima kapitala matice', 1, 'line'),
  row('156', '2. Pripisana manjinskom interesu', 1, 'line'),
  banner('Izvještaj o ostaloj sveobuhvatnoj dobiti'),
  row('157', 'Dobit ili gubitak razdoblja', 0, 'section'),
  row('158', 'II. Ostala sveobuhvatna dobit / gubitak prije poreza (159 do 165)', 0, 'section'),
  row('159', '1. Tečajne razlike iz preračuna inozemnog poslovanja', 1, 'group'),
  row('160', '2. Promjene revalorizacijskih rezervi dugotrajne materijalne i nematerijalne imovine', 1, 'group'),
  row('161', '3. Dobit ili gubitak s osnove ponovnog vrednovanja financijske imovine raspoložive za prodaju', 1, 'group'),
  row('162', '4. Dobit ili gubitak s osnove učinkovite zaštite novčanog toka', 1, 'group'),
  row('163', '5. Dobit ili gubitak s osnove učinkovite zaštite neto ulaganja u inozemstvu', 1, 'group'),
  row('164', '6. Udio u ostaloj sveobuhvatnoj dobiti / gubitku pridruženih poduzetnika', 1, 'group'),
  row('165', '7. Aktuarski dobici / gubici po planovima definiranih primanja', 1, 'group'),
  row('166', 'III. Porez na ostalu sveobuhvatnu dobit razdoblja', 0, 'section'),
  row('167', 'IV. Neto ostala sveobuhvatna dobit / gubitak razdoblja (158−166)', 0, 'section'),
  row('168', 'V. Sveobuhvatna dobit ili gubitak razdoblja (157+167)', 0, 'total'),
  banner('Dodatak izvještaju o ostaloj sveobuhvatnoj dobiti'),
  row('169', '1. Pripisana imateljima kapitala matice', 1, 'line'),
  row('170', '2. Pripisana manjinskom interesu', 1, 'line'),
];

/** Fine Star income statement, 01.01.–31.12.2015. Prior period is the printed 2014 column. */
const POD_RDG_2015_AMOUNTS: Record<string, [number, number]> = {
  '114': [205, 0],
  '125': [205, 0],
  '131': [5, 1],
  '133': [5, 0],
  '136': [0, 1],
  '137': [0, 1],
  '141': [0, 1],
  '146': [5, 1],
  '147': [205, 1],
  '148': [-200, 0],
  '150': [200, 0],
  '152': [-200, 0],
  '154': [200, 0],
};

export const FINESTAR_POD_RDG_2015: PodRdgRow[] = FINESTAR_POD_RDG_2014.map((line) => {
  const pair = POD_RDG_2015_AMOUNTS[line.aop];
  if (!pair) return { ...line, previous: 0, current: 0 };
  return { ...line, previous: pair[0], current: pair[1] };
});

export function podRdgAmount(aop: string, rows: PodRdgRow[] = FINESTAR_POD_RDG_2014): number {
  const found = rows.find((line) => line.aop === aop);
  if (!found) throw new Error(`AOP ${aop} nije u obrascu POD-RDG.`);
  return found.current;
}

export const formatPodRdgAmount = formatPodBilAmount;

const POD_RDG_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2021_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2021-01-01',
    periodTo: '2021-12-31',
    rows: FINESTAR_POD_RDG_2021,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2020_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2020-01-01',
    periodTo: '2020-12-31',
    rows: FINESTAR_POD_RDG_2020,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2019_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2019-01-01',
    periodTo: '2019-12-31',
    rows: FINESTAR_POD_RDG_2019,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2018_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2018-01-01',
    periodTo: '2018-12-31',
    rows: FINESTAR_POD_RDG_2018,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2017_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2017-01-01',
    periodTo: '2017-12-31',
    rows: FINESTAR_POD_RDG_2017,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2016_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2016-01-01',
    periodTo: '2016-12-31',
    rows: FINESTAR_POD_RDG_2016,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_2015_YEAR,
    scheme: 'pre-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2015-01-01',
    periodTo: '2015-12-31',
    rows: FINESTAR_POD_RDG_2015,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_RDG_YEAR,
    scheme: 'pre-2016' as const,
    currency: 'HRK' as const,
    periodFrom: '2014-01-01',
    periodTo: '2014-12-31',
    rows: FINESTAR_POD_RDG_2014,
  },
];

/** Years that already have a generated POD-RDG, newest first. */
export function podRdgYears(slug: string): number[] {
  return POD_RDG_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function podRdgForTenantYear(slug: string, year: number): PodRdgView {
  const snapshot = POD_RDG_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (snapshot) {
    return {
      status: 'snapshot',
      year: snapshot.year,
      scheme: snapshot.scheme,
      currency: snapshot.currency,
      periodFrom: snapshot.periodFrom,
      periodTo: snapshot.periodTo,
      rows: snapshot.rows,
    };
  }
  if (Number.isInteger(year) && year >= 2016) {
    return { status: 'empty', year, scheme: 'from-2016' };
  }
  return { status: 'empty', year, scheme: 'pre-2016' };
}
