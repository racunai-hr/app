import { describe, expect, it } from 'vitest';

import {
  formatObrazacTzValue,
  obrazacTzForTenantYear,
  obrazacTzHref,
  obrazacTzLine,
  obrazacTzYears,
} from './obrazacTz2014';

describe('Fine Star Obrazac TZ 2014', () => {
  it('keeps the filed amounts, including a zero assessment', () => {
    expect(obrazacTzLine('01')).toBe('5.19');
    expect(obrazacTzLine('02')).toBe('0.0240');
    expect(obrazacTzLine('03')).toBe('0.00');
    expect(obrazacTzLine('04')).toBe('0.00');
    expect(obrazacTzLine('05')).toBe('0.00');
    expect(obrazacTzLine('06')).toBe('0.00');
    expect(obrazacTzLine('07')).toBe('0.01');
    expect(formatObrazacTzValue('5.19')).toBe('5,19');
    expect(formatObrazacTzValue('0.0240')).toBe('0,0240');
    expect(formatObrazacTzValue('0.01')).toBe('0,01');
    expect(formatObrazacTzValue('0.0204')).toBe('0,0204');
  });

  it('keeps the 2016 zero return at the lower rate', () => {
    expect(obrazacTzLine('02', 'finestar', 2016)).toBe('0.0204');
    expect(obrazacTzLine('07', 'finestar', 2016)).toBe('0.00');
    const view = obrazacTzForTenantYear('finestar', 2016);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('5f1292b4-e8ef-47e4-9f40-e9f2d2337858');
    expect(view.receiptId).toBe('7f869746-59a5-4c7e-8570-bd5816ea01eb');
    expect(view.statuses.map((item) => item.text)).toContain(
      'Iznos pod rednim brojem 7. može biti nula samo ako je 31.12. prestanak obveze.',
    );
  });

  it('keeps the 2015 zero return and its receipt warning', () => {
    expect(obrazacTzLine('01', 'finestar', 2015)).toBe('0.00');
    expect(obrazacTzLine('02', 'finestar', 2015)).toBe('0.0240');
    expect(obrazacTzLine('07', 'finestar', 2015)).toBe('0.00');
    const view = obrazacTzForTenantYear('finestar', 2015);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.receiptId).toBe('f6187da6-3238-41d2-a088-831978562066');
    expect(view.statuses.map((item) => item.text)).toContain(
      'Iznos pod rednim brojem 7. može biti nula samo ako je 31.12. prestanak obveze.',
    );
  });

  it('keeps the 2021 TZ 1 return at a zero base', () => {
    expect(obrazacTzLine('01', 'finestar', 2021)).toBe('0.00');
    expect(obrazacTzLine('02', 'finestar', 2021)).toBe('0.01705');
    expect(obrazacTzLine('03', 'finestar', 2021)).toBe('0.00');
    expect(obrazacTzLine('14', 'finestar', 2021)).toBe('NE');
    const view = obrazacTzForTenantYear('finestar', 2021);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formTitle).toBe('Obrazac TZ 1');
    expect(view.officeName).toBe('3566');
    expect(view.formId).toBe('281c36af-bc12-4763-acc6-93d6d62da5df');
    expect(view.receiptId).toBe('8c71a4a6-b562-4815-bf59-76223379c4f8');
    expect(view.signedBy).toBe('Zorana Lambaša');
    expect(view.signedAt).toBe('2022-03-25T13:10:47+01:00');
    expect(view.receivedAt).toBe('2022-03-25T13:11:09+01:00');
    expect(view.statuses[1]?.text).toBe('Poslani TZ 1 obrazac uspješno je zaprimljen te čeka obradu.');
  });

  it('keeps the 2020 TZ 1 assessment on the filed interest', () => {
    expect(obrazacTzLine('01', 'finestar', 2020)).toBe('3275.44');
    expect(obrazacTzLine('02', 'finestar', 2020)).toBe('0.01938');
    expect(obrazacTzLine('03', 'finestar', 2020)).toBe('0.63');
    expect(obrazacTzLine('11', 'finestar', 2020)).toBe('0.63');
    expect(obrazacTzLine('13', 'finestar', 2020)).toBe('0.00');
    expect(obrazacTzLine('14', 'finestar', 2020)).toBe('NE');
    const view = obrazacTzForTenantYear('finestar', 2020);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formTitle).toBe('Obrazac TZ 1');
    expect(view.lines).toHaveLength(15);
    expect(view.officeName).toBe('Susedgrad');
    expect(view.formId).toBe('eac1011a-c229-4d6a-947a-e9f5969d30f8');
    expect(view.receiptId).toBe('a6b8a15c-d4e9-4301-8a93-ce79ab488e08');
    expect(view.signedAt).toBe('2021-05-24T13:38:07+02:00');
    expect(view.receivedAt).toBe('2021-05-24T13:38:28+02:00');
    expect(view.statuses.map((item) => item.text)).toEqual([
      'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
      'Poslani TZ 1 obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
    ]);
  });

  it('keeps the 2019 TZ 1 return and the warning on line 13', () => {
    expect(obrazacTzLine('01', 'finestar', 2019)).toBe('0.00');
    expect(obrazacTzLine('02', 'finestar', 2019)).toBe('0.01938');
    expect(obrazacTzLine('13', 'finestar', 2019)).toBe('0.00');
    expect(obrazacTzLine('14', 'finestar', 2019)).toBe('NE');
    expect(obrazacTzLine('15', 'finestar', 2019)).toBe('0.00');
    const view = obrazacTzForTenantYear('finestar', 2019);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formTitle).toBe('Obrazac TZ 1');
    expect(view.lines).toHaveLength(15);
    expect(view.formId).toBe('fdfa36b3-2b1b-4987-9069-d02a7de57496');
    expect(view.receiptId).toBe('57a17a22-7092-4b1a-9c13-0be4ed16e033');
    expect(view.signedAt).toBe('2020-05-06T09:21:10+02:00');
    expect(view.receivedAt).toBe('2020-05-06T09:21:16+02:00');
    expect(view.officeName).toBe('Šibenik');
    expect(view.statuses.map((item) => item.text)).toEqual([
      'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
      'Poslani TZ-1 obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
    ]);
  });

  it('keeps the 2018 zero return at the filed rate', () => {
    expect(obrazacTzLine('01', 'finestar', 2018)).toBe('0.00');
    expect(obrazacTzLine('02', 'finestar', 2018)).toBe('0.01938');
    expect(obrazacTzLine('07', 'finestar', 2018)).toBe('0.00');
    const view = obrazacTzForTenantYear('finestar', 2018);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.formId).toBe('3cbb5d8b-3fc8-4100-86c0-f91cc8e5c967');
    expect(view.receiptId).toBe('3c94b4c1-b6b8-49af-9bff-9f795783d71e');
    expect(view.statuses.map((item) => item.text)).toEqual([
      'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
    ]);
  });

  it('keeps the 2017 advance notice without a filed form', () => {
    const view = obrazacTzForTenantYear('finestar', 2017);
    expect(view.status).toBe('notice');
    if (view.status !== 'notice') return;
    expect(view.deliveredOn).toBe('2018-02-26');
    expect(view.oib).toBe('36619131370');
    expect(view.mandatoryDelivery).toBe(false);
    expect(view.text).toContain('0,00 kn');
    expect(view).not.toHaveProperty('formId');
    expect(view).not.toHaveProperty('lines');
  });

  it('lists filed years and the 2017 notice', () => {
    expect(obrazacTzYears('finestar')).toEqual([2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]);
    expect(obrazacTzYears('alma-cizmic')).toEqual([]);
    expect(obrazacTzHref('finestar')).toBe('/t/finestar/porezi/tz');
    const view = obrazacTzForTenantYear('finestar', 2014);
    expect(view.status).toBe('snapshot');
    if (view.status !== 'snapshot') return;
    expect(view.receiptId).toBe('319262dc-aff4-425a-aaa2-c04afcbaa9ef');
    expect(view.formId).toBe('2fd85cd2-5d7c-4c4f-9ade-65e3cae78bb4');
    expect(view.statuses.map((item) => item.text)).toEqual([
      'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
      'Obrazac je u obradi.',
    ]);
  });
});
