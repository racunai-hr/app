import { describe, expect, it } from 'vitest';

import { izjaveForTenantYear, izjaveHref, izjaveYears } from './izjave2013';

describe('Fine Star izjave 2013', () => {
  it('keeps the four filed statements', () => {
    expect(izjaveYears('finestar')).toEqual([2013]);
    expect(izjaveYears('alma-cizmic')).toEqual([]);
    expect(izjaveHref('finestar')).toBe('/t/finestar/porezi/izjave');
    const view = izjaveForTenantYear('finestar', 2013);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.registeredOn).toBe('2013-12-12');
    expect(view.signedOn).toBe('2014-02-26');
    expect(view.statements.map((statement) => statement.id)).toEqual([
      'djelatnost',
      'vlasnistvo',
      'knjige',
      'adresa',
      'porez-na-dobit',
    ]);
    expect(view.statements.find((statement) => statement.id === 'porez-na-dobit')?.signedOn).toBe(
      '2014-02-17',
    );
    expect(view.statements.find((statement) => statement.id === 'vlasnistvo')?.body).toContain(
      '03626641565',
    );
  });
});
