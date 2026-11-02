import { pdHref } from './pd';
import { pdIpoHref } from './tax/pdIpo2018';
import { pdvIspravakHref, pdvSListHref, razdobljaHref, zpListHref } from './pdv';
import { izjaveHref } from './tax/izjave2013';
import { joppdHref } from './tax/joppd2022';
import { naplaceneNaknadeHref } from './tax/naplaceneNaknade2015';
import { obrazacTzHref } from './tax/obrazacTz2014';
import { opzHref } from './tax/opz2022';
import { uraHref } from './tax/ura2022';
import { tz2Href } from './tz2';

export type TaxHubForm = {
  id: string;
  label: string;
  ready: boolean;
  note?: string;
  href: ((slug: string) => string) | null;
};

export type TaxHubGroup = {
  id: string;
  label: string;
  forms: TaxHubForm[];
};

export const TAX_HUB_GROUPS: TaxHubGroup[] = [
  {
    id: 'pdv',
    label: 'Porez na dodanu vrijednost',
    forms: [
      { id: 'pdv', label: 'PDV', ready: true, href: razdobljaHref },
      {
        id: 'naplacene-naknade',
        label: 'Oporezivanje prema naplaćenim naknadama',
        ready: true,
        href: naplaceneNaknadeHref,
      },
      { id: 'pdv-ispravak', label: 'PDV-ispravak', ready: true, href: pdvIspravakHref },
      { id: 'pdv-s', label: 'PDV-S (EU poslovanje)', ready: true, href: pdvSListHref },
      { id: 'zp', label: 'ZP (EU poslovanje)', ready: true, href: zpListHref },
      { id: 'u-ra', label: 'U-RA', ready: true, href: uraHref },
      { id: 'oss', label: 'OSS (EU poslovanje)', ready: false, href: null },
    ],
  },
  {
    id: 'porez-na-dobit',
    label: 'Porez na dobit',
    forms: [
      { id: 'pd', label: 'PD', ready: true, href: pdHref },
      { id: 'pd-ipo', label: 'PD-IPO', ready: true, href: pdIpoHref },
    ],
  },
  {
    id: 'porez-na-potrosnju',
    label: 'Porez na potrošnju',
    forms: [{ id: 'ppo', label: 'PPO', ready: false, href: null }],
  },
  {
    id: 'turisticka-clanarina',
    label: 'Turistička članarina',
    forms: [
      { id: 'tz', label: 'Obrazac TZ', ready: true, href: obrazacTzHref },
      { id: 'tz2', label: 'TZ 2', ready: true, href: tz2Href },
    ],
  },
  {
    id: 'joppd',
    label: 'Porez na dohodak i doprinosi',
    forms: [{ id: 'joppd', label: 'JOPPD', ready: true, href: joppdHref }],
  },
  {
    id: 'predaje',
    label: 'Predaje i potvrde',
    forms: [
      { id: 'izjave', label: 'Izjave', ready: true, href: izjaveHref },
      { id: 'opz', label: 'OPZ', ready: true, href: opzHref },
    ],
  },
  { id: 'kalendar', label: 'Porezni kalendar', forms: [] },
];

export function taxHubReadyForms(groups: TaxHubGroup[] = TAX_HUB_GROUPS): TaxHubForm[] {
  return groups.flatMap((group) => group.forms).filter((form) => form.ready);
}
