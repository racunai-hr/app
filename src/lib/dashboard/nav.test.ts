import { describe, expect, it } from 'vitest';

import { APP_NAV, isNavActive } from './nav';

describe('APP_NAV', () => {
  it('builds tenant paths from the active slug', () => {
    const byId = Object.fromEntries(APP_NAV.map((item) => [item.id, item]));
    expect(byId.pregled.href('finestar')).toBe('/dashboard');
    expect(byId.saldakonti.href('finestar')).toBe('/t/finestar/saldakonti');
    expect(byId.dokumenti.href('finestar')).toBe('/t/finestar/dokumenti');
    expect(byId.porezi.href('finestar')).toBe('/t/finestar/porezi');
  });

  it('marks the current module as active', () => {
    const docs = APP_NAV.find((item) => item.id === 'dokumenti');
    const saldakonti = APP_NAV.find((item) => item.id === 'saldakonti');
    const pregled = APP_NAV.find((item) => item.id === 'pregled');
    expect(docs && saldakonti && pregled).toBeTruthy();
    expect(isNavActive('/dashboard', pregled!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/saldakonti', saldakonti!, 'finestar')).toBe(true);
    expect(isNavActive('/t/finestar/saldakonti', docs!, 'finestar')).toBe(false);
  });
});
