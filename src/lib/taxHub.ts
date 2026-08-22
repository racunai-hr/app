import { razdobljaHref } from './pdv';

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

const razdoblja: TaxHubForm['href'] = (slug) => razdobljaHref(slug);

export const TAX_HUB_GROUPS: TaxHubGroup[] = [
  {
    id: 'pdv',
    label: 'Porez na dodanu vrijednost',
    forms: [
      { id: 'pdv', label: 'PDV', ready: true, href: razdoblja },
      { id: 'pdv-ispravak', label: 'PDV-ispravak', ready: false, href: null },
      {
        id: 'pdv-s',
        label: 'PDV-S (EU poslovanje)',
        ready: true,
        note: 'Odaberite razdoblje',
        href: razdoblja,
      },
      { id: 'zp', label: 'ZP (EU poslovanje)', ready: false, href: null },
      { id: 'oss', label: 'OSS (EU poslovanje)', ready: false, href: null },
    ],
  },
  {
    id: 'porez-na-dobit',
    label: 'Porez na dobit',
    forms: [{ id: 'pd', label: 'PD', ready: false, href: null }],
  },
  {
    id: 'porez-na-potrosnju',
    label: 'Porez na potrošnju',
    forms: [{ id: 'ppo', label: 'PPO', ready: false, href: null }],
  },
  {
    id: 'joppd',
    label: 'Porez na dohodak i doprinosi',
    forms: [{ id: 'joppd', label: 'JOPPD', ready: false, href: null }],
  },
  { id: 'predaje', label: 'Predaje i potvrde', forms: [] },
  { id: 'kalendar', label: 'Porezni kalendar', forms: [] },
];

export function taxHubReadyForms(groups: TaxHubGroup[] = TAX_HUB_GROUPS): TaxHubForm[] {
  return groups.flatMap((group) => group.forms).filter((form) => form.ready);
}
