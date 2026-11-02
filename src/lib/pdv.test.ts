import { describe, expect, it } from 'vitest';

import {
  formatPdvFilingLabel,
  formatPdvPeriodLabel,
  parsePdvFilingKey,
  parsePdvPeriod,
  pdvBoxRows,
  pdvPrijavaHref,
  pdvSHref,
  pdvSListHref,
  pdvSSubmissionLabel,
  sumPdvSTotals,
} from './pdv';

describe('formatPdvPeriodLabel', () => {
  it('rearranges YYYY-MM without Date parsing', () => {
    expect(formatPdvPeriodLabel('2026-07')).toBe('07/2026');
  });

  it('returns dash for invalid values', () => {
    expect(formatPdvPeriodLabel(null)).toBe('—');
    expect(formatPdvPeriodLabel('july')).toBe('—');
    expect(formatPdvPeriodLabel('2026-13')).toBe('—');
  });

  it('labels a multi-month filing from its key', () => {
    expect(formatPdvPeriodLabel('2014-01..2014-03')).toBe('01/2014 – 03/2014');
    expect(formatPdvPeriodLabel('2014-01..2014-12')).toBe('01/2014 – 12/2014');
  });
});

describe('formatPdvFilingLabel', () => {
  it('keeps a calendar month as MM/YYYY', () => {
    expect(
      formatPdvFilingLabel({
        period: '2026-07',
        period_from: '2026-07-01',
        period_to: '2026-07-31',
      }),
    ).toBe('07/2026');
  });

  it('shows a quarterly span as Croatian calendar dates', () => {
    expect(
      formatPdvFilingLabel({
        period: '2014-01',
        period_from: '2014-01-01',
        period_to: '2014-03-31',
      }),
    ).toBe('01.01.2014. – 31.03.2014.');
  });
});

describe('parsePdvPeriod', () => {
  it('accepts canonical YYYY-MM and rejects invalid months', () => {
    expect(parsePdvPeriod('2026-07')).toBe('2026-07');
    expect(parsePdvPeriod('2026-08')).toBe('2026-08');
    expect(parsePdvPeriod('2026-8')).toBeNull();
    expect(parsePdvPeriod('2026-13')).toBeNull();
    expect(parsePdvPeriod('')).toBeNull();
    expect(parsePdvPeriod('2014-01..2014-03')).toBeNull();
  });
});

describe('parsePdvFilingKey', () => {
  it('accepts a month and a span', () => {
    expect(parsePdvFilingKey('2014-07')).toBe('2014-07');
    expect(parsePdvFilingKey('2014-01..2014-03')).toBe('2014-01..2014-03');
    expect(parsePdvFilingKey('2014-01..2014-13')).toBeNull();
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
    expect(pdvSListHref('finestar')).toBe('/t/finestar/porezi/pdv-s');
  });
});

describe('sumPdvSTotals', () => {
  it('sums goods and services without inventing missing rows', () => {
    expect(
      sumPdvSTotals([
        { total_goods: '33000.00', total_services: '0.00' },
        { total_goods: '0.00', total_services: '0.00' },
        { total_goods: null, total_services: null },
      ]),
    ).toEqual({ total_goods: '33000.00', total_services: '0.00' });
  });
});

describe('pdvSSubmissionLabel', () => {
  it('names initial and correction events without form versions', () => {
    expect(pdvSSubmissionLabel({ submission_no: 1, submission_type: 'initial' })).toBe(
      'Predaja #1',
    );
    expect(pdvSSubmissionLabel({ submission_no: 2, submission_type: 'correction' })).toBe(
      'Ispravak #2',
    );
    expect(pdvSSubmissionLabel(null)).toBe('—');
  });
});
