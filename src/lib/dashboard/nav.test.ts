import { describe, expect, it } from 'vitest';

import { APP_NAV, isNavActive } from './nav';

describe('APP_NAV', () => {
  it('builds tenant paths from the active slug', () => {
    const byId = Object.fromEntries(APP_NAV.map((item) => [item.id, item]));
    expect(byId.pregled.href('finestar')).toBe('/dashboard');
    expect(byId.bankarstvo.href('finestar')).toBe('/t/finestar/bankarstvo');
    expect(byId.saldakonti.href('finestar')).toBe('/t/finestar/saldakonti');
    expect(byId['glavna-knjiga'].href('finestar')).toBe('/t/finestar/glavna-knjiga');
    expect(byId.dokumenti.href('finestar')).toBe('/t/finestar/dokumenti');
    expect(byId.porezi.href('finestar')).toBe('/t/finestar/porezi');
  });

  it('marks the current module as active', () => {
    const docs = APP_NAV.find((item) => item.id === 'dokumenti');
    const saldakonti = APP_NAV.find((item) => item.id === 'saldakonti');
    const bankarstvo = APP_NAV.find((item) => item.id === 'bankarstvo');
    const glavnaKnjiga = APP_NAV.find((item) => item.id === 'glavna-knjiga');
    const pregled = APP_NAV.find((item) => item.id === 'pregled');
    expect(docs && saldakonti && bankarstvo && glavnaKnjiga && pregled).toBeTruthy();
    expect(isNavActive('/dashboard', pregled!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/saldakonti', saldakonti!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/saldakonti', docs!, 'finestar')).toBe(false);
    expect(isNavActive('/t/finestar/glavna-knjiga', glavnaKnjiga!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/bankarstvo', bankarstvo!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/bankarstvo/racuni', bankarstvo!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/bankarstvo/uskladivanje', docs!, 'finestar')).toBe(false);
  });
});
