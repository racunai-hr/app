/** Filed Obrazac TZ v1.1 (annual tourist-board membership). Not TZ 2. */

import { FINESTAR_SLUG } from '@/lib/reports/podBil2014';

export { FINESTAR_SLUG };
export const FINESTAR_OBRAZAC_TZ_YEAR = 2014;
export const FINESTAR_OBRAZAC_TZ_2015_YEAR = 2015;
export const FINESTAR_OBRAZAC_TZ_2016_YEAR = 2016;
export const FINESTAR_OBRAZAC_TZ_2017_YEAR = 2017;
export const FINESTAR_OBRAZAC_TZ_2018_YEAR = 2018;
export const FINESTAR_OBRAZAC_TZ_2019_YEAR = 2019;
export const FINESTAR_OBRAZAC_TZ_2020_YEAR = 2020;
export const FINESTAR_OBRAZAC_TZ_2021_YEAR = 2021;
export const FINESTAR_OBRAZAC_TZ_2022_YEAR = 2022;

export type ObrazacTzLine = {
  ordinal: string;
  label: string;
  aop: string;
  value: string;
};

export type ObrazacTzStatus = {
  code: string;
  text: string;
  at: string;
};

export type ObrazacTzView =
  | {
      status: 'snapshot';
      year: number;
      currency: 'HRK';
      periodFrom: string;
      periodTo: string;
      taxpayerName: string;
      oib: string;
      officeName: string;
      formTitle?: string;
      formId: string;
      composedAt: string;
      signedAt: string;
      signedBy: string;
      lines: ObrazacTzLine[];
      receiptId: string;
      receivedAt: string;
      statuses: ObrazacTzStatus[];
    }
  | {
      status: 'notice';
      year: number;
      taxpayerName: string;
      oib: string;
      deliveredOn: string;
      mandatoryDelivery: false;
      text: string;
    }
  | { status: 'empty' };

/** Filed decimals, rearranged for display. Never multiplied. */
export function formatObrazacTzValue(value: string): string {
  const negative = value.startsWith('-');
  const body = negative ? value.slice(1) : value;
  const [whole, fraction] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const shown = fraction == null ? grouped : `${grouped},${fraction}`;
  return negative ? `−${shown}` : shown;
}

const FINESTAR_OBRAZAC_TZ_2014_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 11. Zakona)', aop: '01', value: '5.19' },
  { ordinal: 'II.', label: 'Stopa (članak 9. i 10. Zakona)', aop: '02', value: '0.0240' },
  { ordinal: 'III.', label: 'Obračunata svota (red. br. I. × red. br. II.)', aop: '03', value: '0.00' },
  { ordinal: 'IV.', label: 'Uplaćeni predujam', aop: '04', value: '0.00' },
  { ordinal: 'V.', label: 'Razlika za uplatu (red. br. III. − red. br. IV.)', aop: '05', value: '0.00' },
  { ordinal: 'VI.', label: 'Razlika za povrat (red. br. IV. − red. br. III.)', aop: '06', value: '0.00' },
  {
    ordinal: 'VII.',
    label: 'Mjesečni predujam za naredno razdoblje (red. br. III. / broj mjeseci)',
    aop: '07',
    value: '0.01',
  },
];

const FINESTAR_OBRAZAC_TZ_2015_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 11. Zakona)', aop: '01', value: '0.00' },
  { ordinal: 'II.', label: 'Stopa (članak 9. i 10. Zakona)', aop: '02', value: '0.0240' },
  { ordinal: 'III.', label: 'Obračunata svota (red. br. I. × red. br. II.)', aop: '03', value: '0.00' },
  { ordinal: 'IV.', label: 'Uplaćeni predujam', aop: '04', value: '0.00' },
  { ordinal: 'V.', label: 'Razlika za uplatu (red. br. III. − red. br. IV.)', aop: '05', value: '0.00' },
  { ordinal: 'VI.', label: 'Razlika za povrat (red. br. IV. − red. br. III.)', aop: '06', value: '0.00' },
  {
    ordinal: 'VII.',
    label: 'Mjesečni predujam za naredno razdoblje (red. br. III. / broj mjeseci)',
    aop: '07',
    value: '0.00',
  },
];

const FINESTAR_OBRAZAC_TZ_2016_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 11. Zakona)', aop: '01', value: '0.00' },
  { ordinal: 'II.', label: 'Stopa (članak 9. i 10. Zakona)', aop: '02', value: '0.0204' },
  { ordinal: 'III.', label: 'Obračunata svota (red. br. I. × red. br. II.)', aop: '03', value: '0.00' },
  { ordinal: 'IV.', label: 'Uplaćeni predujam', aop: '04', value: '0.00' },
  { ordinal: 'V.', label: 'Razlika za uplatu (red. br. III. − red. br. IV.)', aop: '05', value: '0.00' },
  { ordinal: 'VI.', label: 'Razlika za povrat (red. br. IV. − red. br. III.)', aop: '06', value: '0.00' },
  {
    ordinal: 'VII.',
    label: 'Mjesečni predujam za naredno razdoblje (red. br. III. / broj mjeseci)',
    aop: '07',
    value: '0.00',
  },
];

const FINESTAR_OBRAZAC_TZ_2019_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 7. Zakona)', aop: '01', value: '0.00' },
  { ordinal: 'II.', label: 'Stopa (članak 6. Zakona)', aop: '02', value: '0.01938' },
  { ordinal: 'III.', label: 'Obračunani iznos (r.br. 1. × r.br. 2.)', aop: '03', value: '0.00' },
  {
    ordinal: 'IV.',
    label: 'Umanjenje članarine na potpomognutim područjima I. razvojne skupine',
    aop: '04',
    value: '0.00',
  },
  {
    ordinal: 'V.',
    label: 'Umanjenje članarine na potpomognutim područjima II. razvojne skupine',
    aop: '05',
    value: '0.00',
  },
  {
    ordinal: 'VI.',
    label: 'Umanjenje članarine na potpomognutim područjima III. razvojne skupine',
    aop: '06',
    value: '0.00',
  },
  {
    ordinal: 'VII.',
    label: 'Umanjenje članarine na potpomognutim područjima IV. razvojne skupine',
    aop: '07',
    value: '0.00',
  },
  {
    ordinal: 'VIII.',
    label: 'Ukupno umanjenja na potpomognutim područjima (članak 8. stavak 4. Zakona)',
    aop: '08',
    value: '0.00',
  },
  { ordinal: 'IX.', label: 'Obračunani iznos nakon umanjenja (r.br. 3. − r.br. 8.)', aop: '09', value: '0.00' },
  { ordinal: 'X.', label: 'Uplaćeni predujam', aop: '10', value: '0.00' },
  { ordinal: 'XI.', label: 'Razlika za uplatu (r.br. 9. − r.br. 10.)', aop: '11', value: '0.00' },
  { ordinal: 'XII.', label: 'Razlika za povrat (r.br. 10. − r.br. 9.)', aop: '12', value: '0.00' },
  {
    ordinal: 'XIII.',
    label: 'Mjesečni predujam za naredno razdoblje (članak 10. stavak 1. Zakona)',
    aop: '13',
    value: '0.00',
  },
  {
    ordinal: 'XIV.',
    label: 'Jednokratna uplata (članak 10. stavak 3. Zakona)',
    aop: '14',
    value: 'NE',
  },
  {
    ordinal: 'XV.',
    label: 'Iznos jednokratne uplate (članak 10. stavak 3. Zakona)',
    aop: '15',
    value: '0.00',
  },
];

const FINESTAR_OBRAZAC_TZ_2020_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 7. Zakona)', aop: '01', value: '3275.44' },
  { ordinal: 'II.', label: 'Stopa (članak 6. Zakona)', aop: '02', value: '0.01938' },
  { ordinal: 'III.', label: 'Obračunani iznos (r.br. 1. × r.br. 2.)', aop: '03', value: '0.63' },
  {
    ordinal: 'IV.',
    label: 'Umanjenje članarine na potpomognutim područjima I. razvojne skupine',
    aop: '04',
    value: '0.00',
  },
  {
    ordinal: 'V.',
    label: 'Umanjenje članarine na potpomognutim područjima II. razvojne skupine',
    aop: '05',
    value: '0.00',
  },
  {
    ordinal: 'VI.',
    label: 'Umanjenje članarine na potpomognutim područjima III. razvojne skupine',
    aop: '06',
    value: '0.00',
  },
  {
    ordinal: 'VII.',
    label: 'Umanjenje članarine na potpomognutim područjima IV. razvojne skupine',
    aop: '07',
    value: '0.00',
  },
  {
    ordinal: 'VIII.',
    label: 'Ukupno umanjenja na potpomognutim područjima (članak 8. stavak 4. Zakona)',
    aop: '08',
    value: '0.00',
  },
  { ordinal: 'IX.', label: 'Obračunani iznos nakon umanjenja (r.br. 3. − r.br. 8.)', aop: '09', value: '0.63' },
  { ordinal: 'X.', label: 'Uplaćeni predujam', aop: '10', value: '0.00' },
  { ordinal: 'XI.', label: 'Razlika za uplatu (r.br. 9. − r.br. 10.)', aop: '11', value: '0.63' },
  { ordinal: 'XII.', label: 'Razlika za povrat (r.br. 10. − r.br. 9.)', aop: '12', value: '0.00' },
  {
    ordinal: 'XIII.',
    label: 'Mjesečni predujam za naredno razdoblje (članak 10. stavak 1. Zakona)',
    aop: '13',
    value: '0.00',
  },
  {
    ordinal: 'XIV.',
    label: 'Jednokratna uplata (članak 10. stavak 3. Zakona)',
    aop: '14',
    value: 'NE',
  },
  {
    ordinal: 'XV.',
    label: 'Iznos jednokratne uplate (članak 10. stavak 3. Zakona)',
    aop: '15',
    value: '0.00',
  },
];

const FINESTAR_OBRAZAC_TZ_2021_LINES: ObrazacTzLine[] = FINESTAR_OBRAZAC_TZ_2020_LINES.map((line) => ({
  ...line,
  value: line.aop === '02' ? '0.01705' : line.aop === '14' ? 'NE' : '0.00',
}));

const FINESTAR_OBRAZAC_TZ_2018_LINES: ObrazacTzLine[] = [
  { ordinal: 'I.', label: 'Osnovica (članak 11. Zakona)', aop: '01', value: '0.00' },
  { ordinal: 'II.', label: 'Stopa (članak 9. i 10. Zakona)', aop: '02', value: '0.01938' },
  { ordinal: 'III.', label: 'Obračunata svota (red. br. I. × red. br. II.)', aop: '03', value: '0.00' },
  { ordinal: 'IV.', label: 'Uplaćeni predujam', aop: '04', value: '0.00' },
  { ordinal: 'V.', label: 'Razlika za uplatu (red. br. III. − red. br. IV.)', aop: '05', value: '0.00' },
  { ordinal: 'VI.', label: 'Razlika za povrat (red. br. IV. − red. br. III.)', aop: '06', value: '0.00' },
  {
    ordinal: 'VII.',
    label: 'Mjesečni predujam za naredno razdoblje (red. br. III. / broj mjeseci)',
    aop: '07',
    value: '0.00',
  },
];

const OBRAZAC_TZ_NOTICES = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2017_YEAR,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    deliveredOn: '2018-02-26',
    mandatoryDelivery: false as const,
    text: 'Iznos uplaćenih predujmova koji se mogu priznati prilikom podnošenja TZ-obrasca za 2017. godinu iznosi 0,00 kn.',
  },
];

const OBRAZAC_TZ_SNAPSHOTS = [
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2022_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2022-01-01',
    periodTo: '2022-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: '3566',
    formTitle: 'Obrazac TZ 1',
    formId: 'a2a20de1-1a61-4d35-a0a2-dbb5c4f957fb',
    composedAt: '2023-03-30T07:57:20+02:00',
    signedAt: '2023-03-30T07:58:02+02:00',
    signedBy: 'Zorana Lambaša',
    lines: FINESTAR_OBRAZAC_TZ_2021_LINES,
    receiptId: 'dda1db7b-d2fb-47c6-b826-a42f2491b4e7',
    receivedAt: '2023-03-30T07:58:24+02:00',
    statuses: [
      {
        code: '1.1110.2.0.3.705',
        text: 'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2023-03-30T07:58:24+02:00',
      },
      {
        code: '1.1110.1.0.1.10',
        text: 'Poslani TZ 1 obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2023-03-30T07:58:24+02:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2023-03-30T07:58:24+02:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2021_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2021-01-01',
    periodTo: '2021-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: '3566',
    formTitle: 'Obrazac TZ 1',
    formId: '281c36af-bc12-4763-acc6-93d6d62da5df',
    composedAt: '2022-03-25T13:06:31+01:00',
    signedAt: '2022-03-25T13:10:47+01:00',
    signedBy: 'Zorana Lambaša',
    lines: FINESTAR_OBRAZAC_TZ_2021_LINES,
    receiptId: '8c71a4a6-b562-4815-bf59-76223379c4f8',
    receivedAt: '2022-03-25T13:11:09+01:00',
    statuses: [
      {
        code: '1.1110.2.0.3.705',
        text: 'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2022-03-25T13:11:09+01:00',
      },
      {
        code: '1.1110.1.0.1.10',
        text: 'Poslani TZ 1 obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2022-03-25T13:11:09+01:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2022-03-25T13:11:09+01:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2020_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2020-01-01',
    periodTo: '2020-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Susedgrad',
    formTitle: 'Obrazac TZ 1',
    formId: 'eac1011a-c229-4d6a-947a-e9f5969d30f8',
    composedAt: '2021-04-09T15:41:36+02:00',
    signedAt: '2021-05-24T13:38:07+02:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2020_LINES,
    receiptId: 'a6b8a15c-d4e9-4301-8a93-ce79ab488e08',
    receivedAt: '2021-05-24T13:38:28+02:00',
    statuses: [
      {
        code: '1.1110.2.0.3.705',
        text: 'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2021-05-24T13:38:28+02:00',
      },
      {
        code: '1.1110.1.0.1.10',
        text: 'Poslani TZ 1 obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2021-05-24T13:38:28+02:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2021-05-24T13:38:28+02:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2019_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2019-01-01',
    periodTo: '2019-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Šibenik',
    formTitle: 'Obrazac TZ 1',
    formId: 'fdfa36b3-2b1b-4987-9069-d02a7de57496',
    composedAt: '2020-03-24T15:58:35+01:00',
    signedAt: '2020-05-06T09:21:10+02:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2019_LINES,
    receiptId: '57a17a22-7092-4b1a-9c13-0be4ed16e033',
    receivedAt: '2020-05-06T09:21:16+02:00',
    statuses: [
      {
        code: '1.1110.2.0.3.705',
        text: 'Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2020-05-06T09:21:16+02:00',
      },
      {
        code: '1.1110.1.0.1.10',
        text: 'Poslani TZ-1 obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2020-05-06T09:21:16+02:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2020-05-06T09:21:16+02:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2018_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2018-01-01',
    periodTo: '2018-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Zagreb – Susedgrad',
    formId: '3cbb5d8b-3fc8-4100-86c0-f91cc8e5c967',
    composedAt: '2019-03-25T08:04:54+01:00',
    signedAt: '2019-03-25T08:30:49+01:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2018_LINES,
    receiptId: '3c94b4c1-b6b8-49af-9bff-9f795783d71e',
    receivedAt: '2019-03-25T08:30:55+01:00',
    statuses: [
      {
        code: '1.1020.1.0.1.10',
        text: 'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2019-03-25T08:30:55+01:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2019-03-25T08:30:55+01:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2016_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2016-01-01',
    periodTo: '2016-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Zagreb – Susedgrad',
    formId: '5f1292b4-e8ef-47e4-9f40-e9f2d2337858',
    composedAt: '2017-03-22T14:12:44+01:00',
    signedAt: '2017-03-22T13:34:43+01:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2016_LINES,
    receiptId: '7f869746-59a5-4c7e-8570-bd5816ea01eb',
    receivedAt: '2017-03-22T14:34:49+01:00',
    statuses: [
      {
        code: '1.1020.2.0.3.705',
        text: 'Iznos pod rednim brojem 7. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2017-03-22T14:34:49+01:00',
      },
      {
        code: '1.1020.1.0.1.10',
        text: 'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2017-03-22T14:34:49+01:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2017-03-22T14:34:49+01:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_2015_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2015-01-01',
    periodTo: '2015-12-31',
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Zagreb – Susedgrad',
    formId: '52c5bc8b-94a6-4d00-9923-dc51950ebf47',
    composedAt: '2016-04-12T13:38:19+02:00',
    signedAt: '2016-04-12T11:38:50+02:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2015_LINES,
    receiptId: 'f6187da6-3238-41d2-a088-831978562066',
    receivedAt: '2016-04-12T13:38:59+02:00',
    statuses: [
      {
        code: '1.1020.2.0.3.705',
        text: 'Iznos pod rednim brojem 7. može biti nula samo ako je 31.12. prestanak obveze.',
        at: '2016-04-12T13:38:59+02:00',
      },
      {
        code: '1.1020.1.0.1.10',
        text: 'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2016-04-12T13:38:59+02:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2016-04-12T13:38:59+02:00',
      },
    ],
  },
  {
    slug: FINESTAR_SLUG,
    year: FINESTAR_OBRAZAC_TZ_YEAR,
    currency: 'HRK' as const,
    periodFrom: '2014-01-01' as const,
    periodTo: '2014-12-31' as const,
    taxpayerName: 'FINE STAR d.o.o.',
    oib: '36619131370',
    officeName: 'Zagreb – Susedgrad',
    formId: '2fd85cd2-5d7c-4c4f-9ade-65e3cae78bb4',
    composedAt: '2015-04-25T15:02:32+02:00',
    signedAt: '2015-04-25T15:04:42+02:00',
    signedBy: 'Bernard Ulični',
    lines: FINESTAR_OBRAZAC_TZ_2014_LINES,
    receiptId: '319262dc-aff4-425a-aaa2-c04afcbaa9ef',
    receivedAt: '2015-04-25T15:06:25+02:00',
    statuses: [
      {
        code: '1.1020.1.0.1.10',
        text: 'Poslani TZ obrazac uspješno je zaprimljen te čeka obradu.',
        at: '2015-04-25T15:06:25+02:00',
      },
      {
        code: '2.1024.3.0.1.100',
        text: 'Obrazac je u obradi.',
        at: '2015-04-25T15:06:25+02:00',
      },
    ],
  },
];

export function obrazacTzHref(slug: string): string {
  return `/t/${slug}/porezi/tz`;
}

/** Years that already have a filed Obrazac TZ or a tax-office notice, newest first. */
export function obrazacTzYears(slug: string): number[] {
  const filed = OBRAZAC_TZ_SNAPSHOTS.filter((snapshot) => snapshot.slug === slug).map(
    (snapshot) => snapshot.year,
  );
  const notices = OBRAZAC_TZ_NOTICES.filter((notice) => notice.slug === slug).map((notice) => notice.year);
  return [...new Set([...filed, ...notices])].sort((left, right) => right - left);
}

export function obrazacTzForTenantYear(slug: string, year: number): ObrazacTzView {
  const notice = OBRAZAC_TZ_NOTICES.find((item) => item.slug === slug && item.year === year);
  if (notice) {
    return {
      status: 'notice',
      year: notice.year,
      taxpayerName: notice.taxpayerName,
      oib: notice.oib,
      deliveredOn: notice.deliveredOn,
      mandatoryDelivery: notice.mandatoryDelivery,
      text: notice.text,
    };
  }
  const snapshot = OBRAZAC_TZ_SNAPSHOTS.find((item) => item.slug === slug && item.year === year);
  if (!snapshot) return { status: 'empty' };
  return { status: 'snapshot', ...snapshot };
}

export function obrazacTzLine(aop: string, slug = FINESTAR_SLUG, year = FINESTAR_OBRAZAC_TZ_YEAR): string {
  const view = obrazacTzForTenantYear(slug, year);
  if (view.status !== 'snapshot') throw new Error('Nema obrasca TZ.');
  const line = view.lines.find((item) => item.aop === aop);
  if (!line) throw new Error(`AOP ${aop} nije u obrascu TZ.`);
  return line.value;
}
