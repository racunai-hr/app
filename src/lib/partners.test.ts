import { describe, expect, it } from 'vitest';

import { normalizeIban, pickDirtyFields } from './partners';

describe('normalizeIban', () => {
  it('strips spaces and uppercases', () => {
    expect(normalizeIban('hr12 1234 5678')).toBe('HR1212345678');
  });
});

describe('pickDirtyFields', () => {
  it('returns only changed fields', () => {
    const baseline = { name: 'A', city: 'Zagreb', is_primary: false };
    const draft = { name: 'B', city: 'Zagreb', is_primary: true };
    expect(pickDirtyFields(baseline, draft, ['name', 'city', 'is_primary'])).toEqual({
      name: 'B',
      is_primary: true,
    });
  });

  it('returns empty object when nothing changed', () => {
    const row = { tax_number: '10000000000', vat_number: 'HR10000000000' };
    expect(pickDirtyFields(row, { ...row }, ['tax_number', 'vat_number'])).toEqual({});
  });
});
