import { describe, expect, it } from 'vitest';

import {
  assertNeverGreenFromNull,
  provenanceText,
  provenanceTone,
  REASON_LABELS,
} from './provenance';

describe('provenance', () => {
  it('maps honest empty reasons to Croatian labels', () => {
    expect(provenanceText({ value: null, reason: 'not_recorded', source: null })).toBe(
      REASON_LABELS.not_recorded,
    );
    expect(provenanceText({ value: null, reason: 'not_provable', source: null })).toBe(
      REASON_LABELS.not_provable,
    );
    expect(provenanceText({ value: null, reason: 'not_applicable', source: null })).toBe(
      REASON_LABELS.not_applicable,
    );
  });

  it('never treats a null value as success', () => {
    const emptyReasons = [null, 'not_recorded', 'not_provable', 'not_applicable'] as const;
    for (const reason of emptyReasons) {
      const field = { value: null, reason, source: 'subledger' as const };
      expect(provenanceTone(field)).toBe('unknown');
      expect(assertNeverGreenFromNull(field)).toBe(true);
    }
  });

  it('keeps paid/closed as success only when a value exists', () => {
    expect(provenanceTone({ value: 'paid', reason: null, source: 'subledger' })).toBe('success');
    expect(provenanceTone({ value: 'closed', reason: null, source: 'subledger' })).toBe('success');
    expect(provenanceTone({ value: 'overdue', reason: null, source: 'document' })).toBe('danger');
    expect(provenanceTone({ value: 'partial', reason: null, source: 'subledger' })).toBe('warning');
  });
});
