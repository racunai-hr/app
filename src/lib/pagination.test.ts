import { describe, expect, it } from 'vitest';

import {
  clampPage,
  DEFAULT_PAGE_SIZE,
  pageCountOf,
  pageWindow,
  parsePage,
  parsePageSize,
  writePageParams,
} from './pagination';

describe('parsePage', () => {
  it('clamps missing and invalid values to 1', () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage('')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-2')).toBe(1);
  });

  it('parses whole page numbers', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage('3.9')).toBe(3);
  });
});

describe('parsePageSize', () => {
  it('accepts only allowlisted sizes', () => {
    expect(parsePageSize('50')).toBe(50);
    expect(parsePageSize('100')).toBe(100);
    expect(parsePageSize('20')).toBe(20);
  });

  it('falls back to the default for anything else', () => {
    expect(parsePageSize('999')).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize('0')).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize('abc')).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize(null)).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('pageCountOf', () => {
  it('returns 1 for empty or invalid counts', () => {
    expect(pageCountOf(0, 20)).toBe(1);
    expect(pageCountOf(-8, 20)).toBe(1);
    expect(pageCountOf(Number.NaN, 20)).toBe(1);
  });

  it('uses the default size when pageSize is invalid', () => {
    expect(pageCountOf(40, 0)).toBe(2);
    expect(pageCountOf(40, -10)).toBe(2);
    expect(pageCountOf(40, Number.NaN)).toBe(2);
  });

  it('always returns an integer of at least 1', () => {
    expect(pageCountOf(35, 20)).toBe(2);
    expect(Number.isInteger(pageCountOf(1, 20))).toBe(true);
    expect(pageCountOf(1, 20)).toBeGreaterThanOrEqual(1);
  });
});

describe('clampPage', () => {
  it('keeps the value inside 1..pageCount', () => {
    expect(clampPage(99, 9)).toBe(9);
    expect(clampPage(0, 9)).toBe(1);
    expect(clampPage(Number.NaN, 9)).toBe(1);
  });
});

describe('pageWindow', () => {
  it('shows a single page without gaps', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
  });

  it('keeps first and last pages visible around the current page', () => {
    expect(pageWindow(1, 9)).toEqual([1, 2, 'gap', 9]);
    expect(pageWindow(5, 9)).toEqual([1, 'gap', 4, 5, 6, 'gap', 9]);
    expect(pageWindow(9, 9)).toEqual([1, 'gap', 8, 9]);
  });
});

describe('writePageParams', () => {
  it('omits default page and page_size', () => {
    const params = new URLSearchParams('search=acme&status=posted');
    writePageParams(params, 1, 20);
    expect(params.toString()).toBe('search=acme&status=posted');
  });

  it('writes only a non-default page', () => {
    const params = new URLSearchParams('search=acme');
    writePageParams(params, 3, 20);
    expect(params.toString()).toBe('search=acme&page=3');
  });

  it('writes only a non-default page_size', () => {
    const params = new URLSearchParams('search=acme');
    writePageParams(params, 1, 50);
    expect(params.toString()).toBe('search=acme&page_size=50');
  });

  it('writes both when neither is default', () => {
    const params = new URLSearchParams('search=acme&status=posted');
    writePageParams(params, 3, 50);
    expect(params.toString()).toBe('search=acme&status=posted&page=3&page_size=50');
  });

  it('removes stale page and page_size while keeping other filters', () => {
    const params = new URLSearchParams('search=acme&page=9&page_size=50');
    writePageParams(params, 1, 20);
    expect(params.toString()).toBe('search=acme');
  });
});
