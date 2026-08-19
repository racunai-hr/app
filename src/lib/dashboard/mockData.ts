export const MOCK_DATA_NOTICE = 'Mock podaci — nisu iz poslovnih knjiga.';

export const dashboardMock = {
  periodLabel: 'Kolovoz 2026.',
  asOf: '2026-08-19',
  currency: 'EUR',
  financial: {
    bankBalance: 47820.15,
    openReceivables: 28450,
    overdueReceivables: 6120,
    openPayables: 12340.5,
    estimatedVat: 4875.2,
  },
  books: {
    score: 78,
    scoreLabel: 'Uredno, uz upozorenja',
    postingPosted: 142,
    postingDraft: 8,
    attentionCount: 11,
    bankUnmatched: 3,
    closeWarnings: [
      'Dva ulazna računa bez kontiranja u razdoblju.',
      'Usklađenje OTP tekućeg računa nije zatvoreno.',
    ],
  },
  cashFlow: {
    months: [
      { label: 'Ožu', inflow: 42150, outflow: 31240 },
      { label: 'Tra', inflow: 38620, outflow: 33410 },
      { label: 'Svi', inflow: 45180, outflow: 29120 },
      { label: 'Lip', inflow: 39840, outflow: 36050 },
      { label: 'Srp', inflow: 47210, outflow: 32580 },
      { label: 'Kol', inflow: 41090, outflow: 35120 },
    ],
  },
  tasks: [
    {
      id: 'bank',
      title: 'Neusuglašene bankovne transakcije',
      detail: '3 stavke na OTP računu čekaju sparivanje.',
    },
    {
      id: 'inbox',
      title: 'Neproknjiženi ulazni računi',
      detail: '5 dokumenata u pretincu, bez temeljnice.',
    },
    {
      id: 'vat',
      title: 'PDV spreman za provjeru',
      detail: 'Obrazac za 07/2026 može se pregledati prije predaje.',
    },
    {
      id: 'late',
      title: 'Kupci koji kasne s plaćanjem',
      detail: '4 otvorene stavke starije od 30 dana.',
    },
  ],
  aging: {
    notDue: 22330,
    days1to30: 3800,
    days31to60: 1520,
    daysOver60: 800,
  },
  taxCalendar: [
    {
      form: 'PDV',
      due: '20. 9. 2026.',
      status: 'U pripremi',
      amount: 4875.2,
    },
    {
      form: 'JOPPD',
      due: '15. 9. 2026.',
      status: 'Spreman za provjeru',
      amount: 0,
    },
    {
      form: 'PDV-S',
      due: '20. 9. 2026.',
      status: 'Nije započeto',
      amount: 0,
    },
    {
      form: 'ZP',
      due: '20. 9. 2026.',
      status: 'Nije potrebno',
      amount: 0,
    },
  ],
  recentDocuments: [
    {
      number: 'R-2026-184',
      partner: 'Adria Trade d.o.o.',
      date: '12. 8. 2026.',
      amount: 3240,
      status: 'Proknjižen',
    },
    {
      number: 'U-2026-091',
      partner: 'Hrvatski Telekom d.d.',
      date: '11. 8. 2026.',
      amount: 1128.5,
      status: 'Neproknjižen',
    },
    {
      number: 'R-2026-183',
      partner: 'Maritim Šibenik d.o.o.',
      date: '8. 8. 2026.',
      amount: 18600,
      status: 'Djelomično plaćen',
    },
    {
      number: 'U-2026-088',
      partner: 'HEP Opskrba d.o.o.',
      date: '5. 8. 2026.',
      amount: 842.3,
      status: 'Plaćen',
    },
    {
      number: 'R-2026-179',
      partner: 'Nautika Kornati j.d.o.o.',
      date: '1. 8. 2026.',
      amount: 2150,
      status: 'Dospio',
    },
  ],
  quickActions: [
    { id: 'invoice', label: 'Novi izlazni račun' },
    { id: 'expense', label: 'Učitavanje ulaznog računa' },
    { id: 'journal', label: 'Nova ručna temeljnica' },
    { id: 'partner', label: 'Novi partner' },
  ],
  notifications: [
    { id: 'n1', title: 'Tri bankovne stavke čekaju sparivanje' },
    { id: 'n2', title: 'PDV za srpanj spreman za provjeru' },
    { id: 'n3', title: 'Dva kupca kasne više od 30 dana' },
  ],
} as const;

export function agingTotal(aging: typeof dashboardMock.aging): number {
  return aging.notDue + aging.days1to30 + aging.days31to60 + aging.daysOver60;
}

export function overdueShare(aging: typeof dashboardMock.aging): number {
  const total = agingTotal(aging);
  if (!total) return 0;
  return ((aging.days1to30 + aging.days31to60 + aging.daysOver60) / total) * 100;
}

export function cashFlowNet(months: typeof dashboardMock.cashFlow.months): number {
  return months.reduce((sum, row) => sum + row.inflow - row.outflow, 0);
}
