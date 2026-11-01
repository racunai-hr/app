import { describe, expect, it } from 'vitest';

import { pdIpoForTenantYear, pdIpoHref, pdIpoYears } from './pdIpo2018';

describe('Fine Star PD-IPO 2018', () => {
  it('keeps the 2021 loans to Šupina Poljica and Toni Šupe', () => {
    expect(pdIpoYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016]);
    const view = pdIpoForTenantYear('finestar', 2021);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('db457038-6b58-46e7-a776-b4df18e7f5e0');
    expect(view.signedAt).toBe('2022-08-25T09:42:13+02:00');
    expect(view.signedBy).toBe('Zorana Lambaša');
    expect(view.receivedAt).toBeUndefined();
    expect(view.place).toBe('Šibenik');
    expect(view.officeCode).toBe('3383');
    expect(view.person.name).toBe('Toni Šupe');
    expect(view.person.receivable).toMatchObject({
      openingPrincipal: '17736.25',
      closingPrincipal: '17736.25',
      interestRate: '3.00',
      interestInYear: '3807.53',
      interestAtYearEnd: '3807.53',
    });
    expect(view.obligations?.map((item) => item.name)).toEqual([
      'Šupina Poljica j.d.o.o.',
      'Toni Šupe',
    ]);
    expect(view.obligations?.[0].receivable).toMatchObject({
      closingPrincipal: '185600.00',
      interestInYear: '5150.46',
      interestAtYearEnd: '5150.46',
    });
    expect(view.obligations?.[1].receivable.closingPrincipal).toBe('0.00');
    expect(view.obligations?.[1].receivable.amountAtOrigin).toBe('189000.00');
  });

  it('keeps the 2020 loan with interest and an unchanged principal', () => {
    expect(pdIpoYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016]);
    const view = pdIpoForTenantYear('finestar', 2020);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('97a0fd51-f5c3-42a5-8271-316dacc7a73e');
    expect(view.signedAt).toBe('2021-05-24T13:36:40+02:00');
    expect(view.receivedAt).toBeUndefined();
    expect(view.processedAt).toBeUndefined();
    expect(view.person.name).toBe('Marina Banović');
    expect(view.person.oib).toBe('53531930627');
    expect(view.person.capitalShare).toBe('0.00');
    expect(view.person.votingShare).toBe('100.00');
    expect(view.person.relation).toBe('U');
    expect(view.person.relationLabel).toBe('član uprave');
    expect(view.person.receivable).toMatchObject({
      openingPrincipal: '17736.25',
      closingPrincipal: '17736.25',
      interestRate: '2.00',
      interestInYear: '354.73',
      taxBaseIncrease: '0.00',
      interestAtYearEnd: '3275.44',
    });
  });

  it('keeps the 2019 loan at the reduced rate', () => {
    const view = pdIpoForTenantYear('finestar', 2019);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('be271c71-f4a1-4478-86a8-188256c5226e');
    expect(view.signedAt).toBe('2020-05-06T09:21:46+02:00');
    expect(view.receivedAt).toBe('2020-05-06T09:21:52+02:00');
    expect(view.processedAt).toBe('2020-05-06T22:00:18+02:00');
    expect(view.person.relation).toBe('D');
    expect(view.person.relationLabel).toBe(
      'udjeli u kapitalu ili glasačkom pravu dužnika ili vjerovnika',
    );
    expect(view.person.receivable).toMatchObject({
      openingPrincipal: '17966.25',
      closingPrincipal: '17736.25',
      interestRate: '2.00',
      interestInYear: '354.73',
      taxBaseIncrease: '0.00',
      interestAtYearEnd: '2920.71',
    });
  });

  it('keeps the filed loan to Martina Banović', () => {
    expect(pdIpoYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016]);
    expect(pdIpoYears('other')).toEqual([]);
    expect(pdIpoHref('finestar')).toBe('/t/finestar/porezi/pd-ipo');
    const view = pdIpoForTenantYear('finestar', 2018);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('8e80ddfd-c074-4fd7-be66-25b43e439c72');
    expect(view.signedAt).toBe('2019-03-25T08:33:57+01:00');
    expect(view.receivedAt).toBe('2019-03-25T08:34:04+01:00');
    expect(view.processedAt).toBe('2019-03-25T22:01:05+01:00');
    expect(view.person.name).toBe('Martina Banović');
    expect(view.person.oib).toBe('53531930627');
    expect(view.person.relation).toBe('D');
    expect(view.person.relationLabel).toBe('član društva');
    expect(view.person.receivable).toMatchObject({
      originatedOn: '2014-12-31',
      amountAtOrigin: '10000.00',
      openingPrincipal: '18196.25',
      closingPrincipal: '17966.25',
      interestRate: '3.00',
      interestInYear: '538.99',
      taxBaseIncrease: '0.00',
      interestAtYearEnd: '2565.98',
    });
    expect(pdIpoForTenantYear('other', 2018)).toEqual({ status: 'empty' });
  });

  it('keeps the 2017 loan and the April receipt', () => {
    const view = pdIpoForTenantYear('finestar', 2017);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('46edd356-9919-4016-b433-ee32eebb4944');
    expect(view.signedAt).toBe('2018-04-25T11:12:28+02:00');
    expect(view.receivedAt).toBe('2018-04-25T11:12:40+02:00');
    expect(view.processedAt).toBe('2018-04-25T22:03:41+02:00');
    expect(view.person.relation).toBe('U');
    expect(view.person.relationLabel).toBe('član uprave');
    expect(view.person.receivable).toMatchObject({
      openingPrincipal: '19570.00',
      closingPrincipal: '18196.25',
      interestInYear: '545.89',
      interestAtYearEnd: '2026.99',
    });
  });

  it('keeps the 2016 loan to Nikola Banović', () => {
    const view = pdIpoForTenantYear('finestar', 2016);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('e5af7652-a3ea-460d-a567-85eae3973c1b');
    expect(view.signedAt).toBe('2017-10-24T14:05:13+02:00');
    expect(view.receivedAt).toBe('2017-10-24T14:05:24+02:00');
    expect(view.processedAt).toBe('2017-10-24T22:01:10+02:00');
    expect(view.person.name).toBe('Nikola Banović');
    expect(view.person.oib).toBe('03626641565');
    expect(view.person.relation).toBe('D');
    expect(view.person.receivable).toMatchObject({
      openingPrincipal: '19800.00',
      closingPrincipal: '19570.00',
      interestInYear: '894.00',
      taxBaseIncrease: '587.10',
      interestAtYearEnd: '1481.10',
    });
  });
});
