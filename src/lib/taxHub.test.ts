import { describe, expect, it } from 'vitest';

import { TAX_HUB_GROUPS, taxHubReadyForms } from './taxHub';

describe('TAX_HUB_GROUPS', () => {
  it('does not expose EU poslovanje as a hub group', () => {
    expect(TAX_HUB_GROUPS.map((group) => group.id)).toEqual([
      'pdv',
      'porez-na-dobit',
      'porez-na-potrosnju',
      'joppd',
      'predaje',
      'kalendar',
    ]);
    expect(TAX_HUB_GROUPS.some((group) => group.id === 'eu-poslovanje')).toBe(false);
    expect(TAX_HUB_GROUPS.some((group) => /eu poslovanje/i.test(group.label))).toBe(false);
  });

  it('lists EU forms under VAT with EU poslovanje in the label', () => {
    const vat = TAX_HUB_GROUPS.find((group) => group.id === 'pdv');
    expect(vat?.forms.map((form) => form.id)).toEqual([
      'pdv',
      'pdv-ispravak',
      'pdv-s',
      'zp',
      'oss',
    ]);
    expect(vat?.forms.find((form) => form.id === 'pdv-s')?.label).toBe('PDV-S (EU poslovanje)');
    expect(vat?.forms.find((form) => form.id === 'zp')?.label).toBe('ZP (EU poslovanje)');
    expect(vat?.forms.find((form) => form.id === 'oss')?.label).toBe('OSS (EU poslovanje)');
  });

  it('makes only PDV and PDV-S live, both via Razdoblja', () => {
    const ready = taxHubReadyForms();
    expect(ready.map((form) => form.id)).toEqual(['pdv', 'pdv-s']);
    expect(ready.every((form) => form.href?.('finestar') === '/t/finestar/porezi/pdv')).toBe(true);
    expect(ready.some((form) => form.href?.('finestar').includes('/pdv-s'))).toBe(false);
    expect(TAX_HUB_GROUPS.flatMap((group) => group.forms).some((form) => form.href?.('x')?.includes('/zp'))).toBe(
      false,
    );
  });

  it('asks PDV-S users to pick a period on Razdoblja', () => {
    const pdvS = TAX_HUB_GROUPS.flatMap((group) => group.forms).find((form) => form.id === 'pdv-s');
    expect(pdvS?.note).toBe('Odaberite razdoblje');
  });
});
