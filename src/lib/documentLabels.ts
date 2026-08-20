import type { ProvenanceReason } from './provenance';

export const DIRECTION_LABELS = {
  outgoing: 'Izlazni',
  incoming: 'Ulazni',
  deposit: 'Kaucija',
} as const;

export const SYSTEM_VIEWS = [
  { value: '', label: 'Svi dokumenti' },
  { value: 'attention', label: 'Zahtijeva pažnju' },
  { value: 'unpaid_outgoing', label: 'Neplaćeni izlazni' },
  { value: 'overdue_outgoing', label: 'Dospjeli izlazni' },
  { value: 'incoming_ready_to_pay', label: 'Spremni za plaćanje' },
  { value: 'partially_paid', label: 'Djelomično plaćeni' },
  { value: 'bank_unmatched', label: 'Banka neusklađena' },
  { value: 'unposted', label: 'Neknjiženi' },
  { value: 'vat_pending', label: 'PDV na čekanju' },
  { value: 'vat_mismatch', label: 'PDV neusklađenost' },
  { value: 'eracun_rejected', label: 'eRačun odbijen' },
  { value: 'possible_duplicates', label: 'Mogući duplikati' },
] as const;

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Nacrt',
  sent: 'Poslan',
  paid: 'Plaćen',
  overdue: 'Dospio',
  cancelled: 'Otkazan',
  approved: 'Odobren',
  rejected: 'Odbijen',
  open: 'Otvoreno',
  returned: 'Vraćeno',
  reversed: 'Stornirano',
};

export const OPERATIONAL_STATUS_LABELS: Record<string, string> = {
  cancelled: 'Otkazan',
  eracun_rejected: 'eRačun odbijen',
  paid: 'Plaćen',
  partially_paid: 'Djelomično plaćen',
  overdue: 'Dospio',
  accepted: 'Prihvaćen',
  delivered: 'Dostavljen',
  sent: 'Poslan',
  issued: 'Izdan',
  draft: 'Nacrt',
  disputed: 'Sporan',
  rejected: 'Odbijen',
  ready_to_pay: 'Spreman za plaćanje',
  approved: 'Odobren',
  pending_approval: 'Čeka odobrenje',
  received: 'Zaprimljen',
  open: 'Otvoreno',
  closed: 'Zatvoreno',
  reversed: 'Stornirano',
};

export const SUBLEDGER_LABELS: Record<string, string> = {
  open: 'Otvoren',
  partial: 'Djelomičan',
  closed: 'Zatvoren',
  cancelled: 'Otkazan',
};

export const VAT_LIFECYCLE_LABELS: Record<string, string> = {
  not_tax_active: 'Nije porezno aktivan',
  awaiting_ledger: 'Čeka evidenciju',
  in_ledger: 'U knjizi',
  mismatch: 'Neusklađenost',
};

export const CONTROL_LABELS: Record<string, string> = {
  missing_partner_or_oib: 'Nedostaje partner ili porezni ID',
  missing_due_date: 'Nedostaje datum dospijeća',
  missing_pdf_xml: 'Nedostaje PDF/XML',
  possible_duplicate: 'Mogući duplikat',
  line_total_mismatch: 'Iznos stavki ≠ header',
  vat_header_mismatch: 'PDV header ≠ stavke',
  vat_ledger_missing: 'Nema PDV evidencije',
  vat_period_mismatch: 'PDV razdoblje ne odgovara',
  vat_amount_mismatch: 'PDV iznos neusklađen',
  issued_unposted: 'Izdan, nije knjižen',
  journal_unbalanced: 'Temeljnica nije uravnotežena',
  overdue_unpaid: 'Dospio i nije plaćen',
  paid_status_subledger_missing: 'Plaćen bez saldakonta',
  paid_status_subledger_open: 'Plaćen, saldakonto otvoren',
  settlement_evidence_missing: 'Nema dokaza zatvaranja',
  iban_mismatch: 'IBAN nije u šifrarniku',
  eracun_rejected: 'eRačun odbijen',
  outbox_incomplete: 'Outbox nije završio',
};

export const NOTICE_LABELS: Record<string, string> = {
  updated_after_posting: 'Ažurirano nakon knjiženja',
};

export function statusLabel(value: string | number | boolean | string[] | null): string {
  if (value == null) return '';
  const raw = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    OPERATIONAL_STATUS_LABELS[raw] ||
    DOCUMENT_STATUS_LABELS[raw] ||
    SUBLEDGER_LABELS[raw] ||
    VAT_LIFECYCLE_LABELS[raw] ||
    raw
  );
}

export function controlLabel(code: string): string {
  return CONTROL_LABELS[code] || code;
}

export function noticeLabel(code: string): string {
  return NOTICE_LABELS[code] || code;
}

export function isSystemView(value: string): boolean {
  return SYSTEM_VIEWS.some((view) => view.value === value);
}

export function reasonIsHonest(reason: ProvenanceReason | null): boolean {
  return reason == null || reason === 'not_recorded' || reason === 'not_provable' || reason === 'not_applicable';
}
