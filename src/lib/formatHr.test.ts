import { describe, expect, it } from 'vitest';

import {
  calendarCells,
  formatHrAmount,
  formatHrInputDate,
  formatHrMoney,
  formatHrSnapshot,
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

  it('formats the snapshot timestamp in Europe/Zagreb', () => {
    expect(formatHrSnapshot('2026-08-19T11:49:43.581379+00:00')).toBe('19. 8. 2026. u 13:49');
  });

  it('converts filter dates between ISO and dd.mm.yyyy.', () => {
    expect(formatHrInputDate('2026-08-19')).toBe('19.08.2026.');
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
