import { describe, expect, it } from 'vitest';

import {
  naplaceneNaknadeForTenantYear,
  naplaceneNaknadeHref,
  naplaceneNaknadeYears,
} from './naplaceneNaknade2015';

describe('Fine Star naplaćene naknade 2015', () => {
  it('keeps the request to apply cash accounting from 2016', () => {
    expect(naplaceneNaknadeYears('finestar')).toEqual([2015]);
    expect(naplaceneNaknadeYears('other')).toEqual([]);
    expect(naplaceneNaknadeHref('finestar')).toBe('/t/finestar/porezi/naplacene-naknade');
    const view = naplaceneNaknadeForTenantYear('finestar', 2015);
    expect(view).toMatchObject({
      status: 'snapshot',
      oib: '36619131370',
      street: 'A. T. Mimare 46',
      officeName: 'Porezna uprava Zagreb, Ispostava Susedgrad',
      signedOn: '2015-12-21',
      effectiveFrom: '2016-01-01',
    });
    expect(naplaceneNaknadeForTenantYear('other', 2015)).toEqual({ status: 'empty' });
  });
});
