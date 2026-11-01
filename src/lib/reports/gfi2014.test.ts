import { describe, expect, it } from 'vitest';

import { formatHrAmount } from '@/lib/formatHr';

import { gfiForTenantYear, gfiYears } from './gfi2014';

describe('Fine Star GFI 2014', () => {
  it('keeps both registry receipts and the cover, without statement lines', () => {
    expect(gfiYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013]);
    expect(gfiYears('alma-cizmic')).toEqual([]);
    const view = gfiForTenantYear('finestar', 2014);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.filings.map((filing) => filing.receiptId)).toEqual(['5573651', '5676163']);
    expect(view.filings.map((filing) => filing.filedOn)).toEqual(['2015-03-27', '2015-06-12']);
    expect(view.filings.map((filing) => formatHrAmount(filing.controlNumber))).toEqual([
      '368.478.303,70',
      '368.394.236,76',
    ]);
    expect(view.filings[0]?.documents.map((document) => document.label)).toEqual([
      'Bilanca za poduzetnike',
      'Račun dobiti i gubitka za poduzetnike',
      'Dodatni podaci za poduzetnike',
    ]);
    expect(view.filings[1]?.documents.map((document) => document.label)).toContain(
      'Odluka o utvrđivanju godišnjeg financijskog izvještaja',
    );
    expect(view.representative).toBe('Nikola Banović');
    expect(view.monthsCurrent).toBe('12');
    expect(view).not.toHaveProperty('rows');
  });

  it('keeps the 2013 inactivity statement without a 2014 cover', () => {
    const view = gfiForTenantYear('finestar', 2013);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'inactive') return;
    expect(view.receiptId).toBe('5314026');
    expect(view.signedOn).toBe('2014-02-15');
    expect(view.filedOn).toBe('2014-02-26');
    expect(view.documentLabel).toBe('Izjava o neaktivnosti');
    expect(view).not.toHaveProperty('controlNumber');
    expect(view).not.toHaveProperty('filings');
  });

  it('keeps the 2015 combined statistics and public filing', () => {
    const view = gfiForTenantYear('finestar', 2015);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.monthsPrevious).toBe('12');
    expect(view.monthsCurrent).toBe('12');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]).toMatchObject({
      kind: 'statistika-i-javna-objava',
      receiptId: '5783448',
      filedOn: '2016-03-15',
    });
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('368.698.172,35');
    expect(view.filings[0]?.documents.map((document) => document.label)).toEqual([
      'Bilanca za poduzetnike',
      'Račun dobiti i gubitka za poduzetnike',
      'Dodatni podaci za poduzetnike',
      'Bilješke uz financijske izvještaje',
      'Odluka o raspodjeli dobiti ili pokriću gubitka',
      'Odluka o utvrđivanju godišnjeg financijskog izvještaja',
    ]);
    expect(view).not.toHaveProperty('rows');
  });

  it('keeps the 2016 combined filing and the HSFI cover', () => {
    const view = gfiForTenantYear('finestar', 2016);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.excelVersion).toBe('3.0.3');
    expect(view.accountingStandard).toBe('HSFI');
    expect(view.monthsPrevious).toBe('12');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]?.receiptId).toBe('6024452');
    expect(view.filings[0]?.filedOn).toBe('2017-03-31');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('368.526.521,28');
    expect(view).not.toHaveProperty('rows');
  });

  it('keeps the 2017 micro cover, receipt and payment order', () => {
    const view = gfiForTenantYear('finestar', 2017);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.sizeLabel).toBe('Mikro poduzetnik');
    expect(view.representative).toBe('Martina Banović');
    expect(view.accountingStandard).toBe('HSFI');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]?.receiptId).toBe('6236191');
    expect(view.filings[0]?.filedOn).toBe('2018-03-09');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('368.535.563,68');
    expect(view.filings[0]?.payment).toEqual({
      amount: '230.00',
      fee: '2.00',
      total: '232.00',
      paidOn: '2018-03-01',
      account: 'HR4223900001100017042',
      reference: 'HR05 7543000-36619131370',
    });
    expect(view.filings[0]?.documents).toHaveLength(6);
  });

  it('keeps the 2018 cover and receipt without a payment order', () => {
    const view = gfiForTenantYear('finestar', 2018);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.sizeLabel).toBe('Mikro poduzetnik');
    expect(view.representative).toBe('Martina Banović');
    expect(view.excelVersion).toBe('3.0.4');
    expect(view.accountingStandard).toBe('HSFI');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]?.receiptId).toBe('6464204');
    expect(view.filings[0]?.filedOn).toBe('2019-04-02');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('368.531.075,37');
    expect(view.filings[0]?.payment).toBeUndefined();
    expect(view.filings[0]?.documents).toHaveLength(6);
  });

  it('keeps the 2019 cover and receipt without a payment order', () => {
    const view = gfiForTenantYear('finestar', 2019);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.sizeLabel).toBe('Mikro poduzetnik');
    expect(view.representative).toBe('Martina Banović');
    expect(view.excelVersion).toBe('3.0.4');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]?.receiptId).toBe('6687228');
    expect(view.filings[0]?.filedOn).toBe('2020-03-27');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('368.528.561,45');
    expect(view.filings[0]?.payment).toBeUndefined();
    expect(view.filings[0]?.documents).toHaveLength(6);
  });

  it('keeps the 2020 cover and receipt without a payment order', () => {
    const view = gfiForTenantYear('finestar', 2020);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.sizeLabel).toBe('Mikro poduzetnik');
    expect(view.place).toBe('Zagreb');
    expect(view.street).toBe('A. T. Mimare 46');
    expect(view.representative).toBe('Martina Banović');
    expect(view.excelVersion).toBe('3.0.4');
    expect(view.filings).toHaveLength(1);
    expect(view.filings[0]?.receiptId).toBe('6910660');
    expect(view.filings[0]?.filedOn).toBe('2021-04-20');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('384.750.620,68');
    expect(view.filings[0]?.payment).toBeUndefined();
    expect(view.filings[0]?.documents).toHaveLength(6);
  });

  it('keeps the 2021 Šibenik cover without a payment order', () => {
    const view = gfiForTenantYear('finestar', 2021);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot' || view.kind !== 'filed') return;
    expect(view.taxpayerName).toBe('FINE STAR d.o.o. za usluge');
    expect(view.place).toBe('Šibenik');
    expect(view.street).toBe('Bana Josipa Jelačića 58');
    expect(view.representative).toBe('Toni Šupe');
    expect(view.ownershipLabel).toBe('Privatno od osnivanja');
    expect(view.excelVersion).toBe('4.0.1');
    expect(view.accountingStandard).toBe('HSFI');
    expect(view.filings[0]?.receiptId).toBe('7122844');
    expect(view.filings[0]?.filedOn).toBe('2022-03-28');
    expect(formatHrAmount(view.filings[0]?.controlNumber)).toBe('377.619.595,69');
    expect(view.filings[0]?.payment).toBeUndefined();
    expect(view.filings[0]?.documents.find((item) => item.note === 'odluka')?.label).toBe(
      'Odluka o raspodjeli dobiti ili pokriću gubitka',
    );
    expect(view.filings[0]?.documents.find((item) => item.note === 'biljeske')?.label).toBe(
      'Bilješke uz financijske izvještaje',
    );
  });
});
