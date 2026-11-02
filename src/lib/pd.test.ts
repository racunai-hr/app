import { describe, expect, it } from 'vitest';

import { parsePdYear, pdHref, pdReceipt } from './pd';

describe('pdHref', () => {
  it('opens the 2014 profit-tax return', () => {
    expect(pdHref('finestar')).toBe('/t/finestar/porezi/pd?year=2014');
    expect(pdHref('finestar', 2016)).toBe('/t/finestar/porezi/pd?year=2016');
  });

  it('keeps the 2015 filing receipt', () => {
    expect(pdReceipt(2015)?.formId).toBe('1a659210-d70d-4c06-bfc6-fa3f866de2c2');
    expect(pdReceipt(2014)).toBeNull();
  });

  it('keeps the 2016 filing receipt', () => {
    expect(pdReceipt(2016)?.formId).toBe('d47889fd-afeb-4c03-ad98-931a6d01406e');
    expect(pdReceipt(2016)?.signedAt).toBe('2017-03-22T13:34:10+01:00');
  });

  it('keeps the later 2022 form signature without a receipt stamp', () => {
    expect(pdReceipt(2022)?.formId).toBe('0e80a4c0-55a9-4138-b027-a6566b6ee6f0');
    expect(pdReceipt(2022)?.signedAt).toBe('2023-04-14T13:40:52+02:00');
    expect(pdReceipt(2022)?.signedBy).toBe('Zorana Lambaša');
    expect(pdReceipt(2022)?.receivedAt).toBeUndefined();
    expect(pdReceipt(2022)?.statuses).toEqual([]);
  });

  it('keeps the 2021 form signature without a receipt stamp', () => {
    expect(pdReceipt(2021)?.formId).toBe('d50aca02-ab21-465d-abc8-2ba9769522b4');
    expect(pdReceipt(2021)?.signedAt).toBe('2022-03-25T13:03:31+01:00');
    expect(pdReceipt(2021)?.signedBy).toBe('Zorana Lambaša');
    expect(pdReceipt(2021)?.receivedAt).toBeUndefined();
    expect(pdReceipt(2021)?.statuses).toEqual([]);
  });

  it('keeps the 2020 filing receipt', () => {
    expect(pdReceipt(2020)?.formId).toBe('9ae236ef-aaab-4b7f-9fc0-b4ebada27b3c');
    expect(pdReceipt(2020)?.signedAt).toBe('2021-05-24T13:35:37+02:00');
    expect(pdReceipt(2020)?.receivedAt).toBe('2021-05-24T13:35:59+02:00');
    expect(pdReceipt(2020)?.statuses).not.toContain('Obrazac je obrađen 01.01.2025.');
  });

  it('keeps the 2019 filing receipt', () => {
    expect(pdReceipt(2019)?.formId).toBe('2ac7908f-dbac-48d5-9c84-4348a88b07f4');
    expect(pdReceipt(2019)?.signedAt).toBe('2020-05-06T09:20:37+02:00');
    expect(pdReceipt(2019)?.receivedAt).toBe('2020-05-06T09:20:44+02:00');
  });

  it('keeps the 2018 filing receipt', () => {
    expect(pdReceipt(2018)?.formId).toBe('eab61b76-c30c-478a-82ef-4d26a920d69d');
    expect(pdReceipt(2018)?.signedAt).toBe('2019-03-25T08:30:12+01:00');
    expect(pdReceipt(2018)?.receivedAt).toBe('2019-03-25T08:30:23+01:00');
  });

  it('keeps the 2017 filing receipt', () => {
    expect(pdReceipt(2017)?.formId).toBe('3add0393-4faa-4524-baea-5be3de77a562');
    expect(pdReceipt(2017)?.signedAt).toBe('2018-04-25T11:07:37+02:00');
    expect(pdReceipt(2017)?.receivedAt).toBe('2018-04-25T11:07:43+02:00');
    expect(pdReceipt(2017)?.statuses).not.toContain('Obrazac je obrađen 01.01.2025.');
  });

  it('falls back to 2014 when the query year is missing', () => {
    expect(parsePdYear(null)).toBe(2014);
    expect(parsePdYear('2014')).toBe(2014);
    expect(parsePdYear('nope')).toBe(2014);
  });
});
