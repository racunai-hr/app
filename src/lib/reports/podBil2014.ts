/** POD-BIL snapshots. Through 2015 the pre-2016 AOP scheme, from 2016 the GFI scheme. */

import { FINESTAR_POD_BIL_2016 } from './podBil2016';
import { FINESTAR_POD_BIL_2017 } from './podBil2017';
import { FINESTAR_POD_BIL_2018 } from './podBil2018';
import { FINESTAR_POD_BIL_2019 } from './podBil2019';
import { FINESTAR_POD_BIL_2020 } from './podBil2020';
import { FINESTAR_POD_BIL_2021 } from './podBil2021';
import { FINESTAR_POD_BIL_2022 } from './podBil2022';

export const POD_BIL_SCHEME_FROM_YEAR = 2016;
export const FINESTAR_POD_BIL_YEAR = 2014;
export const FINESTAR_POD_BIL_2015_YEAR = 2015;
export const FINESTAR_POD_BIL_2016_YEAR = 2016;
export const FINESTAR_POD_BIL_2017_YEAR = 2017;
export const FINESTAR_POD_BIL_2018_YEAR = 2018;
export const FINESTAR_POD_BIL_2019_YEAR = 2019;
export const FINESTAR_POD_BIL_2020_YEAR = 2020;
export const FINESTAR_POD_BIL_2021_YEAR = 2021;
export const FINESTAR_POD_BIL_2022_YEAR = 2022;
export const FINESTAR_SLUG = 'finestar';

export type PodBilKind = 'banner' | 'section' | 'group' | 'line' | 'total';

export type PodBilRow = {
  aop: string;
  label: string;
  depth: 0 | 1 | 2;
  kind: PodBilKind;
  previous: number;
  current: number;
};

export type PodBilView =
  | {
      status: 'snapshot';
      year: number;
      scheme: 'pre-2016' | 'from-2016';
      currency: 'HRK';
      asOf: string;
      rows: PodBilRow[];
    }
  | { status: 'empty'; year: number; scheme: 'pre-2016' | 'from-2016' };

function row(
  aop: string,
  label: string,
  depth: 0 | 1 | 2,
  kind: PodBilKind,
  current = 0,
): PodBilRow {
  return { aop, label, depth, kind, previous: 0, current };
}

function banner(label: string): PodBilRow {
  return row('', label, 0, 'banner');
}

/** Fine Star closing balance sheet, 31.12.2014., whole kuna, previous year zero. */
export const FINESTAR_POD_BIL_2014: PodBilRow[] = [
  banner('Aktiva'),
  row('001', 'A) Potraživanja za upisani a neuplaćeni kapital', 0, 'section'),
  row('002', 'B) Dugotrajna imovina (003+010+020+029+033)', 0, 'section'),
  row('003', 'I. Nematerijalna imovina (004 do 009)', 1, 'group'),
  row('004', '1. Izdaci za razvoj', 2, 'line'),
  row('005', '2. Koncesije, patenti, licencije, robne i uslužne marke, softver i ostala prava', 2, 'line'),
  row('006', '3. Goodwill', 2, 'line'),
  row('007', '4. Predujmovi za nabavu nematerijalne imovine', 2, 'line'),
  row('008', '5. Nematerijalna imovina u pripremi', 2, 'line'),
  row('009', '6. Ostala nematerijalna imovina', 2, 'line'),
  row('010', 'II. Materijalna imovina (011 do 019)', 1, 'group'),
  row('011', '1. Zemljište', 2, 'line'),
  row('012', '2. Građevinski objekti', 2, 'line'),
  row('013', '3. Postrojenja i oprema', 2, 'line'),
  row('014', '4. Alati, pogonski inventar i transportna imovina', 2, 'line'),
  row('015', '5. Biološka imovina', 2, 'line'),
  row('016', '6. Predujmovi za materijalnu imovinu', 2, 'line'),
  row('017', '7. Materijalna imovina u pripremi', 2, 'line'),
  row('018', '8. Ostala materijalna imovina', 2, 'line'),
  row('019', '9. Ulaganje u nekretnine', 2, 'line'),
  row('020', 'III. Dugotrajna financijska imovina (021 do 028)', 1, 'group'),
  row('021', '1. Udjeli (dionice) kod povezanih poduzetnika', 2, 'line'),
  row('022', '2. Dani zajmovi povezanim poduzetnicima', 2, 'line'),
  row('023', '3. Sudjelujući interesi (udjeli)', 2, 'line'),
  row('024', '4. Zajmovi dani poduzetnicima u kojima postoje sudjelujući interesi', 2, 'line'),
  row('025', '5. Ulaganja u vrijednosne papire', 2, 'line'),
  row('026', '6. Dani zajmovi, depoziti i slično', 2, 'line'),
  row('027', '7. Ostala dugotrajna financijska imovina', 2, 'line'),
  row('028', '8. Ulaganja koja se obračunavaju metodom udjela', 2, 'line'),
  row('029', 'IV. Potraživanja (030 do 032)', 1, 'group'),
  row('030', '1. Potraživanja od povezanih poduzetnika', 2, 'line'),
  row('031', '2. Potraživanja po osnovi prodaje na kredit', 2, 'line'),
  row('032', '3. Ostala potraživanja', 2, 'line'),
  row('033', 'V. Odgođena porezna imovina', 1, 'group'),
  row('034', 'C) Kratkotrajna imovina (035+043+050+058)', 0, 'section', 20100),
  row('035', 'I. Zalihe (036 do 042)', 1, 'group'),
  row('036', '1. Sirovine i materijal', 2, 'line'),
  row('037', '2. Proizvodnja u tijeku', 2, 'line'),
  row('038', '3. Gotovi proizvodi', 2, 'line'),
  row('039', '4. Trgovačka roba', 2, 'line'),
  row('040', '5. Predujmovi za zalihe', 2, 'line'),
  row('041', '6. Dugotrajna imovina namijenjena prodaji', 2, 'line'),
  row('042', '7. Biološka imovina', 2, 'line'),
  row('043', 'II. Potraživanja (044 do 049)', 1, 'group', 300),
  row('044', '1. Potraživanja od povezanih poduzetnika', 2, 'line'),
  row('045', '2. Potraživanja od kupaca', 2, 'line', 300),
  row('046', '3. Potraživanja od sudjelujućih poduzetnika', 2, 'line'),
  row('047', '4. Potraživanja od zaposlenika i članova poduzetnika', 2, 'line'),
  row('048', '5. Potraživanja od države i drugih institucija', 2, 'line'),
  row('049', '6. Ostala potraživanja', 2, 'line'),
  row('050', 'III. Kratkotrajna financijska imovina (051 do 057)', 1, 'group', 10000),
  row('051', '1. Udjeli (dionice) kod povezanih poduzetnika', 2, 'line'),
  row('052', '2. Dani zajmovi povezanim poduzetnicima', 2, 'line'),
  row('053', '3. Sudjelujući interesi (udjeli)', 2, 'line'),
  row('054', '4. Zajmovi dani poduzetnicima u kojima postoje sudjelujući interesi', 2, 'line'),
  row('055', '5. Ulaganja u vrijednosne papire', 2, 'line', 10000),
  row('056', '6. Dani zajmovi, depoziti i slično', 2, 'line'),
  row('057', '7. Ostala financijska imovina', 2, 'line'),
  row('058', 'IV. Novac u banci i blagajni', 1, 'group', 9800),
  row('059', 'D) Plaćeni troškovi budućeg razdoblja i obračunati prihodi', 0, 'section'),
  row('060', 'E) Ukupno aktiva (001+002+034+059)', 0, 'total', 20100),
  row('061', 'F) Izvanbilančni zapisi', 0, 'section'),
  banner('Pasiva'),
  row('062', 'A) Kapital i rezerve (063+064+065+071+072+075+078)', 0, 'section', 19800),
  row('063', 'I. Temeljni (upisani) kapital', 1, 'group', 20000),
  row('064', 'II. Kapitalne rezerve', 1, 'group'),
  row('065', 'III. Rezerve iz dobiti (066+067−068+069+070)', 1, 'group'),
  row('066', '1. Zakonske rezerve', 2, 'line'),
  row('067', '2. Rezerve za vlastite dionice', 2, 'line'),
  row('068', '3. Vlastite dionice i udjeli (odbitna stavka)', 2, 'line'),
  row('069', '4. Statutarne rezerve', 2, 'line'),
  row('070', '5. Ostale rezerve', 2, 'line'),
  row('071', 'IV. Revalorizacijske rezerve', 1, 'group'),
  row('072', 'V. Zadržana dobit ili preneseni gubitak (073−074)', 1, 'group'),
  row('073', '1. Zadržana dobit', 2, 'line'),
  row('074', '2. Preneseni gubitak', 2, 'line'),
  row('075', 'VI. Dobit ili gubitak poslovne godine (076−077)', 1, 'group', -200),
  row('076', '1. Dobit poslovne godine', 2, 'line'),
  row('077', '2. Gubitak poslovne godine', 2, 'line', 200),
  row('078', 'VII. Manjinski interes', 1, 'group'),
  row('079', 'B) Rezerviranja (080 do 082)', 0, 'section'),
  row('080', '1. Rezerviranja za mirovine, otpremnine i slične obveze', 2, 'line'),
  row('081', '2. Rezerviranja za porezne obveze', 2, 'line'),
  row('082', '3. Druga rezerviranja', 2, 'line'),
  row('083', 'C) Dugoročne obveze (084 do 092)', 0, 'section'),
  row('084', '1. Obveze prema povezanim poduzetnicima', 2, 'line'),
  row('085', '2. Obveze za zajmove, depozite i slično', 2, 'line'),
  row('086', '3. Obveze prema bankama i drugim financijskim institucijama', 2, 'line'),
  row('087', '4. Obveze za predujmove', 2, 'line'),
  row('088', '5. Obveze prema dobavljačima', 2, 'line'),
  row('089', '6. Obveze po vrijednosnim papirima', 2, 'line'),
  row('090', '7. Obveze prema poduzetnicima u kojima postoje sudjelujući interesi', 2, 'line'),
  row('091', '8. Ostale dugoročne obveze', 2, 'line'),
  row('092', '9. Odgođena porezna obveza', 2, 'line'),
  row('093', 'D) Kratkoročne obveze (094 do 105)', 0, 'section'),
  row('094', '1. Obveze prema povezanim poduzetnicima', 2, 'line'),
  row('095', '2. Obveze za zajmove, depozite i slično', 2, 'line'),
  row('096', '3. Obveze prema bankama i drugim financijskim institucijama', 2, 'line'),
  row('097', '4. Obveze za predujmove', 2, 'line'),
  row('098', '5. Obveze prema dobavljačima', 2, 'line'),
  row('099', '6. Obveze po vrijednosnim papirima', 2, 'line'),
  row('100', '7. Obveze prema poduzetnicima u kojima postoje sudjelujući interesi', 2, 'line'),
  row('101', '8. Obveze prema zaposlenicima', 2, 'line'),
  row('102', '9. Obveze za poreze, doprinose i slična davanja', 2, 'line'),
  row('103', '10. Obveze s osnove udjela u rezultatu', 2, 'line'),
  row('104', '11. Obveze po osnovi dugotrajne imovine namijenjene prodaji', 2, 'line'),
  row('105', '12. Ostale kratkoročne obveze', 2, 'line'),
  row('106', 'E) Odgođeno plaćanje troškova i prihod budućega razdoblja', 0, 'section', 300),
  row('107', 'F) Ukupno pasiva (062+079+083+093+106)', 0, 'total', 20100),
  row('108', 'G) Izvanbilančni zapisi', 0, 'section'),
  banner('Dodatak bilanci'),
  row('109', '1. Pripisano imateljima kapitala matice', 2, 'line'),
  row('110', '2. Pripisano manjinskom interesu', 2, 'line'),
];

/** Fine Star balance sheet, 31.12.2015. Previous column is the printed 2014 comparative. */
const POD_BIL_2015_AMOUNTS: Record<string, [number, number]> = {
  '034': [20100, 20694],
  '043': [300, 894],
  '045': [300, 894],
  '050': [10000, 19800],
  '055': [0, 19800],
  '056': [10000, 0],
  '058': [9800, 0],
  '060': [20100, 20694],
  '062': [19800, 19800],
  '063': [20000, 20000],
  '072': [0, -200],
  '074': [0, 200],
  '075': [-200, 0],
  '077': [200, 0],
  '106': [300, 894],
  '107': [20100, 20694],
};

export const FINESTAR_POD_BIL_2015: PodBilRow[] = FINESTAR_POD_BIL_2014.map((line) => {
  const pair = POD_BIL_2015_AMOUNTS[line.aop];
  if (!pair) return { ...line, previous: 0, current: 0 };
  return { ...line, previous: pair[0], current: pair[1] };
});

export function podBilAmount(aop: string, rows: PodBilRow[] = FINESTAR_POD_BIL_2014): number {
  const found = rows.find((line) => line.aop === aop);
  if (!found) throw new Error(`AOP ${aop} nije u obrascu POD-BIL.`);
  return found.current;
}

export function formatPodBilAmount(value: number): string {
  const body = new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(Math.abs(value))
    .map((part) => (part.type === 'group' ? '.' : part.value))
    .join('');
  return value < 0 ? `−${body}` : body;
}

const POD_BIL_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2022_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2022-12-31',
    rows: FINESTAR_POD_BIL_2022,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2021_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2021-12-31',
    rows: FINESTAR_POD_BIL_2021,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2020_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2020-12-31',
    rows: FINESTAR_POD_BIL_2020,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2019_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2019-12-31',
    rows: FINESTAR_POD_BIL_2019,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2018_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2018-12-31',
    rows: FINESTAR_POD_BIL_2018,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2017_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2017-12-31',
    rows: FINESTAR_POD_BIL_2017,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2016_YEAR,
    scheme: 'from-2016' as const,
    currency: 'HRK' as const,
    asOf: '2016-12-31',
    rows: FINESTAR_POD_BIL_2016,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_2015_YEAR,
    scheme: 'pre-2016' as const,
    currency: 'HRK' as const,
    asOf: '2015-12-31',
    rows: FINESTAR_POD_BIL_2015,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_POD_BIL_YEAR,
    scheme: 'pre-2016' as const,
    currency: 'HRK' as const,
    asOf: '2014-12-31',
    rows: FINESTAR_POD_BIL_2014,
  },
];

/** Years that already have a generated POD-BIL, newest first. */
export function podBilYears(slug: string): number[] {
  return POD_BIL_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function podBilForTenantYear(slug: string, year: number): PodBilView {
  const snapshot = POD_BIL_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (snapshot) {
    return {
      status: 'snapshot',
      year: snapshot.year,
      scheme: snapshot.scheme,
      currency: snapshot.currency,
      asOf: snapshot.asOf,
      rows: snapshot.rows,
    };
  }
  if (!Number.isInteger(year) || year >= POD_BIL_SCHEME_FROM_YEAR) {
    return {
      status: 'empty',
      year,
      scheme: Number.isInteger(year) && year >= POD_BIL_SCHEME_FROM_YEAR ? 'from-2016' : 'pre-2016',
    };
  }
  return { status: 'empty', year, scheme: 'pre-2016' };
}
