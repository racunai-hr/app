import { describe, expect, it } from 'vitest';

import {
  FINESTAR_BRUTO_BILANCA_2014,
  FINESTAR_BRUTO_BILANCA_2015,
  FINESTAR_BRUTO_BILANCA_2016,
  FINESTAR_BRUTO_BILANCA_2017,
  FINESTAR_BRUTO_BILANCA_2018,
  FINESTAR_BRUTO_BILANCA_2019,
  FINESTAR_BRUTO_BILANCA_2020,
  FINESTAR_BRUTO_BILANCA_2021,
  brutoBilancaForTenantYear,
  brutoBilancaYears,
  formatTrialCents,
  trialAccount,
  trialSaldo,
  trialTotalCredit,
  trialTotalDebit,
} from './brutoBilanca2014';

const kn = (kuna: number, lipa = 0) => kuna * 100 + lipa;

describe('Fine Star bruto bilanca 2014', () => {
  it('closes with equal turnover and the printed class balances', () => {
    const accounts = FINESTAR_BRUTO_BILANCA_2014.filter((row) => row.kind === 'account');
    const debit = accounts.reduce((sum, row) => sum + row.turnoverDebit, 0);
    const credit = accounts.reduce((sum, row) => sum + row.turnoverCredit, 0);
    expect(debit).toBe(kn(73331, 14));
    expect(credit).toBe(kn(73331, 14));

    const grand = FINESTAR_BRUTO_BILANCA_2014.find((row) => row.kind === 'grand');
    expect(grand && trialSaldo(grand)).toBe(0);
    expect(trialSaldo(FINESTAR_BRUTO_BILANCA_2014.find((row) => row.code === '1' && row.kind === 'class')!)).toBe(
      kn(20100),
    );
    expect(trialSaldo(FINESTAR_BRUTO_BILANCA_2014.find((row) => row.code === '9' && row.kind === 'class')!)).toBe(
      kn(19800),
    );
    expect(trialSaldo(trialAccount('1020'))).toBe(kn(9800));
    expect(trialSaldo(trialAccount('1140'))).toBe(kn(10000));
    expect(trialSaldo(trialAccount('1200'))).toBe(kn(300));
    expect(trialSaldo(trialAccount('2930'))).toBe(kn(300));
    expect(trialTotalCredit(trialAccount('9000'))).toBe(kn(20000));
    expect(trialSaldo(trialAccount('9510'))).toBe(kn(200));
    expect(trialSaldo(trialAccount('1000'))).toBe(0);
    expect(trialAccount('4650').turnoverDebit).toBe(1);
  });

  it('formats lipa with a Croatian thousands separator', () => {
    expect(formatTrialCents(kn(73331, 14))).toBe('73.331,14');
    expect(formatTrialCents(kn(9800))).toBe('9.800,00');
    expect(formatTrialCents(0)).toBe('0,00');
  });

  it('returns the 2014 snapshot only for Fine Star', () => {
    expect(brutoBilancaForTenantYear('finestar', 2014)).toMatchObject({
      status: 'snapshot',
      currency: 'HRK',
      periodFrom: '2014-01-01',
      periodTo: '2014-12-31',
    });
    expect(brutoBilancaYears('finestar')).toEqual([2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]);
    expect(brutoBilancaYears('other')).toEqual([]);
  });

  it('keeps the 2015 opening balances and the cash transfer', () => {
    const row = (code: string, kind: 'account' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2015.find((item) => item.kind === kind && item.code === code);
    const cash = row('1020')!;
    expect(cash.openingDebit).toBe(kn(9800));
    expect(cash.turnoverCredit).toBe(kn(9800));
    expect(trialSaldo(cash)).toBe(0);
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(10000));
    expect(loan.turnoverDebit).toBe(kn(9800));
    expect(trialSaldo(loan)).toBe(kn(19800));
    expect(trialSaldo(row('1200')!)).toBe(kn(894));
    expect(trialSaldo(row('2930')!)).toBe(kn(894));
    expect(trialSaldo(row('9410')!)).toBe(kn(200));
    expect(trialSaldo(row('9510')!)).toBe(0);
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(20694));
    expect(trialSaldo(row('', 'grand')!)).toBe(0);
    expect(trialTotalDebit(row('', 'grand')!)).toBe(kn(30894));
    expect(trialTotalCredit(row('', 'grand')!)).toBe(kn(30894));
    expect(brutoBilancaForTenantYear('finestar', 2015)).toMatchObject({
      periodFrom: '2015-01-01',
      periodTo: '2015-12-31',
    });
  });

  it('keeps the 2016 interest receivable and the reduced director loan', () => {
    const row = (code: string, kind: 'account' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2016.find((item) => item.kind === kind && item.code === code);
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(19800));
    expect(loan.turnoverCredit).toBe(kn(230));
    expect(trialSaldo(loan)).toBe(kn(19570));
    const interest = row('1243')!;
    expect(interest.turnoverDebit).toBe(kn(587, 10));
    expect(trialSaldo(interest)).toBe(kn(1481, 10));
    expect(trialSaldo(row('2930')!)).toBe(kn(1481, 10));
    expect(trialSaldo(row('9510')!)).toBe(kn(230));
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(21051, 10));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(trialTotalDebit(grand)).toBe(kn(23551, 10));
    expect(trialTotalCredit(grand)).toBe(kn(23551, 10));
    expect(brutoBilancaForTenantYear('finestar', 2016)).toMatchObject({
      periodFrom: '2016-01-01',
      periodTo: '2016-12-31',
    });
  });

  it('keeps the 2017 printed openings, including both sides of the supplier account', () => {
    const row = (code: string, kind: 'account' | 'group' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2017.find((item) => item.kind === kind && item.code === code);
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(19570));
    expect(loan.turnoverCredit).toBe(kn(1373, 75));
    expect(trialSaldo(loan)).toBe(kn(18196, 25));
    const interest = row('1243')!;
    expect(interest.openingDebit).toBe(kn(1481, 10));
    expect(interest.turnoverDebit).toBe(kn(545, 89));
    expect(trialSaldo(interest)).toBe(kn(2026, 99));
    expect(trialSaldo(row('14003')!)).toBe(0);
    expect(trialSaldo(row('1407')!)).toBe(kn(244, 75));
    expect(row('140', 'group')!.turnoverDebit).toBe(kn(489, 50));
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(20467, 99));
    const supplier = row('2200')!;
    expect(supplier.openingDebit).toBe(kn(230));
    expect(supplier.openingCredit).toBe(kn(230));
    expect(trialSaldo(supplier)).toBe(0);
    expect(trialSaldo(row('2930')!)).toBe(kn(2026, 99));
    expect(row('4167')!.turnoverDebit).toBe(kn(945));
    expect(row('4650')!.turnoverDebit).toBe(kn(184));
    expect(trialSaldo(row('9410')!)).toBe(kn(200));
    expect(trialSaldo(row('9411')!)).toBe(kn(230));
    expect(trialSaldo(row('941', 'group')!)).toBe(kn(430));
    expect(trialSaldo(row('9510')!)).toBe(kn(1129));
    expect(trialSaldo(row('9', 'class')!)).toBe(kn(18441));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(grand.openingDebit).toBe(kn(21711, 10));
    expect(grand.turnoverDebit).toBe(kn(11915, 89));
    expect(trialTotalDebit(grand)).toBe(kn(33626, 99));
    expect(trialTotalCredit(grand)).toBe(kn(33626, 99));
    expect(brutoBilancaForTenantYear('finestar', 2017)).toMatchObject({
      periodFrom: '2017-01-01',
      periodTo: '2017-12-31',
    });
  });

  it('keeps the 2018 loan, interest and the carried 2017 loss', () => {
    const row = (code: string, kind: 'account' | 'group' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2018.find((item) => item.kind === kind && item.code === code);
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(18196, 25));
    expect(loan.turnoverCredit).toBe(kn(230));
    expect(trialSaldo(loan)).toBe(kn(17966, 25));
    const interest = row('1243')!;
    expect(interest.openingDebit).toBe(kn(2026, 99));
    expect(interest.turnoverDebit).toBe(kn(538, 99));
    expect(trialSaldo(interest)).toBe(kn(2565, 98));
    expect(trialSaldo(row('1407')!)).toBe(kn(244, 75));
    expect(FINESTAR_BRUTO_BILANCA_2018.some((item) => item.code === '14003')).toBe(false);
    expect(FINESTAR_BRUTO_BILANCA_2018.some((item) => item.code === '4167')).toBe(false);
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(20776, 98));
    expect(row('2200')!.openingDebit).toBe(kn(1603, 75));
    expect(trialSaldo(row('2200')!)).toBe(0);
    expect(trialSaldo(row('2930')!)).toBe(kn(2565, 98));
    expect(row('4650')!.turnoverDebit).toBe(kn(230));
    expect(trialSaldo(row('9410')!)).toBe(kn(200));
    expect(trialSaldo(row('9411')!)).toBe(kn(230));
    expect(trialSaldo(row('9412')!)).toBe(kn(1129));
    expect(trialSaldo(row('941', 'group')!)).toBe(kn(1559));
    expect(trialSaldo(row('9510')!)).toBe(kn(230));
    expect(trialSaldo(row('9', 'class')!)).toBe(kn(18211));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(grand.openingDebit).toBe(kn(23630, 74));
    expect(grand.turnoverDebit).toBe(kn(3507, 99));
    expect(trialTotalDebit(grand)).toBe(kn(27138, 73));
    expect(trialTotalCredit(grand)).toBe(kn(27138, 73));
    expect(brutoBilancaForTenantYear('finestar', 2018)).toMatchObject({
      periodFrom: '2018-01-01',
      periodTo: '2018-12-31',
    });
  });

  it('keeps the 2019 loan, interest and the loss left on the current-year account', () => {
    const row = (code: string, kind: 'account' | 'group' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2019.find((item) => item.kind === kind && item.code === code);
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(17966, 25));
    expect(loan.turnoverCredit).toBe(kn(230));
    expect(trialSaldo(loan)).toBe(kn(17736, 25));
    const interest = row('1243')!;
    expect(interest.openingDebit).toBe(kn(2565, 98));
    expect(interest.turnoverDebit).toBe(kn(354, 73));
    expect(trialSaldo(interest)).toBe(kn(2920, 71));
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(20901, 71));
    expect(trialSaldo(row('2930')!)).toBe(kn(2920, 71));
    expect(FINESTAR_BRUTO_BILANCA_2019.some((item) => item.code === '9413')).toBe(false);
    expect(row('941', 'group')!.turnoverDebit).toBe(0);
    expect(trialSaldo(row('941', 'group')!)).toBe(kn(1559));
    expect(trialSaldo(row('9510')!)).toBe(kn(460));
    expect(trialSaldo(row('9', 'class')!)).toBe(kn(17981));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(grand.openingDebit).toBe(kn(24169, 73));
    expect(grand.turnoverDebit).toBe(kn(2194, 73));
    expect(trialTotalDebit(grand)).toBe(kn(26364, 46));
    expect(trialTotalCredit(grand)).toBe(kn(26364, 46));
    expect(brutoBilancaForTenantYear('finestar', 2019)).toMatchObject({
      periodFrom: '2019-01-01',
      periodTo: '2019-12-31',
    });
  });

  it('follows the printed 2020 trial balance, including the lipa loss', () => {
    const row = (code: string, kind: 'account' | 'group' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2020.find((item) => item.kind === kind && item.code === code);
    const land = row('0200')!;
    expect(land.turnoverDebit).toBe(kn(664768));
    expect(land.turnoverCredit).toBe(0);
    expect(trialSaldo(land)).toBe(kn(664768));
    const prepared = row('0371')!;
    expect(prepared.turnoverDebit).toBe(kn(664768));
    expect(prepared.turnoverCredit).toBe(kn(664768));
    expect(trialSaldo(prepared)).toBe(0);
    expect(row('0', 'class')!.turnoverDebit).toBe(kn(1329536));
    const loan = row('1140')!;
    expect(loan.openingDebit).toBe(kn(17736, 25));
    expect(loan.turnoverDebit).toBe(0);
    expect(loan.turnoverCredit).toBe(0);
    expect(trialSaldo(loan)).toBe(kn(17736, 25));
    const interest = row('1243')!;
    expect(interest.openingDebit).toBe(kn(2920, 71));
    expect(interest.turnoverDebit).toBe(kn(354, 73));
    expect(trialSaldo(interest)).toBe(kn(3275, 44));
    expect(row('14003')!.turnoverDebit).toBe(kn(166192));
    expect(trialSaldo(row('14003')!)).toBe(0);
    expect(trialSaldo(row('2930')!)).toBe(kn(3275, 44));
    expect(row('1', 'class')!.turnoverDebit).toBe(kn(166546, 73));
    expect(trialSaldo(row('1', 'class')!)).toBe(kn(21256, 44));
    expect(row('2200')!.turnoverCredit).toBe(kn(664768));
    expect(trialTotalCredit(row('2200')!)).toBe(kn(666371, 75));
    expect(trialSaldo(row('2200')!)).toBe(kn(664768));
    expect(trialSaldo(row('24003')!)).toBe(0);
    expect(trialSaldo(row('2450')!)).toBe(kn(0, 56));
    expect(row('2', 'class')!.turnoverCredit).toBe(kn(831315, 29));
    expect(trialTotalCredit(row('2', 'class')!)).toBe(kn(835839, 75));
    expect(FINESTAR_BRUTO_BILANCA_2020.some((item) => item.code === '2310')).toBe(false);
    expect(FINESTAR_BRUTO_BILANCA_2020.some((item) => item.code === '4650')).toBe(false);
    expect(row('4663')!.turnoverDebit).toBe(kn(0, 56));
    expect(row('4', 'class')!.turnoverDebit).toBe(kn(1, 12));
    expect(row('9413')!.openingDebit).toBe(kn(230));
    expect(row('9413')!.turnoverDebit).toBe(0);
    expect(row('9414')!.turnoverDebit).toBe(kn(230));
    expect(row('941', 'group')!.openingDebit).toBe(kn(1789));
    expect(trialSaldo(row('941', 'group')!)).toBe(kn(2019));
    expect(row('9510')!.openingDebit).toBe(kn(230));
    expect(row('9510')!.turnoverCredit).toBe(kn(230));
    expect(trialSaldo(row('9510')!)).toBe(kn(0, 56));
    expect(trialTotalDebit(row('9', 'class')!)).toBe(kn(2249, 56));
    expect(trialTotalCredit(row('9', 'class')!)).toBe(kn(20230));
    expect(trialSaldo(row('9', 'class')!)).toBe(kn(17980, 44));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(grand.openingDebit).toBe(kn(24524, 46));
    expect(grand.openingCredit).toBe(kn(24524, 46));
    expect(grand.turnoverDebit).toBe(kn(1662508, 65));
    expect(grand.turnoverCredit).toBe(kn(1662508, 65));
    expect(trialTotalDebit(grand)).toBe(kn(1687033, 11));
    expect(trialTotalCredit(grand)).toBe(kn(1687033, 11));
    expect(brutoBilancaForTenantYear('finestar', 2020)).toMatchObject({
      periodFrom: '2020-01-01',
      periodTo: '2020-12-31',
    });
  });

  it('follows the printed 2021 trial balance through 31 October movements', () => {
    const row = (code: string, kind: 'account' | 'group' | 'class' | 'grand' = 'account') =>
      FINESTAR_BRUTO_BILANCA_2021.find((item) => item.kind === kind && item.code === code);
    expect(trialSaldo(row('0200')!)).toBe(kn(664768));
    expect(trialSaldo(row('1002')!)).toBe(kn(29331, 70));
    expect(trialSaldo(row('1003')!)).toBe(kn(174201, 65));
    expect(trialSaldo(row('100', 'group')!)).toBe(kn(203533, 35));
    expect(row('1243')!.openingDebit).toBe(kn(2920, 71));
    expect(row('1243')!.turnoverDebit).toBe(0);
    expect(row('14003')!.turnoverDebit).toBe(kn(360));
    expect(row('2131')!.turnoverCredit).toBe(kn(189000));
    expect(row('2132')!.turnoverCredit).toBe(kn(185600));
    expect(row('2134')!.turnoverCredit).toBe(kn(174203, 47));
    expect(FINESTAR_BRUTO_BILANCA_2021.some((item) => item.code === '2133')).toBe(false);
    expect(trialSaldo(row('2200')!)).toBe(kn(321384));
    expect(row('4164')!.turnoverDebit).toBe(kn(1440));
    expect(row('4651')!.turnoverDebit).toBe(kn(86, 12));
    expect(trialSaldo(row('941', 'group')!)).toBe(kn(1789));
    expect(FINESTAR_BRUTO_BILANCA_2021.some((item) => item.code === '9414')).toBe(false);
    expect(trialSaldo(row('9510')!)).toBe(kn(230));
    expect(trialSaldo(row('9', 'class')!)).toBe(kn(17981));
    const grand = row('', 'grand')!;
    expect(trialSaldo(grand)).toBe(0);
    expect(grand.openingDebit).toBe(kn(855484, 46));
    expect(grand.turnoverDebit).toBe(kn(895873, 59));
    expect(trialTotalDebit(grand)).toBe(kn(1751358, 5));
    expect(trialTotalCredit(grand)).toBe(kn(1751358, 5));
    expect(brutoBilancaForTenantYear('finestar', 2021)).toMatchObject({
      periodFrom: '2021-01-01',
      periodTo: '2021-12-31',
    });
  });
});
