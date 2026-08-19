import { describe, expect, it } from 'vitest';

import { maskIban } from './banking';
import { bankingRoleCapabilityNote, labelOrRaw, MATCH_STATUS_LABELS } from './bankingLabels';

describe('maskIban', () => {
  it('masks middle characters and keeps first/last 4', () => {
    expect(maskIban('HR1210010051863000160')).toBe('HR12*************0160');
  });

  it('returns em dash for empty values', () => {
    expect(maskIban('')).toBe('—');
    expect(maskIban(null)).toBe('—');
    expect(maskIban(undefined)).toBe('—');
  });

  it('leaves short values unmasked', () => {
    expect(maskIban('HR12')).toBe('HR12');
  });

  it('strips spaces before masking', () => {
    expect(maskIban('HR12 1001 0051 8630 0016 0')).toBe('HR12*************0160');
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
