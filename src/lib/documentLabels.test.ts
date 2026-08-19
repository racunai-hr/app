import { describe, expect, it } from 'vitest';

import {
  controlLabel,
  isSystemView,
  statusLabel,
  SYSTEM_VIEWS,
} from './documentLabels';

describe('documentLabels', () => {
  it('exposes the locked system views', () => {
    expect(SYSTEM_VIEWS.map((view) => view.value)).toEqual([
      '',
      'attention',
      'unpaid_outgoing',
      'overdue_outgoing',
      'incoming_ready_to_pay',
      'partially_paid',
      'bank_unmatched',
      'unposted',
      'vat_pending',
      'vat_mismatch',
      'eracun_rejected',
      'possible_duplicates',
    ]);
    expect(isSystemView('attention')).toBe(true);
    expect(isSystemView('made_up')).toBe(false);
  });

  it('labels known statuses and controls in Croatian', () => {
    expect(statusLabel('paid')).toBe('Plaćen');
    expect(statusLabel('not_posted')).toBe('not_posted');
    expect(controlLabel('paid_status_subledger_missing')).toBe('Plaćen bez saldakonta');
    expect(controlLabel('unknown_control')).toBe('unknown_control');
  });
});
