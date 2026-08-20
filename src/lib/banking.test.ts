import { describe, expect, it } from 'vitest';

import { formatIban } from './banking';
import { bankingRoleCapabilityNote, labelOrRaw, MATCH_STATUS_LABELS } from './bankingLabels';

describe('formatIban', () => {
  it('returns the full IBAN without masking', () => {
    expect(formatIban('HR1210010051863000160')).toBe('HR1210010051863000160');
  });

  it('returns em dash for empty values', () => {
    expect(formatIban('')).toBe('—');
    expect(formatIban(null)).toBe('—');
    expect(formatIban(undefined)).toBe('—');
  });

  it('strips spaces', () => {
    expect(formatIban('HR12 1001 0051 8630 0016 0')).toBe('HR1210010051863000160');
  });
});

describe('bankingLabels', () => {
  it('maps known match statuses', () => {
    expect(labelOrRaw(MATCH_STATUS_LABELS, 'unmatched')).toBe('Neusklađeno');
    expect(labelOrRaw(MATCH_STATUS_LABELS, 'weird')).toBe('weird');
  });

  it('explains role capabilities without implying write access', () => {
    expect(bankingRoleCapabilityNote('viewer')).toBe(
      'Imate pristup samo pregledu bankovnih podataka.',
    );
    expect(bankingRoleCapabilityNote('accountant')).toContain('Možete uvesti CAMT izvod');
    expect(bankingRoleCapabilityNote('owner')).toContain(
      'Sinkronizacija i usklađivanje još nisu dostupni u ovom sučelju',
    );
  });
});
