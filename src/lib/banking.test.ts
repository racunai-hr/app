import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTransactions, formatIban } from './banking';
import { bankingRoleCapabilityNote, labelOrRaw, MATCH_STATUS_LABELS } from './bankingLabels';

describe('fetchTransactions search param', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ as_of: '', count: 0, page: 1, page_size: 20, results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('includes search in the API query string when set', async () => {
    await fetchTransactions('https://x', 'tok', { search: 'Telecom26' });
    expect(fetchMock.mock.calls[0][0]).toContain('search=Telecom26');
  });

  it('omits search from the API query string when empty', async () => {
    await fetchTransactions('https://x', 'tok', { search: '' });
    expect(fetchMock.mock.calls[0][0]).not.toMatch(/search=/);
  });
});

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
