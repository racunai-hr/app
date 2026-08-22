import { describe, expect, it } from 'vitest';

import { sampleDocumentDetail } from '@/test/documentFixtures';

import {
  bankingReconcileHref,
  documentBankCloseHref,
  shouldShowBankCloseCta,
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
});
