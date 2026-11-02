/** Filed opening statements given to the tax office on 26.02.2014. Not a tax return. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_IZJAVE_YEAR = 2013;

export type Izjava = {
  id: string;
  title: string;
  body: string;
  signedOn?: string;
};

export type IzjaveView =
  | {
      status: 'snapshot';
      year: number;
      taxpayerName: string;
      oib: string;
      address: string;
      officeName: string;
      registeredOn: '2013-12-12';
      signedOn: '2014-02-26';
      statements: Izjava[];
    }
  | { status: 'empty' };

const FINESTAR_IZJAVE_2013: Izjava[] = [
  {
    id: 'djelatnost',
    title: 'Neobavljanje djelatnosti',
    body: 'Od 12.12.2013. do 26.02.2014. nije bilo izlaznih računa, isporuka dobara i usluga ni poduzetničke djelatnosti. Nema zaposlenih. U 2014. društvo će biti kvartalni obveznik PDV-a.',
  },
  {
    id: 'vlasnistvo',
    title: 'Većinsko vlasništvo',
    body: 'Nikola Banović, OIB 03626641565, Ivane Brlić-Mažuranić 23, Zagreb, ima 100 % udjela od 12.12.2013. Nema drugog vlasnika ni povezanog društva.',
  },
  {
    id: 'knjige',
    title: 'Poslovne knjige',
    body: 'Društvo samo vodi poslovne knjige.',
  },
  {
    id: 'adresa',
    title: 'Adresa sjedišta',
    body: 'Na adresi sjedišta koristi se samo poštanski sandučić, pa nema ugovora o zakupu prostora.',
  },
  {
    id: 'porez-na-dobit',
    title: 'Porez na dobit',
    signedOn: '2014-02-17',
    body: 'U 2013. nije bilo poduzetničke djelatnosti, prometa na žiro-računu, poslovnih promjena u knjigama ni zaposlenih. Izjava se daje radi oslobođenja od predaje poreza na dobit za 2013. Potpis Nikola Banović.',
  },
];

const IZJAVE_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_IZJAVE_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    address: 'Ante Topić Mimare 46, Zagreb',
    officeName: 'Zagreb – Susedgrad',
    registeredOn: '2013-12-12' as const,
    signedOn: '2014-02-26' as const,
    statements: FINESTAR_IZJAVE_2013,
  },
];

export function izjaveHref(slug: string): string {
  return `/t/${slug}/porezi/izjave`;
}

/** Years that already have filed statements, newest first. */
export function izjaveYears(slug: string): number[] {
  return IZJAVE_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function izjaveForTenantYear(slug: string, year: number): IzjaveView {
  const snapshot = IZJAVE_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (!snapshot) return { status: 'empty' };
  return { status: 'snapshot', ...snapshot };
}
