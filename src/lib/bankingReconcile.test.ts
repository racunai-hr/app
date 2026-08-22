import { describe, expect, it } from 'vitest';

import { sampleDocumentDetail } from '@/test/documentFixtures';

import {
  bankingReconcileHref,
  documentBankCloseHref,
  parseSubledgerItemParam,
  reconcileCandidateDocumentLink,
  shouldShowBankCloseCta,
  shouldShowSubledgerItemBankClose,
  subledgerItemBankCloseHref,
  subledgerItemDocumentLink,
  subledgerItemIdForBanking,
  subledgerStateForBankClose,
} from './bankingReconcile';

describe('bankingReconcile', () => {
  it('detects open and partial subledger states from block or context', () => {
    const open = sampleDocumentDetail({
      subledger: {
        state: { value: 'open', reason: null, source: 'subledger_item' },
        open_amount: { value: '120.00', reason: null, source: 'subledger_item' },
        original_amount: { value: '120.00', reason: null, source: 'subledger_item' },
        aging_bucket: { value: 'current', reason: null, source: 'subledger_item' },
        days: { value: 0, reason: null, source: 'subledger_item' },
      },
    });
    expect(subledgerStateForBankClose(open)).toBe('open');
    expect(shouldShowBankCloseCta(open)).toBe(true);

    const partial = sampleDocumentDetail({
      subledger_context: {
        item_id: 42,
        state: 'partial',
        original_amount: '100.00',
        allocated_amount: '40.00',
        open_amount: '60.00',
        due_date: '2026-03-31',
        allocations: [],
      },
      subledger: {
        state: { value: 'closed', reason: null, source: 'subledger_item' },
        open_amount: { value: '0.00', reason: null, source: 'subledger_item' },
        original_amount: { value: '100.00', reason: null, source: 'subledger_item' },
        aging_bucket: { value: null, reason: 'not_applicable', source: null },
        days: { value: null, reason: 'not_applicable', source: null },
      },
    });
    expect(subledgerStateForBankClose(partial)).toBe('partial');
    expect(shouldShowBankCloseCta(partial)).toBe(true);
  });

  it('hides CTA for closed, cancelled, and deposit documents', () => {
    const closed = sampleDocumentDetail({
      subledger: {
        state: { value: 'closed', reason: null, source: 'subledger_item' },
        open_amount: { value: '0.00', reason: null, source: 'subledger_item' },
        original_amount: { value: '120.00', reason: null, source: 'subledger_item' },
        aging_bucket: { value: null, reason: 'not_applicable', source: null },
        days: { value: null, reason: 'not_applicable', source: null },
      },
    });
    expect(shouldShowBankCloseCta(closed)).toBe(false);

    const deposit = sampleDocumentDetail({ direction: 'deposit', kind: 'deposit' });
    expect(shouldShowBankCloseCta(deposit)).toBe(false);
  });

  it('builds reconcile href with optional subledger_item deep link', () => {
    expect(bankingReconcileHref('finestar')).toBe(
      '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched',
    );
    expect(bankingReconcileHref('finestar', 42)).toBe(
      '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=42',
    );
    expect(subledgerItemIdForBanking({ subledger_context: { item_id: 7 } } as never)).toBe(7);
    expect(
      documentBankCloseHref('finestar', {
        subledger_context: {
          item_id: 7,
          state: 'open',
          original_amount: '10.00',
          allocated_amount: '0.00',
          open_amount: '10.00',
          due_date: null,
          allocations: [],
        },
      } as never),
    ).toBe('/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=7');
  });

  it('builds post-reconcile document links from candidate source', () => {
    expect(
      reconcileCandidateDocumentLink('finestar', {
        source_type: 'expense',
        source_id: 30,
        source_label: '26210-H120-5154',
      }),
    ).toEqual({
      href: '/t/finestar/dokumenti/ulazni/30',
      label: '26210-H120-5154',
    });
    expect(
      reconcileCandidateDocumentLink('finestar', {
        source_type: 'invoice',
        source_id: 4,
        source_label: '2026-0001',
      }),
    ).toEqual({
      href: '/t/finestar/dokumenti/izlazni/4',
      label: '2026-0001',
    });
    expect(
      reconcileCandidateDocumentLink('finestar', {
        source_type: 'deposit',
        source_id: 9,
        source_label: 'Kaucija',
      }),
    ).toBeNull();
  });

  it('parses subledger_item query param', () => {
    expect(parseSubledgerItemParam(new URLSearchParams('subledger_item=42'))).toBe(42);
    expect(parseSubledgerItemParam(new URLSearchParams('subledger_item=0'))).toBeNull();
    expect(parseSubledgerItemParam(new URLSearchParams())).toBeNull();
  });

  it('exposes partner subledger row helpers', () => {
    expect(shouldShowSubledgerItemBankClose('open')).toBe(true);
    expect(shouldShowSubledgerItemBankClose('partial')).toBe(true);
    expect(shouldShowSubledgerItemBankClose('closed')).toBe(false);
    expect(subledgerItemBankCloseHref('finestar', 42)).toBe(
      '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=42',
    );
    expect(
      subledgerItemDocumentLink('finestar', {
        source_type: 'invoice',
        source_id: 4,
        source_label: '2026-0001',
      }),
    ).toEqual({
      href: '/t/finestar/dokumenti/izlazni/4',
      label: '2026-0001',
    });
  });
});
