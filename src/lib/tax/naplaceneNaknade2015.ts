/** Request to apply VAT cash accounting from 01.01.2016. Not a return and not an approval. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_NAPLACENE_NAKNADE_YEAR = 2015;

export type NaplaceneNaknadeView =
  | {
      status: 'snapshot';
      year: number;
      taxpayerName: string;
      oib: string;
      street: string;
      place: string;
      officeName: string;
      signedOn: string;
      effectiveFrom: string;
      body: string;
    }
  | { status: 'empty' };

const NAPLACENE_NAKNADE_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_NAPLACENE_NAKNADE_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    street: 'A. T. Mimare 46',
    place: 'Zagreb',
    officeName: 'Porezna uprava Zagreb, Ispostava Susedgrad',
    signedOn: '2015-12-21',
    effectiveFrom: '2016-01-01',
    body: 'Molimo primjenu postupka oporezivanja prema naplaćenim naknadama od 01.01.2016.',
  },
];

export function naplaceneNaknadeHref(slug: string): string {
  return `/t/${slug}/porezi/naplacene-naknade`;
}

/** Years that already have this request, newest first. */
export function naplaceneNaknadeYears(slug: string): number[] {
  return NAPLACENE_NAKNADE_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function naplaceneNaknadeForTenantYear(slug: string, year: number): NaplaceneNaknadeView {
  const snapshot = NAPLACENE_NAKNADE_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (!snapshot) return { status: 'empty' };
  return { status: 'snapshot', ...snapshot };
}
