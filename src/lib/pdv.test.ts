import { describe, expect, it } from 'vitest';

import { formatPdvPeriodLabel, parsePdvPeriod, pdvBoxRows, pdvPrijavaHref, pdvSHref } from './pdv';

describe('formatPdvPeriodLabel', () => {
  it('rearranges YYYY-MM without Date parsing', () => {
    expect(formatPdvPeriodLabel('2026-07')).toBe('07/2026');
  });

  it('returns dash for invalid values', () => {
    expect(formatPdvPeriodLabel(null)).toBe('—');
    expect(formatPdvPeriodLabel('july')).toBe('—');
    expect(formatPdvPeriodLabel('2026-13')).toBe('—');
  });
});

describe('parsePdvPeriod', () => {
  it('accepts canonical YYYY-MM and rejects invalid months', () => {
    expect(parsePdvPeriod('2026-07')).toBe('2026-07');
    expect(parsePdvPeriod('2026-08')).toBe('2026-08');
    expect(parsePdvPeriod('2026-8')).toBeNull();
    expect(parsePdvPeriod('2026-13')).toBeNull();
    expect(parsePdvPeriod('')).toBeNull();
  });
});

describe('pdvBoxRows', () => {
  it('projects API fields without inventing amounts', () => {
    expect(
      pdvBoxRows({
        '203': { vrijednost: '100.00', porez: '25.00' },
        '400': '25.00',
      }),
    ).toEqual([
      { code: '203', value: '100.00', tax: '25.00' },
      { code: '400', value: '25.00', tax: '' },
    ]);
  });
});

describe('period hrefs', () => {
  it('scopes prijava and PDV-S to YYYY-MM query', () => {
    expect(pdvPrijavaHref('finestar', '2026-07')).toBe(
      '/t/finestar/porezi/pdv/prijava?period=2026-07',
    );
    expect(pdvSHref('finestar', '2026-08')).toBe('/t/finestar/porezi/pdv-s?period=2026-08');
  });
});
