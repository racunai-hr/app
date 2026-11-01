import { describe, expect, it } from 'vitest';

import {
  FINESTAR_POD_BIL_2014,
  FINESTAR_POD_BIL_2015,
  formatPodBilAmount,
  podBilAmount,
  podBilForTenantYear,
  podBilYears,
} from './podBil2014';
import { FINESTAR_POD_BIL_2016 } from './podBil2016';
import { FINESTAR_POD_BIL_2017 } from './podBil2017';
import { FINESTAR_POD_BIL_2018 } from './podBil2018';
import { FINESTAR_POD_BIL_2019 } from './podBil2019';
import { FINESTAR_POD_BIL_2020 } from './podBil2020';
import { FINESTAR_POD_BIL_2021 } from './podBil2021';

describe('Fine Star POD-BIL 2014', () => {
  it('balances aktiva and pasiva in whole kuna', () => {
    expect(podBilAmount('034')).toBe(
      podBilAmount('035') + podBilAmount('043') + podBilAmount('050') + podBilAmount('058'),
    );
    expect(podBilAmount('060')).toBe(
      podBilAmount('001') + podBilAmount('002') + podBilAmount('034') + podBilAmount('059'),
    );
    expect(podBilAmount('075')).toBe(podBilAmount('076') - podBilAmount('077'));
    expect(podBilAmount('062')).toBe(
      podBilAmount('063') +
        podBilAmount('064') +
        podBilAmount('065') +
        podBilAmount('071') +
        podBilAmount('072') +
        podBilAmount('075') +
        podBilAmount('078'),
    );
    expect(podBilAmount('107')).toBe(
      podBilAmount('062') +
        podBilAmount('079') +
        podBilAmount('083') +
        podBilAmount('093') +
        podBilAmount('106'),
    );
    expect(podBilAmount('060')).toBe(20100);
    expect(podBilAmount('107')).toBe(20100);
    expect(podBilAmount('055')).toBe(10000);
    expect(podBilAmount('077')).toBe(200);
  });

  it('keeps the pre-2016 AOP span and zero previous year', () => {
    const aops = FINESTAR_POD_BIL_2014.filter((line) => line.aop).map((line) => line.aop);
    expect(aops[0]).toBe('001');
    expect(aops.at(-1)).toBe('110');
    expect(new Set(aops).size).toBe(aops.length);
    expect(FINESTAR_POD_BIL_2014.find((line) => line.aop === '006')?.label).toContain('Goodwill');
    expect(FINESTAR_POD_BIL_2014.filter((line) => line.aop).every((line) => line.previous === 0)).toBe(
      true,
    );
  });

  it('formats whole kuna with a Croatian thousands separator', () => {
    expect(formatPodBilAmount(20100)).toBe('20.100');
    expect(formatPodBilAmount(9800)).toBe('9.800');
    expect(formatPodBilAmount(-200)).toBe('−200');
    expect(formatPodBilAmount(0)).toBe('0');
  });

  it('returns the 2014 snapshot only for Fine Star before the 2016 scheme', () => {
    const snapshot = podBilForTenantYear('finestar', 2014);
    expect(snapshot).toMatchObject({
      status: 'snapshot',
      scheme: 'pre-2016',
      currency: 'HRK',
      asOf: '2014-12-31',
    });
    expect(podBilForTenantYear('finestar', 2015)).toMatchObject({
      status: 'snapshot',
      asOf: '2015-12-31',
    });
    expect(podBilForTenantYear('finestar', 2022)).toEqual({
      status: 'empty',
      year: 2022,
      scheme: 'from-2016',
    });
    expect(podBilForTenantYear('other', 2014)).toEqual({
      status: 'empty',
      year: 2014,
      scheme: 'pre-2016',
    });
    expect(podBilYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]);
    expect(podBilYears('other')).toEqual([]);
  });

  it('keeps the 2015 scan, including the printed comparative column', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2015);
    const previous = (aop: string) =>
      FINESTAR_POD_BIL_2015.find((line) => line.aop === aop)?.previous;
    expect(amount('034')).toBe(amount('043') + amount('050') + amount('058'));
    expect(amount('060')).toBe(20694);
    expect(amount('107')).toBe(20694);
    expect(amount('045')).toBe(894);
    expect(amount('055')).toBe(19800);
    expect(amount('056')).toBe(0);
    expect(amount('072')).toBe(-200);
    expect(amount('074')).toBe(200);
    expect(amount('075')).toBe(0);
    expect(previous('056')).toBe(10000);
    expect(previous('055')).toBe(0);
    expect(previous('058')).toBe(9800);
    expect(previous('075')).toBe(-200);
    expect(previous('077')).toBe(200);
  });

  it('keeps the 2016 scheme and the printed loan column', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2016);
    const previous = (aop: string) => FINESTAR_POD_BIL_2016.find((line) => line.aop === aop)?.previous;
    const aops = FINESTAR_POD_BIL_2016.filter((line) => line.aop).map((line) => line.aop);
    expect(aops[0]).toBe('001');
    expect(aops.at(-1)).toBe('124');
    expect(new Set(aops).size).toBe(aops.length);
    expect(amount('037')).toBe(amount('046') + amount('053') + amount('063'));
    expect(amount('065')).toBe(21051);
    expect(amount('123')).toBe(21051);
    expect(amount('052')).toBe(1481);
    expect(amount('059')).toBe(19570);
    expect(amount('067')).toBe(19570);
    expect(amount('084')).toBe(-230);
    expect(amount('086')).toBe(230);
    expect(previous('049')).toBe(894);
    expect(previous('059')).toBe(19800);
    expect(previous('081')).toBe(-200);
    expect(podBilForTenantYear('finestar', 2016)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2016-12-31',
    });
  });

  it('keeps the 2017 scan, including the printed comparative column', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2017);
    const previous = (aop: string) => FINESTAR_POD_BIL_2017.find((line) => line.aop === aop)?.previous;
    expect(amount('037')).toBe(amount('046') + amount('053'));
    expect(amount('046')).toBe(amount('051') + amount('052'));
    expect(amount('065')).toBe(20468);
    expect(amount('123')).toBe(20468);
    expect(amount('051')).toBe(245);
    expect(amount('052')).toBe(2027);
    expect(amount('059')).toBe(18196);
    expect(amount('067')).toBe(18441);
    expect(amount('068')).toBe(20000);
    expect(amount('081')).toBe(-430);
    expect(amount('083')).toBe(430);
    expect(amount('084')).toBe(-1129);
    expect(amount('086')).toBe(1129);
    expect(previous('037')).toBe(21051);
    expect(previous('059')).toBe(19570);
    expect(previous('081')).toBe(-200);
    expect(previous('084')).toBe(-230);
    expect(podBilForTenantYear('finestar', 2017)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2017-12-31',
    });
  });

  it('keeps the 2018 scan, including the printed comparative column', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2018);
    const previous = (aop: string) => FINESTAR_POD_BIL_2018.find((line) => line.aop === aop)?.previous;
    expect(amount('037')).toBe(amount('046') + amount('053'));
    expect(amount('046')).toBe(amount('051') + amount('052'));
    expect(amount('065')).toBe(20777);
    expect(amount('123')).toBe(20777);
    expect(amount('051')).toBe(245);
    expect(amount('052')).toBe(2566);
    expect(amount('059')).toBe(17966);
    expect(amount('067')).toBe(18211);
    expect(amount('068')).toBe(20000);
    expect(amount('081')).toBe(-1559);
    expect(amount('083')).toBe(1559);
    expect(amount('084')).toBe(-230);
    expect(amount('086')).toBe(230);
    expect(amount('067')).toBe(amount('068') + amount('081') + amount('084'));
    expect(previous('037')).toBe(20468);
    expect(previous('059')).toBe(18196);
    expect(previous('081')).toBe(-430);
    expect(previous('084')).toBe(-1129);
    expect(podBilForTenantYear('finestar', 2018)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2018-12-31',
    });
  });

  it('keeps the 2019 scan, including the two-year loss on the current column', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2019);
    const previous = (aop: string) => FINESTAR_POD_BIL_2019.find((line) => line.aop === aop)?.previous;
    expect(amount('037')).toBe(amount('046') + amount('053'));
    expect(amount('046')).toBe(amount('051') + amount('052'));
    expect(amount('065')).toBe(20902);
    expect(amount('123')).toBe(20902);
    expect(amount('052')).toBe(2921);
    expect(amount('059')).toBe(17736);
    expect(amount('067')).toBe(17981);
    expect(amount('067')).toBe(amount('068') + amount('081') + amount('084'));
    expect(amount('081')).toBe(-1559);
    expect(amount('084')).toBe(-460);
    expect(amount('086')).toBe(460);
    expect(previous('037')).toBe(20777);
    expect(previous('084')).toBe(-230);
    expect(previous('086')).toBe(230);
    expect(podBilForTenantYear('finestar', 2019)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2019-12-31',
    });
  });

  it('keeps the 2020 public balance, including the land and the rounded loss', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2020);
    const previous = (aop: string) => FINESTAR_POD_BIL_2020.find((line) => line.aop === aop)?.previous;
    expect(amount('002')).toBe(amount('010'));
    expect(amount('010')).toBe(amount('011'));
    expect(amount('011')).toBe(664768);
    expect(amount('037')).toBe(amount('046') + amount('053'));
    expect(amount('046')).toBe(amount('051') + amount('052'));
    expect(amount('065')).toBe(686024);
    expect(amount('123')).toBe(686024);
    expect(amount('107')).toBe(amount('115'));
    expect(amount('067')).toBe(17980);
    expect(amount('067')).toBe(amount('068') + amount('081') + amount('084'));
    expect(amount('081')).toBe(-2019);
    expect(amount('084')).toBe(-1);
    expect(amount('063')).toBe(0);
    expect(previous('081')).toBe(-1789);
    expect(previous('084')).toBe(-230);
    expect(previous('067')).toBe(17981);
    expect(podBilForTenantYear('finestar', 2020)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2020-12-31',
    });
  });

  it('keeps the 2021 public balance and the note splits', () => {
    const amount = (aop: string) => podBilAmount(aop, FINESTAR_POD_BIL_2021);
    const previous = (aop: string) => FINESTAR_POD_BIL_2021.find((line) => line.aop === aop)?.previous;
    expect(amount('011')).toBe(664768);
    expect(amount('037')).toBe(amount('046') + amount('053') + amount('063'));
    expect(amount('046')).toBe(amount('051') + amount('052'));
    expect(amount('051')).toBe(605);
    expect(amount('053')).toBe(amount('061'));
    expect(amount('061')).toBe(21544);
    expect(amount('063')).toBe(9604);
    expect(amount('065')).toBe(696521);
    expect(amount('123')).toBe(696521);
    expect(amount('067')).toBe(9205);
    expect(amount('067')).toBe(amount('068') + amount('081') + amount('084'));
    expect(amount('107')).toBe(amount('112') + amount('115') + amount('118') + amount('121'));
    expect(amount('112')).toBe(364954);
    expect(amount('115')).toBe(317443);
    expect(amount('118')).toBe(4919);
    expect(amount('122')).toBe(0);
    expect(previous('011')).toBe(664768);
    expect(previous('081')).toBe(-2019);
    expect(previous('107')).toBe(668044);
    expect(podBilForTenantYear('finestar', 2021)).toMatchObject({
      status: 'snapshot',
      scheme: 'from-2016',
      asOf: '2021-12-31',
    });
  });
});
