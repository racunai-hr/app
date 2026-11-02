/** Fine Star U-RA filings for 2022. Later December receipt replaces the empty one. */

const FINESTAR_SLUG = 'finestar';

export type UraInvoice = {
  number: string;
  issuedOn: string;
  supplier: string;
  address: string;
  oib: string;
  base: string;
  gross: string;
  vat: string;
};

export type UraMonth = {
  slug: string;
  month: string;
  label: string;
  periodFrom: string;
  periodTo: string;
  formId: string;
  composedAt: string;
  signedAt: string;
  signedBy: string;
  receiptId: string;
  receivedAt: string;
  status: string;
  invoices: UraInvoice[];
  base: string;
  gross: string;
  vat: string;
};

function month(
  fields: Omit<UraMonth, 'slug' | 'signedBy' | 'status'> & { signedBy?: string; status?: string },
): UraMonth {
  return {
    slug: FINESTAR_SLUG,
    signedBy: 'Zorana Lambaša',
    status: 'Obrazac je zaprimljen i čeka provjeru.',
    ...fields,
  };
}

const URA_MONTHS: UraMonth[] = [
  month({
    month: '2022-12',
    label: 'Prosinac 2022.',
    periodFrom: '2022-12-01',
    periodTo: '2022-12-31',
    formId: '94b8c96c-e665-45a6-9c67-70e96555ef74',
    composedAt: '2023-03-28T14:50:15+02:00',
    signedAt: '2023-03-28T14:55:04+02:00',
    receiptId: 'cf53d8fe-597a-469b-bac0-ba543c275e1e',
    receivedAt: '2023-03-28T14:55:31+02:00',
    base: '11600.00',
    gross: '14500.00',
    vat: '2900.00',
    invoices: [
      {
        number: '306-1-2022',
        issuedOn: '2022-02-28',
        supplier: 'SUPERIOR PORTO',
        address: '',
        oib: '84209529242',
        base: '1200.00',
        gross: '1500.00',
        vat: '300.00',
      },
      {
        number: '1549/KJ/99',
        issuedOn: '2022-03-31',
        supplier: 'LESNINA H.D.O.O.',
        address: 'Slavonska avenija 106 ZAGREB',
        oib: '36998794856',
        base: '10400.00',
        gross: '13000.00',
        vat: '2600.00',
      },
    ],
  }),
  month({
    month: '2022-11',
    label: 'Studeni 2022.',
    periodFrom: '2022-11-01',
    periodTo: '2022-11-30',
    formId: '00e88f7d-2575-416c-9f76-9fcd2add3c6c',
    composedAt: '2022-12-19T07:48:10+01:00',
    signedAt: '2022-12-19T08:05:19+01:00',
    receiptId: 'c41a0b3e-6f95-4580-91b0-396624007c84',
    receivedAt: '2022-12-19T08:05:42+01:00',
    base: '0.00',
    gross: '0.00',
    vat: '0.00',
    invoices: [],
  }),
  month({
    month: '2022-09',
    label: 'Rujan 2022.',
    periodFrom: '2022-09-01',
    periodTo: '2022-09-30',
    formId: '791cbf11-12e6-4364-b7de-31d130471494',
    composedAt: '2022-10-17T11:16:14+02:00',
    signedAt: '2022-10-18T07:44:55+02:00',
    receiptId: 'e80df9bf-450f-406d-9d95-a57f57b5f5cb',
    receivedAt: '2022-10-18T07:45:17+02:00',
    base: '0.00',
    gross: '0.00',
    vat: '0.00',
    invoices: [],
  }),
  month({
    month: '2022-08',
    label: 'Kolovoz 2022.',
    periodFrom: '2022-08-01',
    periodTo: '2022-08-31',
    formId: '4f2f89a9-4451-403a-b147-232549047252',
    composedAt: '2022-09-19T14:40:43+02:00',
    signedAt: '2022-09-20T12:09:59+02:00',
    receiptId: '16e420c5-1af4-4a9c-b0f0-228558708988',
    receivedAt: '2022-09-20T12:10:21+02:00',
    base: '0.00',
    gross: '0.00',
    vat: '0.00',
    invoices: [],
  }),
  month({
    month: '2022-07',
    label: 'Srpanj 2022.',
    periodFrom: '2022-07-01',
    periodTo: '2022-07-31',
    formId: 'cb4f47eb-bb41-441a-b573-becd27d86130',
    composedAt: '2022-08-18T08:12:07+02:00',
    signedAt: '2022-08-18T08:48:18+02:00',
    receiptId: '6d98bc7d-907e-4dd0-9163-3f3e1d6d5e35',
    receivedAt: '2022-08-18T08:48:45+02:00',
    base: '20044.00',
    gross: '25055.00',
    vat: '5011.00',
    invoices: [
      {
        number: '24956/p1/3',
        issuedOn: '2022-06-30',
        supplier: 'VODICE d.o.o.',
        address: 'Put Gaćeleza br. 1 Vodice',
        oib: '15449982602',
        base: '1428.00',
        gross: '1785.00',
        vat: '357.00',
      },
      {
        number: '655-1/0113-1',
        issuedOn: '2022-07-28',
        supplier: 'GAMBI, d.o.o.',
        address: 'Novo naselje 28 Bilice',
        oib: '22418618872',
        base: '18136.00',
        gross: '22670.00',
        vat: '4534.00',
      },
      {
        number: '10-1/0413-1',
        issuedOn: '2022-06-30',
        supplier: 'GAMBI, d.o.o.',
        address: 'Novo naselje 28 Bilice',
        oib: '22418618872',
        base: '480.00',
        gross: '600.00',
        vat: '120.00',
      },
    ],
  }),
  month({
    month: '2022-06',
    label: 'Lipanj 2022.',
    periodFrom: '2022-06-01',
    periodTo: '2022-06-30',
    formId: 'ccfead26-971a-4f13-b771-76fb5e5ca8c5',
    composedAt: '2022-07-20T09:22:36+02:00',
    signedAt: '2022-07-20T10:39:55+02:00',
    receiptId: '8187bfdb-b16b-4b9a-9c74-aab95b5283b2',
    receivedAt: '2022-07-20T10:40:03+02:00',
    base: '28825.60',
    gross: '36032.00',
    vat: '7206.40',
    invoices: [
      {
        number: '22-APAS2-380',
        issuedOn: '2022-05-03',
        supplier: 'BRANITELJSKA ZADRUGA VELIKA KORITA',
        address: 'VOJNIĆ SINJSKI 31/A TRILJ',
        oib: '16138719522',
        base: '14425.60',
        gross: '18032.00',
        vat: '3606.40',
      },
      {
        number: '4-1/0413-1',
        issuedOn: '2022-05-31',
        supplier: 'GAMBI, d.o.o.',
        address: 'Novo naselje 28 Bilice',
        oib: '22418618872',
        base: '14400.00',
        gross: '18000.00',
        vat: '3600.00',
      },
    ],
  }),
  month({
    month: '2022-05',
    label: 'Svibanj 2022.',
    periodFrom: '2022-05-01',
    periodTo: '2022-05-31',
    formId: '1522ce60-a598-4b3c-a877-cad11941e84f',
    composedAt: '2022-06-20T13:47:17+02:00',
    signedAt: '2022-06-20T14:04:31+02:00',
    receiptId: 'e650f13d-edf9-401f-8dd4-9564064eea63',
    receivedAt: '2022-06-20T14:05:00+02:00',
    base: '19046.83',
    gross: '23808.54',
    vat: '4761.71',
    invoices: [
      {
        number: '438/1/1',
        issuedOn: '2022-03-15',
        supplier: 'LAKOL ŠIBENIK d.o.o.',
        address: 'Petra Preradovića 7 Šibenik',
        oib: '83651629490',
        base: '800.00',
        gross: '1000.00',
        vat: '200.00',
      },
      {
        number: '80/PM1/4',
        issuedOn: '2022-04-30',
        supplier: 'T.O. BRAKUS',
        address: 'S.RADIĆA 76 DRNIŠ',
        oib: '68198737766',
        base: '18246.83',
        gross: '22808.54',
        vat: '4561.71',
      },
    ],
  }),
  month({
    month: '2022-04',
    label: 'Travanj 2022.',
    periodFrom: '2022-04-01',
    periodTo: '2022-04-30',
    formId: 'ce86d40a-1285-4f15-93dd-55f8e32ace8b',
    composedAt: '2022-05-20T13:41:18+02:00',
    signedAt: '2022-05-20T13:44:12+02:00',
    receiptId: '215b1b23-ddf2-46a2-84a9-7eb2c78e3685',
    receivedAt: '2022-05-20T13:44:19+02:00',
    base: '0.00',
    gross: '0.00',
    vat: '0.00',
    invoices: [],
  }),
];

export function uraHref(slug: string): string {
  return `/t/${slug}/porezi/u-ra`;
}

export function uraMonths(slug: string): UraMonth[] {
  return URA_MONTHS.filter((item) => item.slug === slug);
}

export function uraMonth(slug: string, monthId: string): UraMonth | null {
  return uraMonths(slug).find((item) => item.month === monthId) ?? null;
}
