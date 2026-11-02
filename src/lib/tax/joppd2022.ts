/** Fine Star JOPPD filings for 2022. Forms, not receipt confirmations. */

const FINESTAR_SLUG = 'finestar';

export type JoppdReport = {
  slug: string;
  reportOn: string;
  mark: string;
  formId: string;
  composedAt: string;
  composedBy: string;
  taxpayerName: string;
  oib: string;
  street: string;
  place: string;
  personCount: number;
  rowCount: number;
  incomeTax: string;
  pension: string;
  health: string;
  recipient: string;
  recipientOib: string;
  residenceCode: string;
  workCode: string;
  recipientCode: string;
  receiptCode: string;
  workMark: string;
  periodFrom: string;
  periodTo: string;
  hours: number;
  idleHours: number;
  receipt: string;
  payable: string;
};

const COMPANY = {
  slug: FINESTAR_SLUG,
  taxpayerName: 'FINE STAR D.O.O.',
  oib: '36619131370',
  street: 'Bana Josipa Jelačića 58',
  place: 'Šibenik',
  composedBy: 'Zorana Lambaša',
  personCount: 1,
  rowCount: 1,
  incomeTax: '0.00',
  recipient: 'CAROLINA PLAZA RODIGUEZ',
  recipientOib: '07155680871',
  residenceCode: '05002',
  workCode: '04448',
  recipientCode: '0001',
  receiptCode: '0001',
};

function report(
  fields: Pick<
    JoppdReport,
    | 'reportOn'
    | 'mark'
    | 'formId'
    | 'composedAt'
    | 'pension'
    | 'health'
    | 'workMark'
    | 'periodFrom'
    | 'periodTo'
    | 'hours'
    | 'idleHours'
    | 'receipt'
    | 'payable'
  >,
): JoppdReport {
  return { ...COMPANY, ...fields };
}

const JOPPD_REPORTS: JoppdReport[] = [
  report({
    reportOn: '2022-12-30',
    mark: '22364',
    formId: '94b2ac53-1383-4e87-a994-be1aafda3dc7',
    composedAt: '2022-12-30T09:39:03+01:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-11-01',
    periodTo: '2022-11-30',
    hours: 176,
    idleHours: 16,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-11-30',
    mark: '22334',
    formId: '03e152b3-b99b-4793-b283-094bfe140579',
    composedAt: '2022-11-30T11:09:04+01:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-10-01',
    periodTo: '2022-10-31',
    hours: 168,
    idleHours: 0,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-10-31',
    mark: '22304',
    formId: '56fa3ae5-c5a9-4ce8-8c32-b02766fbe044',
    composedAt: '2022-10-31T10:40:06+01:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-09-01',
    periodTo: '2022-09-30',
    hours: 176,
    idleHours: 0,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-09-30',
    mark: '22273',
    formId: 'dbc414ff-cce0-4f3e-937d-d48d5cf27587',
    composedAt: '2022-09-30T08:06:16+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-08-01',
    periodTo: '2022-08-31',
    hours: 184,
    idleHours: 16,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-08-31',
    mark: '22243',
    formId: '47f1108c-d8d8-4e42-a8eb-6e55def255c5',
    composedAt: '2022-08-31T13:20:22+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-07-01',
    periodTo: '2022-07-31',
    hours: 168,
    idleHours: 0,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-07-29',
    mark: '22210',
    formId: '27edd4f0-aabf-45d9-b2e4-9d6156defaa7',
    composedAt: '2022-07-29T12:46:23+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-06-01',
    periodTo: '2022-06-30',
    hours: 176,
    idleHours: 16,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-06-30',
    mark: '22181',
    formId: 'cc15ecdc-97ce-4d51-b3c0-5e7e7f4d1545',
    composedAt: '2022-06-30T13:19:57+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-05-01',
    periodTo: '2022-05-31',
    hours: 176,
    idleHours: 8,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-05-31',
    mark: '22151',
    formId: '49803dbc-23f2-4fa2-98f8-0234a490fc56',
    composedAt: '2022-06-02T07:20:07+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-04-01',
    periodTo: '2022-04-30',
    hours: 168,
    idleHours: 8,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-04-29',
    mark: '22119',
    formId: '4c293431-77b9-404f-b69f-b03dd42a1a00',
    composedAt: '2022-05-02T08:27:26+02:00',
    pension: '1000.00',
    health: '825.00',
    workMark: '3',
    periodFrom: '2022-03-01',
    periodTo: '2022-03-31',
    hours: 184,
    idleHours: 0,
    receipt: '5000.00',
    payable: '5000.00',
  }),
  report({
    reportOn: '2022-03-31',
    mark: '22090',
    formId: '21a24f07-d574-4d00-9a38-3eff8dfca664',
    composedAt: '2022-04-01T14:20:44+02:00',
    pension: '500.00',
    health: '412.50',
    workMark: '1',
    periodFrom: '2022-02-15',
    periodTo: '2022-02-28',
    hours: 80,
    idleHours: 0,
    receipt: '2500.00',
    payable: '2500.00',
  }),
];

export function joppdHref(slug: string): string {
  return `/t/${slug}/porezi/joppd`;
}

export function joppdReports(slug: string): JoppdReport[] {
  return JOPPD_REPORTS.filter((item) => item.slug === slug);
}

export function joppdReport(slug: string, reportOn: string): JoppdReport | null {
  return joppdReports(slug).find((item) => item.reportOn === reportOn) ?? null;
}
