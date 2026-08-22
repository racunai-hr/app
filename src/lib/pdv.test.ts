import { describe, expect, it } from 'vitest';

import { formatPdvPeriodLabel } from './pdv';

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
