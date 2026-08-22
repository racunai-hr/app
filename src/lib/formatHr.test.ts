import { describe, expect, it } from 'vitest';

import {
  calendarCells,
  formatHrAmount,
  formatHrDate,
  formatHrDateTime,
  formatHrInputDate,
  formatHrMoney,
  hrMonthTitle,
  hrWeekdayShort,
  parseHrInputDate,
} from './formatHr';

describe('formatHr', () => {
  it('formats amounts with Croatian grouping and decimals', () => {
    expect(formatHrMoney('21971.70', 'EUR')).toBe('21.971,70 EUR');
    expect(formatHrMoney('1000.00', 'EUR')).toBe('1.000,00 EUR');
    expect(formatHrAmount('200.00')).toBe('200,00');
  });

  describe('formatHrInputDate', () => {
    it('rearranges YYYY-MM-DD without timezone conversion', () => {
      expect(formatHrInputDate('2026-07-30')).toBe('30.07.2026.');
      expect(formatHrInputDate('2026-08-19')).toBe('19.08.2026.');
    });

    it('returns em dash for null, empty, invalid, and non-calendar dates', () => {
      expect(formatHrInputDate(null)).toBe('—');
      expect(formatHrInputDate(undefined)).toBe('—');
      expect(formatHrInputDate('')).toBe('—');
      expect(formatHrInputDate('not-a-date')).toBe('—');
      expect(formatHrInputDate('2026-08-19T14:32:10Z')).toBe('—');
      expect(formatHrInputDate('2026-02-31')).toBe('—');
    });
  });

  describe('formatHrDate / formatHrDateTime', () => {
    it('formats ISO timestamps in Europe/Zagreb', () => {
      expect(formatHrDate('2026-08-21T14:32:10Z')).toBe('21.08.2026.');
      expect(formatHrDateTime('2026-08-21T14:32:10Z')).toBe('21.08.2026. 16:32');
      expect(formatHrDateTime('2026-08-19T11:49:43.581379+00:00')).toBe('19.08.2026. 13:49');
    });

    it('keeps calendar day stable across timezone for late UTC hours', () => {
      // Would flip to 22.08. in US zones; Zagreb stays 22.08. 01:30
      expect(formatHrDate('2026-08-21T23:30:00Z')).toBe('22.08.2026.');
      expect(formatHrDateTime('2026-08-21T23:30:00Z')).toBe('22.08.2026. 01:30');
    });

    it('accepts Date instances', () => {
      const date = new Date('2026-08-21T14:32:10Z');
      expect(formatHrDate(date)).toBe('21.08.2026.');
      expect(formatHrDateTime(date)).toBe('21.08.2026. 16:32');
    });

    it('returns em dash for null, empty, and invalid', () => {
      expect(formatHrDate(null)).toBe('—');
      expect(formatHrDate(undefined)).toBe('—');
      expect(formatHrDate('')).toBe('—');
      expect(formatHrDate('not-a-date')).toBe('—');
      expect(formatHrDateTime(null)).toBe('—');
      expect(formatHrDateTime(undefined)).toBe('—');
      expect(formatHrDateTime('')).toBe('—');
      expect(formatHrDateTime('not-a-date')).toBe('—');
      expect(formatHrDate(new Date(Number.NaN))).toBe('—');
      expect(formatHrDateTime(new Date(Number.NaN))).toBe('—');
    });
  });

  it('converts filter dates between ISO and dd.mm.yyyy.', () => {
    expect(parseHrInputDate('19.8.2026')).toBe('2026-08-19');
    expect(parseHrInputDate('19.08.2026.')).toBe('2026-08-19');
    expect(parseHrInputDate('31.02.2026')).toBeNull();
    expect(parseHrInputDate('')).toBe('');
  });

  it('builds a Monday-first Croatian calendar', () => {
    expect(hrWeekdayShort()[0].toLowerCase().startsWith('pon')).toBe(true);
    expect(hrMonthTitle(2026, 7).toLowerCase()).toContain('kolovoz');
    const cells = calendarCells(2026, 7);
    expect(cells).toHaveLength(42);
    expect(cells[0].iso).toBe('2026-07-27');
    expect(cells.find((cell) => cell.iso === '2026-08-19')?.inMonth).toBe(true);
  });
});
