import type { DocumentDetail, DocumentSummary } from '@/lib/documents';
import type { Provenance } from '@/lib/provenance';

function field<T>(value: T | null, reason: Provenance['reason'] = null): Provenance<T> {
  return { value, reason, source: value == null ? null : 'test' };
}

export function sampleDocument(overrides: Partial<DocumentSummary> = {}): DocumentSummary {
  return {
    id: 4,
    direction: 'outgoing',
    internal_number: 'R-100',
    source_number: 'SRC-1',
    partner_name: 'Partner d.o.o.',
    partner_oib: '12345678901',
    document_date: '2026-03-01',
    due_date: '2026-03-31',
    document_status: field('sent'),
    operational_status: field(null, 'not_provable'),
    posting: { state: field('posted') },
    subledger: { state: field('open'), open_amount: field('120.00') },
    vat: { lifecycle: field('in_ledger'), period: field('2026-03'), disclaimer: null },
    eracun: { as4_status: field(null, 'not_recorded'), source: field('manual') },
    controls: ['paid_status_subledger_missing'],
    notices: ['updated_after_posting'],
    amounts: {
      currency: 'EUR',
      net: '100.00',
      vat: '25.00',
      gross: '125.00',
      fx_rate: field(null, 'not_applicable'),
    },
    ...overrides,
  };
}

export function sampleDocumentDetail(overrides: Partial<DocumentDetail> = {}): DocumentDetail {
  return {
    ...sampleDocument(),
    partner_id: 1,
    description: 'Usluga',
    notes: '',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
    created_by: 'viewer',
    items: [],
    service_date: null,
    ubl_available: true,
    pdf_available: false,
    as_of: '2026-08-20T10:00:00Z',
    ...overrides,
  };
}
