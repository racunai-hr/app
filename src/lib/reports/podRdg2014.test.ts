import { describe, expect, it } from 'vitest';

import {
  FINESTAR_POD_RDG_2014,
  FINESTAR_POD_RDG_2015,
  podRdgAmount,
  podRdgForTenantYear,
  podRdgYears,
} from './podRdg2014';
import { FINESTAR_POD_RDG_2016 } from './podRdg2016';
import { FINESTAR_POD_RDG_2017 } from './podRdg2017';
import { FINESTAR_POD_RDG_2018 } from './podRdg2018';
import { FINESTAR_POD_RDG_2019 } from './podRdg2019';
import { FINESTAR_POD_RDG_2020 } from './podRdg2020';
import { FINESTAR_POD_RDG_2021 } from './podRdg2021';

describe('Fine Star POD-RDG 2014', () => {
  it('keeps the scanned whole-kuna result', () => {
    expect(podRdgAmount('114')).toBe(
      podRdgAmount('115') +
        podRdgAmount('116') +
        podRdgAmount('120') +
        podRdgAmount('124') +
        podRdgAmount('125') +
        podRdgAmount('126') +
        podRdgAmount('129') +
        podRdgAmount('130'),
    );
    expect(podRdgAmount('131')).toBe(
      podRdgAmount('132') +
        podRdgAmount('133') +
        podRdgAmount('134') +
        podRdgAmount('135') +
        podRdgAmount('136'),
    );
    expect(podRdgAmount('146')).toBe(
      podRdgAmount('111') + podRdgAmount('131') + podRdgAmount('142') + podRdgAmount('144'),
    );
    expect(podRdgAmount('147')).toBe(
      podRdgAmount('114') + podRdgAmount('137') + podRdgAmount('143') + podRdgAmount('145'),
    );
    expect(podRdgAmount('148')).toBe(podRdgAmount('146') - podRdgAmount('147'));
    expect(podRdgAmount('152')).toBe(podRdgAmount('148') - podRdgAmount('151'));
    expect(podRdgAmount('125')).toBe(205);
    expect(podRdgAmount('133')).toBe(5);
    expect(podRdgAmount('150')).toBe(200);
    expect(podRdgAmount('154')).toBe(200);
    expect(podRdgAmount('148')).toBe(-200);
  });

  it('keeps the pre-2016 AOP span and a zero prior period', () => {
    const aops = FINESTAR_POD_RDG_2014.filter((line) => line.aop).map((line) => line.aop);
    expect(aops[0]).toBe('111');
    expect(aops.at(-1)).toBe('170');
    expect(aops).toHaveLength(60);
    expect(new Set(aops).size).toBe(aops.length);
    expect(FINESTAR_POD_RDG_2014.filter((line) => line.aop).every((line) => line.previous === 0)).toBe(
      true,
    );
  });

  it('returns the 2014 snapshot only for Fine Star', () => {
    expect(podRdgForTenantYear('finestar', 2014)).toMatchObject({
      status: 'snapshot',
      scheme: 'pre-2016',
      currency: 'HRK',
      periodFrom: '2014-01-01',
      periodTo: '2014-12-31',
    });
    expect(podRdgYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]);
    expect(podRdgYears('other')).toEqual([]);
    expect(podRdgForTenantYear('other', 2014)).toEqual({
      status: 'empty',
      year: 2014,
      scheme: 'pre-2016',
    });
  });

  it('keeps the 2015 scan at one kuna each side', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2015);
    const previous = (aop: string) =>
      FINESTAR_POD_RDG_2015.find((line) => line.aop === aop)?.previous;
    expect(amount('131')).toBe(1);
    expect(amount('136')).toBe(1);
    expect(amount('137')).toBe(1);
    expect(amount('141')).toBe(1);
    expect(amount('146')).toBe(1);
    expect(amount('147')).toBe(1);
    expect(amount('148')).toBe(0);
    expect(amount('150')).toBe(0);
    expect(previous('125')).toBe(205);
    expect(previous('133')).toBe(5);
    expect(previous('148')).toBe(-200);
    expect(podRdgForTenantYear('finestar', 2015)).toMatchObject({
      status: 'snapshot',
      periodFrom: '2015-01-01',
      periodTo: '2015-12-31',
    });
  });

  it('keeps the 2016 loss with a zero prior period', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2016);
    const aops = FINESTAR_POD_RDG_2016.filter((line) => line.aop).map((line) => line.aop);
    expect(aops[0]).toBe('125');
    expect(aops.at(-1)).toBe('217');
    expect(amount('131')).toBe(230);
    expect(amount('142')).toBe(230);
    expect(amount('178')).toBe(230);
    expect(amount('179')).toBe(-230);
    expect(amount('181')).toBe(230);
    expect(amount('183')).toBe(-230);
    expect(amount('185')).toBe(230);
    expect(FINESTAR_POD_RDG_2016.filter((line) => line.aop).every((line) => line.previous === 0)).toBe(
      true,
    );
    expect(podRdgForTenantYear('finestar', 2016)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2016-01-01',
      periodTo: '2016-12-31',
    });
  });

  it('keeps the 2017 expenses and the printed 2016 column', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2017);
    const previous = (aop: string) => FINESTAR_POD_RDG_2017.find((line) => line.aop === aop)?.previous;
    expect(amount('131')).toBe(amount('133') + amount('142'));
    expect(amount('133')).toBe(945);
    expect(amount('136')).toBe(945);
    expect(amount('142')).toBe(184);
    expect(amount('178')).toBe(1129);
    expect(amount('179')).toBe(-1129);
    expect(amount('181')).toBe(1129);
    expect(amount('183')).toBe(-1129);
    expect(amount('185')).toBe(1129);
    expect(previous('131')).toBe(230);
    expect(previous('142')).toBe(230);
    expect(previous('179')).toBe(-230);
    expect(previous('133')).toBe(0);
    expect(podRdgForTenantYear('finestar', 2017)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2017-01-01',
      periodTo: '2017-12-31',
    });
    expect(podRdgForTenantYear('finestar', 2022)).toEqual({
      status: 'empty',
      year: 2022,
      scheme: 'from-2016',
    });
  });

  it('keeps the 2018 expense and the printed 2017 column', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2018);
    const previous = (aop: string) => FINESTAR_POD_RDG_2018.find((line) => line.aop === aop)?.previous;
    expect(amount('131')).toBe(230);
    expect(amount('142')).toBe(230);
    expect(amount('178')).toBe(230);
    expect(amount('179')).toBe(-230);
    expect(amount('183')).toBe(-230);
    expect(amount('185')).toBe(230);
    expect(amount('133')).toBe(0);
    expect(previous('131')).toBe(1129);
    expect(previous('133')).toBe(945);
    expect(previous('136')).toBe(945);
    expect(previous('142')).toBe(184);
    expect(previous('179')).toBe(-1129);
    expect(podRdgForTenantYear('finestar', 2018)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2018-01-01',
      periodTo: '2018-12-31',
    });
  });

  it('keeps the 2019 expense equal to the printed 2018 column', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2019);
    const previous = (aop: string) => FINESTAR_POD_RDG_2019.find((line) => line.aop === aop)?.previous;
    expect(amount('131')).toBe(230);
    expect(amount('142')).toBe(230);
    expect(amount('178')).toBe(230);
    expect(amount('179')).toBe(-230);
    expect(amount('181')).toBe(230);
    expect(amount('183')).toBe(-230);
    expect(amount('185')).toBe(230);
    expect(previous('131')).toBe(230);
    expect(previous('142')).toBe(230);
    expect(previous('179')).toBe(-230);
    expect(previous('183')).toBe(-230);
    expect(podRdgForTenantYear('finestar', 2019)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2019-01-01',
      periodTo: '2019-12-31',
    });
  });

  it('keeps the 2020 expense rounded to one kuna', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2020);
    const previous = (aop: string) => FINESTAR_POD_RDG_2020.find((line) => line.aop === aop)?.previous;
    expect(amount('131')).toBe(1);
    expect(amount('142')).toBe(1);
    expect(amount('178')).toBe(1);
    expect(amount('179')).toBe(-1);
    expect(amount('181')).toBe(1);
    expect(amount('183')).toBe(-1);
    expect(amount('185')).toBe(1);
    expect(previous('131')).toBe(230);
    expect(previous('179')).toBe(-230);
    expect(previous('181')).toBe(230);
    expect(podRdgForTenantYear('finestar', 2020)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2020-01-01',
      periodTo: '2020-12-31',
    });
  });

  it('keeps the 2021 income and the note split of expenses', () => {
    const amount = (aop: string) => podRdgAmount(aop, FINESTAR_POD_RDG_2021);
    expect(amount('131')).toBe(amount('133') + amount('142'));
    expect(amount('133')).toBe(amount('136'));
    expect(amount('136')).toBe(1440);
    expect(amount('142')).toBe(1728);
    expect(amount('154')).toBe(amount('161') + amount('163'));
    expect(amount('161')).toBe(534);
    expect(amount('163')).toBe(3275);
    expect(amount('165')).toBe(amount('168') + amount('169') + amount('172'));
    expect(amount('168')).toBe(5500);
    expect(amount('169')).toBe(371);
    expect(amount('172')).toBe(3545);
    expect(amount('177')).toBe(3809);
    expect(amount('178')).toBe(12584);
    expect(amount('179')).toBe(-8775);
    expect(amount('183')).toBe(-8775);
    expect(amount('185')).toBe(8775);
    expect(podRdgForTenantYear('finestar', 2021)).toMatchObject({
      scheme: 'from-2016',
      periodFrom: '2021-01-01',
      periodTo: '2021-12-31',
    });
  });
});
