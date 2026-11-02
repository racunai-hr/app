/** Fine Star trial balance printed 25.04.2015. Snapshot of the old program, not the current ledger. */

import { formatHrAmount } from '@/lib/formatHr';

import { FINESTAR_SLUG } from './podBil2014';

export const FINESTAR_BRUTO_BILANCA_YEAR = 2014;
export const FINESTAR_BRUTO_BILANCA_2015_YEAR = 2015;
export const FINESTAR_BRUTO_BILANCA_2016_YEAR = 2016;
export const FINESTAR_BRUTO_BILANCA_2017_YEAR = 2017;
export const FINESTAR_BRUTO_BILANCA_2018_YEAR = 2018;
export const FINESTAR_BRUTO_BILANCA_2019_YEAR = 2019;
export const FINESTAR_BRUTO_BILANCA_2020_YEAR = 2020;
export const FINESTAR_BRUTO_BILANCA_2021_YEAR = 2021;

export type TrialKind = 'banner' | 'account' | 'group' | 'class' | 'grand';

/** Amounts are integer lipa (1/100 kn). */
export type TrialRow = {
  kind: TrialKind;
  code: string;
  label: string;
  openingDebit: number;
  openingCredit: number;
  turnoverDebit: number;
  turnoverCredit: number;
};

export type TrialView =
  | {
      status: 'snapshot';
      year: number;
      currency: 'HRK';
      periodFrom: string;
      periodTo: string;
      rows: TrialRow[];
    }
  | { status: 'empty'; year: number };

const kn = (kuna: number, lipa = 0) => kuna * 100 + lipa;

function line(
  kind: TrialKind,
  code: string,
  label: string,
  turnoverDebit = 0,
  turnoverCredit = 0,
): TrialRow {
  return {
    kind,
    code,
    label,
    openingDebit: 0,
    openingCredit: 0,
    turnoverDebit,
    turnoverCredit,
  };
}

function banner(label: string): TrialRow {
  return line('banner', '', label);
}

/** Closed trial balance, 01.01.–31.12.2014., with lipa. */
export const FINESTAR_BRUTO_BILANCA_2014: TrialRow[] = [
  banner('Grupa 100 · Klasa 1'),
  line('account', '1000', 'Žiro račun u banci', kn(20505, 19), kn(20505, 19)),
  line('account', '1009', 'Žiro-račun prijelazni konto', kn(20300), kn(20300)),
  line('group', '100', 'Ukupno grupa 100', kn(40805, 19), kn(40805, 19)),
  banner('Grupa 102 · Klasa 1'),
  line('account', '1020', 'Glavna blagajna', kn(20300), kn(10500)),
  line('group', '102', 'Ukupno grupa 102', kn(20300), kn(10500)),
  banner('Grupa 114 · Klasa 1'),
  line('account', '1140', 'Pozajmica direktoru', kn(10000), 0),
  line('group', '114', 'Ukupno grupa 114', kn(10000), 0),
  banner('Grupa 120 · Klasa 1'),
  line('account', '1200', 'Kupci', kn(300), 0),
  line('group', '120', 'Ukupno grupa 120', kn(300), 0),
  line('class', '1', 'Ukupno klasa 1', kn(71405, 19), kn(51305, 19)),
  banner('Grupa 213 · Klasa 2'),
  line('account', '2131', 'Obveze s osnova zajmova direktoru', kn(500), kn(500)),
  line('group', '213', 'Ukupno grupa 213', kn(500), kn(500)),
  banner('Grupa 293 · Klasa 2'),
  line('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(300)),
  line('group', '293', 'Ukupno grupa 293', 0, kn(300)),
  line('class', '2', 'Ukupno klasa 2', kn(500), kn(800)),
  banner('Grupa 465 · Klasa 4'),
  line('account', '4650', 'Naknada za usluge platnog prometa', 1, 1),
  line('account', '4651', 'Trošak banke', kn(205, 18), kn(205, 18)),
  line('group', '465', 'Ukupno grupa 465', kn(205, 19), kn(205, 19)),
  banner('Grupa 490 · Klasa 4'),
  line('account', '4900', 'Raspored troškova', kn(205, 19), kn(205, 19)),
  line('group', '490', 'Ukupno grupa 490', kn(205, 19), kn(205, 19)),
  line('class', '4', 'Ukupno klasa 4', kn(410, 38), kn(410, 38)),
  banner('Grupa 701 · Klasa 7'),
  line('account', '7010', 'Trošak prodanih proizvoda i usluga', kn(205, 19), kn(205, 19)),
  line('group', '701', 'Ukupno grupa 701', kn(205, 19), kn(205, 19)),
  banner('Grupa 771 · Klasa 7'),
  line('account', '7710', 'Prihodi od kamata', kn(5, 19), kn(5, 19)),
  line('group', '771', 'Ukupno grupa 771', kn(5, 19), kn(5, 19)),
  banner('Grupa 790 · Klasa 7'),
  line('account', '7900', 'Razlika prihoda i rashoda', kn(205, 19), kn(205, 19)),
  line('group', '790', 'Ukupno grupa 790', kn(205, 19), kn(205, 19)),
  line('class', '7', 'Ukupno klasa 7', kn(415, 57), kn(415, 57)),
  banner('Grupa 801 · Klasa 8'),
  line('account', '8010', 'Gubitak prije oporezivanja', kn(200), kn(200)),
  line('group', '801', 'Ukupno grupa 801', kn(200), kn(200)),
  banner('Grupa 804 · Klasa 8'),
  line('account', '8041', 'Gubitak tekuće godine', kn(200), kn(200)),
  line('group', '804', 'Ukupno grupa 804', kn(200), kn(200)),
  line('class', '8', 'Ukupno klasa 8', kn(400), kn(400)),
  banner('Grupa 900 · Klasa 9'),
  line('account', '9000', 'Upisani temeljni kapital', 0, kn(20000)),
  line('group', '900', 'Ukupno grupa 900', 0, kn(20000)),
  banner('Grupa 951 · Klasa 9'),
  line('account', '9510', 'Gubitak tekuće godine', kn(200), 0),
  line('group', '951', 'Ukupno grupa 951', kn(200), 0),
  line('class', '9', 'Ukupno klasa 9', kn(200), kn(20000)),
  line('grand', '', 'Sveukupno', kn(73331, 14), kn(73331, 14)),
];

function opened(
  kind: TrialKind,
  code: string,
  label: string,
  openingDebit: number,
  openingCredit: number,
  turnoverDebit: number,
  turnoverCredit: number,
): TrialRow {
  return { kind, code, label, openingDebit, openingCredit, turnoverDebit, turnoverCredit };
}

/** Trial balance 01.01.–31.12.2015. Opening is the 2014 close. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2015: TrialRow[] = [
  banner('Grupa 102 · Klasa 1'),
  opened('account', '1020', 'Glavna blagajna', kn(9800), 0, 0, kn(9800)),
  opened('group', '102', 'Ukupno grupa 102', kn(9800), 0, 0, kn(9800)),
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(10000), 0, kn(9800), 0),
  opened('group', '114', 'Ukupno grupa 114', kn(10000), 0, kn(9800), 0),
  banner('Grupa 120 · Klasa 1'),
  opened('account', '1200', 'Kupci', kn(300), 0, kn(594), 0),
  opened('group', '120', 'Ukupno grupa 120', kn(300), 0, kn(594), 0),
  opened('class', '1', 'Ukupno klasa 1', kn(20100), 0, kn(10394), kn(9800)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(300), 0, kn(594)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(300), 0, kn(594)),
  opened('class', '2', 'Ukupno klasa 2', 0, kn(300), 0, kn(594)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', 0, 0, kn(200), 0),
  opened('group', '941', 'Ukupno grupa 941', 0, 0, kn(200), 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(200), 0, 0, kn(200)),
  opened('group', '951', 'Ukupno grupa 951', kn(200), 0, 0, kn(200)),
  opened('class', '9', 'Ukupno klasa 9', kn(200), kn(20000), kn(200), kn(200)),
  opened('grand', '', 'Sveukupno', kn(20300), kn(20300), kn(10594), kn(10594)),
];

/** Trial balance 01.01.–31.12.2016. Opening is the 2015 close. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2016: TrialRow[] = [
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(19800), 0, 0, kn(230)),
  opened('group', '114', 'Ukupno grupa 114', kn(19800), 0, 0, kn(230)),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanja za kamate iz danih pozajmica', kn(894), 0, kn(587, 10), 0),
  opened('group', '124', 'Ukupno grupa 124', kn(894), 0, kn(587, 10), 0),
  opened('class', '1', 'Ukupno klasa 1', kn(20694), 0, kn(587, 10), kn(230)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', 0, 0, kn(230), kn(230)),
  opened('group', '220', 'Ukupno grupa 220', 0, 0, kn(230), kn(230)),
  banner('Grupa 231 · Klasa 2'),
  opened('account', '2310', 'Dobavljači pl. gotovinom', 0, 0, kn(230), kn(230)),
  opened('group', '231', 'Ukupno grupa 231', 0, 0, kn(230), kn(230)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(894), 0, kn(587, 10)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(894), 0, kn(587, 10)),
  opened('class', '2', 'Ukupno klasa 2', 0, kn(894), kn(460), kn(1047, 10)),
  banner('Grupa 465 · Klasa 4'),
  opened('account', '4650', 'Naknada za usluge platnog prometa', 0, 0, kn(230), kn(230)),
  opened('group', '465', 'Ukupno grupa 465', 0, 0, kn(230), kn(230)),
  banner('Grupa 490 · Klasa 4'),
  opened('account', '4900', 'Raspored troškova', 0, 0, kn(230), kn(230)),
  opened('group', '490', 'Ukupno grupa 490', 0, 0, kn(230), kn(230)),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(460), kn(460)),
  banner('Grupa 701 · Klasa 7'),
  opened('account', '7010', 'Trošak prodanih proizvoda i usluga', 0, 0, kn(230), kn(230)),
  opened('group', '701', 'Ukupno grupa 701', 0, 0, kn(230), kn(230)),
  banner('Grupa 790 · Klasa 7'),
  opened('account', '7900', 'Razlika prihoda i rashoda', 0, 0, kn(230), kn(230)),
  opened('group', '790', 'Ukupno grupa 790', 0, 0, kn(230), kn(230)),
  opened('class', '7', 'Ukupno klasa 7', 0, 0, kn(460), kn(460)),
  banner('Grupa 801 · Klasa 8'),
  opened('account', '8010', 'Gubitak prije oporezivanja', 0, 0, kn(230), kn(230)),
  opened('group', '801', 'Ukupno grupa 801', 0, 0, kn(230), kn(230)),
  banner('Grupa 804 · Klasa 8'),
  opened('account', '8041', 'Gubitak tekuće godine', 0, 0, kn(230), kn(230)),
  opened('group', '804', 'Ukupno grupa 804', 0, 0, kn(230), kn(230)),
  opened('class', '8', 'Ukupno klasa 8', 0, 0, kn(460), kn(460)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('group', '941', 'Ukupno grupa 941', kn(200), 0, 0, 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', 0, 0, kn(230), 0),
  opened('group', '951', 'Ukupno grupa 951', 0, 0, kn(230), 0),
  opened('class', '9', 'Ukupno klasa 9', kn(200), kn(20000), kn(230), 0),
  opened('grand', '', 'Sveukupno', kn(20894), kn(20894), kn(2657, 10), kn(2657, 10)),
];

/** Trial balance 01.01.–31.12.2017. Opening is the printed 2016 close. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2017: TrialRow[] = [
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(19570), 0, 0, kn(1373, 75)),
  opened('group', '114', 'Ukupno grupa 114', kn(19570), 0, 0, kn(1373, 75)),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanja za kamatu iz danih zajmova', kn(1481, 10), 0, kn(545, 89), 0),
  opened('group', '124', 'Ukupno grupa 124', kn(1481, 10), 0, kn(545, 89), 0),
  banner('Grupa 140 · Klasa 1'),
  opened('account', '14003', 'Pretporez u ulaznim računima 25%', 0, 0, kn(244, 75), kn(244, 75)),
  opened('account', '1407', 'Potraživanja za razliku većeg PDV-a', 0, 0, kn(244, 75), 0),
  opened('group', '140', 'Ukupno grupa 140', 0, 0, kn(489, 50), kn(244, 75)),
  opened('class', '1', 'Ukupno klasa 1', kn(21051, 10), 0, kn(1035, 39), kn(1618, 50)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', kn(230), kn(230), kn(1373, 75), kn(1373, 75)),
  opened('group', '220', 'Ukupno grupa 220', kn(230), kn(230), kn(1373, 75), kn(1373, 75)),
  banner('Grupa 231 · Klasa 2'),
  opened('account', '2310', 'Dobavljači pl. gotovinom', 0, 0, kn(1373, 75), kn(1373, 75)),
  opened('group', '231', 'Ukupno grupa 231', 0, 0, kn(1373, 75), kn(1373, 75)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(1481, 10), 0, kn(545, 89)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(1481, 10), 0, kn(545, 89)),
  opened('class', '2', 'Ukupno klasa 2', kn(230), kn(1711, 10), kn(2747, 50), kn(3293, 39)),
  banner('Grupa 416 · Klasa 4'),
  opened('account', '4167', 'Odvjetničke, bilježničke usluge', 0, 0, kn(945), kn(945)),
  opened('group', '416', 'Ukupno grupa 416', 0, 0, kn(945), kn(945)),
  banner('Grupa 465 · Klasa 4'),
  opened('account', '4650', 'Naknada za usluge platnog prometa', 0, 0, kn(184), kn(184)),
  opened('group', '465', 'Ukupno grupa 465', 0, 0, kn(184), kn(184)),
  banner('Grupa 490 · Klasa 4'),
  opened('account', '4900', 'Raspored troškova', 0, 0, kn(1129), kn(1129)),
  opened('group', '490', 'Ukupno grupa 490', 0, 0, kn(1129), kn(1129)),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(2258), kn(2258)),
  banner('Grupa 701 · Klasa 7'),
  opened('account', '7010', 'Trošak prodanih proizvoda i usluga', 0, 0, kn(1129), kn(1129)),
  opened('group', '701', 'Ukupno grupa 701', 0, 0, kn(1129), kn(1129)),
  banner('Grupa 790 · Klasa 7'),
  opened('account', '7900', 'Razlika prihoda i rashoda', 0, 0, kn(1129), kn(1129)),
  opened('group', '790', 'Ukupno grupa 790', 0, 0, kn(1129), kn(1129)),
  opened('class', '7', 'Ukupno klasa 7', 0, 0, kn(2258), kn(2258)),
  banner('Grupa 801 · Klasa 8'),
  opened('account', '8010', 'Gubitak prije oporezivanja', 0, 0, kn(1129), kn(1129)),
  opened('group', '801', 'Ukupno grupa 801', 0, 0, kn(1129), kn(1129)),
  banner('Grupa 804 · Klasa 8'),
  opened('account', '8041', 'Gubitak tekuće godine', 0, 0, kn(1129), kn(1129)),
  opened('group', '804', 'Ukupno grupa 804', 0, 0, kn(1129), kn(1129)),
  opened('class', '8', 'Ukupno klasa 8', 0, 0, kn(2258), kn(2258)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('account', '9411', 'Preneseni gubitak 2016.', 0, 0, kn(230), 0),
  opened('group', '941', 'Ukupno grupa 941', kn(200), 0, kn(230), 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(230), 0, kn(1129), kn(230)),
  opened('group', '951', 'Ukupno grupa 951', kn(230), 0, kn(1129), kn(230)),
  opened('class', '9', 'Ukupno klasa 9', kn(430), kn(20000), kn(1359), kn(230)),
  opened('grand', '', 'Sveukupno', kn(21711, 10), kn(21711, 10), kn(11915, 89), kn(11915, 89)),
];

/** Trial balance 01.01.–31.12.2018. Opening is the printed 2017 close. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2018: TrialRow[] = [
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(18196, 25), 0, 0, kn(230)),
  opened('group', '114', 'Ukupno grupa 114', kn(18196, 25), 0, 0, kn(230)),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanja za kamate na dane zajmove', kn(2026, 99), 0, kn(538, 99), 0),
  opened('group', '124', 'Ukupno grupa 124', kn(2026, 99), 0, kn(538, 99), 0),
  banner('Grupa 140 · Klasa 1'),
  opened('account', '1407', 'Potraživanja za razliku većeg PDV-a', kn(244, 75), 0, 0, 0),
  opened('group', '140', 'Ukupno grupa 140', kn(244, 75), 0, 0, 0),
  opened('class', '1', 'Ukupno klasa 1', kn(20467, 99), 0, kn(538, 99), kn(230)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', kn(1603, 75), kn(1603, 75), 0, 0),
  opened('group', '220', 'Ukupno grupa 220', kn(1603, 75), kn(1603, 75), 0, 0),
  banner('Grupa 231 · Klasa 2'),
  opened('account', '2310', 'Dobavljači pl. gotovinom', 0, 0, kn(230), kn(230)),
  opened('group', '231', 'Ukupno grupa 231', 0, 0, kn(230), kn(230)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(2026, 99), 0, kn(538, 99)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(2026, 99), 0, kn(538, 99)),
  opened('class', '2', 'Ukupno klasa 2', kn(1603, 75), kn(3630, 74), kn(230), kn(768, 99)),
  banner('Grupa 465 · Klasa 4'),
  opened('account', '4650', 'Naknada za usluge platnog prometa', 0, 0, kn(230), kn(230)),
  opened('group', '465', 'Ukupno grupa 465', 0, 0, kn(230), kn(230)),
  banner('Grupa 490 · Klasa 4'),
  opened('account', '4900', 'Raspored troškova', 0, 0, kn(230), kn(230)),
  opened('group', '490', 'Ukupno grupa 490', 0, 0, kn(230), kn(230)),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(460), kn(460)),
  banner('Grupa 701 · Klasa 7'),
  opened('account', '7010', 'Trošak prodanih proizvoda i usluga', 0, 0, kn(230), kn(230)),
  opened('group', '701', 'Ukupno grupa 701', 0, 0, kn(230), kn(230)),
  banner('Grupa 790 · Klasa 7'),
  opened('account', '7900', 'Razlika prihoda i rashoda', 0, 0, kn(230), kn(230)),
  opened('group', '790', 'Ukupno grupa 790', 0, 0, kn(230), kn(230)),
  opened('class', '7', 'Ukupno klasa 7', 0, 0, kn(460), kn(460)),
  banner('Grupa 801 · Klasa 8'),
  opened('account', '8010', 'Gubitak prije oporezivanja', 0, 0, kn(230), kn(230)),
  opened('group', '801', 'Ukupno grupa 801', 0, 0, kn(230), kn(230)),
  banner('Grupa 804 · Klasa 8'),
  opened('account', '8041', 'Gubitak tekuće godine', 0, 0, kn(230), kn(230)),
  opened('group', '804', 'Ukupno grupa 804', 0, 0, kn(230), kn(230)),
  opened('class', '8', 'Ukupno klasa 8', 0, 0, kn(460), kn(460)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('account', '9411', 'Preneseni gubitak 2016.', kn(230), 0, 0, 0),
  opened('account', '9412', 'Preneseni gubitak 2017.', 0, 0, kn(1129), 0),
  opened('group', '941', 'Ukupno grupa 941', kn(430), 0, kn(1129), 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(1129), 0, kn(230), kn(1129)),
  opened('group', '951', 'Ukupno grupa 951', kn(1129), 0, kn(230), kn(1129)),
  opened('class', '9', 'Ukupno klasa 9', kn(1559), kn(20000), kn(1359), kn(1129)),
  opened('grand', '', 'Sveukupno', kn(23630, 74), kn(23630, 74), kn(3507, 99), kn(3507, 99)),
];

/** Trial balance 01.01.–31.12.2019. Opening is the printed 2018 close. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2019: TrialRow[] = [
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(17966, 25), 0, 0, kn(230)),
  opened('group', '114', 'Ukupno grupa 114', kn(17966, 25), 0, 0, kn(230)),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanja za kamate na dane zajmove', kn(2565, 98), 0, kn(354, 73), 0),
  opened('group', '124', 'Ukupno grupa 124', kn(2565, 98), 0, kn(354, 73), 0),
  banner('Grupa 140 · Klasa 1'),
  opened('account', '1407', 'Potraživanja za razliku većeg PDV-a', kn(244, 75), 0, 0, 0),
  opened('group', '140', 'Ukupno grupa 140', kn(244, 75), 0, 0, 0),
  opened('class', '1', 'Ukupno klasa 1', kn(20776, 98), 0, kn(354, 73), kn(230)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', kn(1603, 75), kn(1603, 75), 0, 0),
  opened('group', '220', 'Ukupno grupa 220', kn(1603, 75), kn(1603, 75), 0, 0),
  banner('Grupa 231 · Klasa 2'),
  opened('account', '2310', 'Dobavljači pl. gotovinom', 0, 0, kn(230), kn(230)),
  opened('group', '231', 'Ukupno grupa 231', 0, 0, kn(230), kn(230)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(2565, 98), 0, kn(354, 73)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(2565, 98), 0, kn(354, 73)),
  opened('class', '2', 'Ukupno klasa 2', kn(1603, 75), kn(4169, 73), kn(230), kn(584, 73)),
  banner('Grupa 465 · Klasa 4'),
  opened('account', '4650', 'Naknada za usluge platnog prometa', 0, 0, kn(230), kn(230)),
  opened('group', '465', 'Ukupno grupa 465', 0, 0, kn(230), kn(230)),
  banner('Grupa 490 · Klasa 4'),
  opened('account', '4900', 'Raspored troškova', 0, 0, kn(230), kn(230)),
  opened('group', '490', 'Ukupno grupa 490', 0, 0, kn(230), kn(230)),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(460), kn(460)),
  banner('Grupa 701 · Klasa 7'),
  opened('account', '7010', 'Trošak prodanih proizvoda i usluga', 0, 0, kn(230), kn(230)),
  opened('group', '701', 'Ukupno grupa 701', 0, 0, kn(230), kn(230)),
  banner('Grupa 790 · Klasa 7'),
  opened('account', '7900', 'Razlika prihoda i rashoda', 0, 0, kn(230), kn(230)),
  opened('group', '790', 'Ukupno grupa 790', 0, 0, kn(230), kn(230)),
  opened('class', '7', 'Ukupno klasa 7', 0, 0, kn(460), kn(460)),
  banner('Grupa 801 · Klasa 8'),
  opened('account', '8010', 'Gubitak prije oporezivanja', 0, 0, kn(230), kn(230)),
  opened('group', '801', 'Ukupno grupa 801', 0, 0, kn(230), kn(230)),
  banner('Grupa 804 · Klasa 8'),
  opened('account', '8041', 'Gubitak tekuće godine', 0, 0, kn(230), kn(230)),
  opened('group', '804', 'Ukupno grupa 804', 0, 0, kn(230), kn(230)),
  opened('class', '8', 'Ukupno klasa 8', 0, 0, kn(460), kn(460)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('account', '9411', 'Preneseni gubitak 2016.', kn(230), 0, 0, 0),
  opened('account', '9412', 'Preneseni gubitak 2017.', kn(1129), 0, 0, 0),
  opened('group', '941', 'Ukupno grupa 941', kn(1559), 0, 0, 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(230), 0, kn(230), 0),
  opened('group', '951', 'Ukupno grupa 951', kn(230), 0, kn(230), 0),
  opened('class', '9', 'Ukupno klasa 9', kn(1789), kn(20000), kn(230), 0),
  opened('grand', '', 'Sveukupno', kn(24169, 73), kn(24169, 73), kn(2194, 73), kn(2194, 73)),
];

/** Trial balance printed 09.04.2021. 15:45. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2020: TrialRow[] = [
  banner('Grupa 020 · Klasa 0'),
  opened('account', '0200', 'Zemljište', 0, 0, kn(664768), 0),
  opened('group', '020', 'Ukupno grupa 020', 0, 0, kn(664768), 0),
  banner('Grupa 037 · Klasa 0'),
  opened('account', '0371', 'Oprema u pripremi', 0, 0, kn(664768), kn(664768)),
  opened('group', '037', 'Ukupno grupa 037', 0, 0, kn(664768), kn(664768)),
  opened('class', '0', 'Ukupno klasa 0', 0, 0, kn(1329536), kn(664768)),
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(17736, 25), 0, 0, 0),
  opened('group', '114', 'Ukupno grupa 114', kn(17736, 25), 0, 0, 0),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanje za kamate na pozajmicu', kn(2920, 71), 0, kn(354, 73), 0),
  opened('group', '124', 'Ukupno grupa 124', kn(2920, 71), 0, kn(354, 73), 0),
  banner('Grupa 140 · Klasa 1'),
  opened('account', '14003', 'Pretporez u ulaznim računima 25%', 0, 0, kn(166192), kn(166192)),
  opened('account', '1407', 'Potraživanja za razliku većeg PDV-a', kn(244, 75), 0, 0, 0),
  opened('group', '140', 'Ukupno grupa 140', kn(244, 75), 0, kn(166192), kn(166192)),
  opened('class', '1', 'Ukupno klasa 1', kn(20901, 71), 0, kn(166546, 73), kn(166192)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', kn(1603, 75), kn(1603, 75), 0, kn(664768)),
  opened('group', '220', 'Ukupno grupa 220', kn(1603, 75), kn(1603, 75), 0, kn(664768)),
  banner('Grupa 240 · Klasa 2'),
  opened('account', '24003', 'Obveze za PDV po isporukama 25%', 0, 0, kn(166192), kn(166192)),
  opened('group', '240', 'Ukupno grupa 240', 0, 0, kn(166192), kn(166192)),
  banner('Grupa 245 · Klasa 2'),
  opened('account', '2450', 'Obveze za članarinu turističkim zajednicama', 0, 0, 0, kn(0, 56)),
  opened('group', '245', 'Ukupno grupa 245', 0, 0, 0, kn(0, 56)),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(2920, 71), 0, kn(354, 73)),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(2920, 71), 0, kn(354, 73)),
  opened('class', '2', 'Ukupno klasa 2', kn(1603, 75), kn(4524, 46), kn(166192), kn(831315, 29)),
  banner('Grupa 466 · Klasa 4'),
  opened('account', '4663', 'Trošak članarine turističkoj zajednici', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '466', 'Ukupno grupa 466', 0, 0, kn(0, 56), kn(0, 56)),
  banner('Grupa 490 · Klasa 4'),
  opened('account', '4900', 'Raspored troškova', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '490', 'Ukupno grupa 490', 0, 0, kn(0, 56), kn(0, 56)),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(1, 12), kn(1, 12)),
  banner('Grupa 701 · Klasa 7'),
  opened('account', '7010', 'Trošak prodanih proizvoda i usluga', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '701', 'Ukupno grupa 701', 0, 0, kn(0, 56), kn(0, 56)),
  banner('Grupa 790 · Klasa 7'),
  opened('account', '7900', 'Razlika prihoda i rashoda', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '790', 'Ukupno grupa 790', 0, 0, kn(0, 56), kn(0, 56)),
  opened('class', '7', 'Ukupno klasa 7', 0, 0, kn(1, 12), kn(1, 12)),
  banner('Grupa 801 · Klasa 8'),
  opened('account', '8010', 'Gubitak prije oporezivanja', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '801', 'Ukupno grupa 801', 0, 0, kn(0, 56), kn(0, 56)),
  banner('Grupa 804 · Klasa 8'),
  opened('account', '8041', 'Gubitak tekuće godine', 0, 0, kn(0, 56), kn(0, 56)),
  opened('group', '804', 'Ukupno grupa 804', 0, 0, kn(0, 56), kn(0, 56)),
  opened('class', '8', 'Ukupno klasa 8', 0, 0, kn(1, 12), kn(1, 12)),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('account', '9411', 'Preneseni gubitak 2016.', kn(230), 0, 0, 0),
  opened('account', '9412', 'Preneseni gubitak 2017.', kn(1129), 0, 0, 0),
  opened('account', '9413', 'Preneseni gubitak 2018.', kn(230), 0, 0, 0),
  opened('account', '9414', 'Preneseni gubitak 2019.', 0, 0, kn(230), 0),
  opened('group', '941', 'Ukupno grupa 941', kn(1789), 0, kn(230), 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(230), 0, kn(0, 56), kn(230)),
  opened('group', '951', 'Ukupno grupa 951', kn(230), 0, kn(0, 56), kn(230)),
  opened('class', '9', 'Ukupno klasa 9', kn(2019), kn(20000), kn(230, 56), kn(230)),
  opened('grand', '', 'Sveukupno', kn(24524, 46), kn(24524, 46), kn(1662508, 65), kn(1662508, 65)),
];

/** Trial balance printed 10.03.2022. Opening is the printed roll-forward. Amounts are lipa. */
export const FINESTAR_BRUTO_BILANCA_2021: TrialRow[] = [
  banner('Grupa 020 · Klasa 0'),
  opened('account', '0200', 'Zemljište', kn(664768), 0, 0, 0),
  opened('group', '020', 'Ukupno grupa 020', kn(664768), 0, 0, 0),
  opened('class', '0', 'Ukupno klasa 0', kn(664768), 0, 0, 0),
  banner('Grupa 100 · Klasa 1'),
  opened('account', '1002', 'Žiro račun OTP', 0, 0, kn(374600), kn(345268, 30)),
  opened('account', '1003', 'OTP EUR', 0, 0, kn(174203, 47), kn(1, 82)),
  opened('group', '100', 'Ukupno grupa 100', 0, 0, kn(548803, 47), kn(345270, 12)),
  banner('Grupa 114 · Klasa 1'),
  opened('account', '1140', 'Pozajmica direktoru', kn(17736, 25), 0, 0, 0),
  opened('group', '114', 'Ukupno grupa 114', kn(17736, 25), 0, 0, 0),
  banner('Grupa 124 · Klasa 1'),
  opened('account', '1243', 'Potraživanje za kamate na pozajmicu', kn(2920, 71), 0, 0, 0),
  opened('group', '124', 'Ukupno grupa 124', kn(2920, 71), 0, 0, 0),
  banner('Grupa 140 · Klasa 1'),
  opened('account', '14003', 'Pretporez u ulaznim računima 25%', kn(166192), 0, kn(360), 0),
  opened('account', '1407', 'Potraživanja za razliku većeg PDV-a', kn(244, 75), 0, 0, 0),
  opened('group', '140', 'Ukupno grupa 140', kn(166436, 75), 0, kn(360), 0),
  opened('class', '1', 'Ukupno klasa 1', kn(187093, 71), 0, kn(549163, 47), kn(345270, 12)),
  banner('Grupa 213 · Klasa 2'),
  opened('account', '2131', 'Obveze s osnova zajmova direktoru', 0, 0, 0, kn(189000)),
  opened('account', '2132', 'Obveza za zajam Šupina Poljica j.d.o.o.', 0, 0, 0, kn(185600)),
  opened('account', '2134', 'Obveze za zajmove Ante Vrcan', 0, 0, 0, kn(174203, 47)),
  opened('group', '213', 'Ukupno grupa 213', 0, 0, 0, kn(548803, 47)),
  banner('Grupa 220 · Klasa 2'),
  opened('account', '2200', 'Dobavljači', kn(1603, 75), kn(666371, 75), kn(345184), kn(1800)),
  opened('group', '220', 'Ukupno grupa 220', kn(1603, 75), kn(666371, 75), kn(345184), kn(1800)),
  banner('Grupa 240 · Klasa 2'),
  opened('account', '24003', 'Obveze za PDV po isporukama 25%', 0, kn(166192), 0, 0),
  opened('group', '240', 'Ukupno grupa 240', 0, kn(166192), 0, 0),
  banner('Grupa 293 · Klasa 2'),
  opened('account', '2930', 'Obračunani prihodi budućeg razdoblja', 0, kn(2920, 71), 0, 0),
  opened('group', '293', 'Ukupno grupa 293', 0, kn(2920, 71), 0, 0),
  opened('class', '2', 'Ukupno klasa 2', kn(1603, 75), kn(835484, 46), kn(345184), kn(550603, 47)),
  banner('Grupa 416 · Klasa 4'),
  opened('account', '4164', 'Knjigovodstvene usluge', 0, 0, kn(1440), 0),
  opened('group', '416', 'Ukupno grupa 416', 0, 0, kn(1440), 0),
  banner('Grupa 465 · Klasa 4'),
  opened('account', '4651', 'Trošak banke', 0, 0, kn(86, 12), 0),
  opened('group', '465', 'Ukupno grupa 465', 0, 0, kn(86, 12), 0),
  opened('class', '4', 'Ukupno klasa 4', 0, 0, kn(1526, 12), 0),
  banner('Grupa 900 · Klasa 9'),
  opened('account', '9000', 'Upisani temeljni kapital', 0, kn(20000), 0, 0),
  opened('group', '900', 'Ukupno grupa 900', 0, kn(20000), 0, 0),
  banner('Grupa 941 · Klasa 9'),
  opened('account', '9410', 'Preneseni gubitak 2014.', kn(200), 0, 0, 0),
  opened('account', '9411', 'Preneseni gubitak 2016.', kn(230), 0, 0, 0),
  opened('account', '9412', 'Preneseni gubitak 2017.', kn(1129), 0, 0, 0),
  opened('account', '9413', 'Preneseni gubitak 2018.', kn(230), 0, 0, 0),
  opened('group', '941', 'Ukupno grupa 941', kn(1789), 0, 0, 0),
  banner('Grupa 951 · Klasa 9'),
  opened('account', '9510', 'Gubitak tekuće godine', kn(230), 0, 0, 0),
  opened('group', '951', 'Ukupno grupa 951', kn(230), 0, 0, 0),
  opened('class', '9', 'Ukupno klasa 9', kn(2019), kn(20000), 0, 0),
  opened('grand', '', 'Sveukupno', kn(855484, 46), kn(855484, 46), kn(895873, 59), kn(895873, 59)),
];

export function trialTotalDebit(row: TrialRow): number {
  return row.openingDebit + row.turnoverDebit;
}

export function trialTotalCredit(row: TrialRow): number {
  return row.openingCredit + row.turnoverCredit;
}

export function trialSaldo(row: TrialRow): number {
  return Math.abs(trialTotalDebit(row) - trialTotalCredit(row));
}

export function formatTrialCents(cents: number): string {
  const abs = Math.abs(cents);
  const kuna = Math.trunc(abs / 100);
  const lipa = abs % 100;
  const head = formatHrAmount(kuna).replace(/,00$/, '');
  const body = `${head},${String(lipa).padStart(2, '0')}`;
  return cents < 0 ? `−${body}` : body;
}

export function trialAccount(code: string, rows: TrialRow[] = FINESTAR_BRUTO_BILANCA_2014): TrialRow {
  const found = rows.find((row) => row.kind === 'account' && row.code === code);
  if (!found) throw new Error(`Konto ${code} nije u bruto bilanci.`);
  return found;
}

const BRUTO_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2021_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2021-01-01',
    periodTo: '2021-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2021,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2020_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2020-01-01',
    periodTo: '2020-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2020,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2019_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2019-01-01',
    periodTo: '2019-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2019,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2018_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2018-01-01',
    periodTo: '2018-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2018,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2017_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2017-01-01',
    periodTo: '2017-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2017,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2016_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2016-01-01',
    periodTo: '2016-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2016,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_2015_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2015-01-01',
    periodTo: '2015-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2015,
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_BRUTO_BILANCA_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2014-01-01',
    periodTo: '2014-12-31',
    rows: FINESTAR_BRUTO_BILANCA_2014,
  },
];

/** Years that already have a generated trial balance, newest first. */
export function brutoBilancaYears(slug: string): number[] {
  return BRUTO_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug)
    .map((snapshot) => snapshot.year)
    .sort((left, right) => right - left);
}

export function brutoBilancaForTenantYear(slug: string, year: number): TrialView {
  const snapshot = BRUTO_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (snapshot) {
    return {
      status: 'snapshot',
      year: snapshot.year,
      currency: snapshot.currency,
      periodFrom: snapshot.periodFrom,
      periodTo: snapshot.periodTo,
      rows: snapshot.rows,
    };
  }
  return { status: 'empty', year };
}
