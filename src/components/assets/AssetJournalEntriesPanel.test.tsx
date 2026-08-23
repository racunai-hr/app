import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchAssetJournalEntries = vi.fn();

vi.mock('@/lib/assets', async () => {
  const actual = await vi.importActual<typeof import('@/lib/assets')>('@/lib/assets');
  return {
    ...actual,
    fetchAssetJournalEntries: (...args: unknown[]) => fetchAssetJournalEntries(...args),
  };
});

import { AssetJournalEntriesPanel } from './AssetJournalEntriesPanel';

const payload = {
  results: [
    {
      journal_entry_id: 51,
      entry_number: '202605-0012',
      entry_date: '2026-05-27',
      description: 'Nabava VW Golf',
      status: 'posted',
      audit_kind: 'active',
      role: 'purchase',
      total_amount: '15882.35',
      capitalized_amount: '15882.35',
    },
    {
      journal_entry_id: 56,
      entry_number: '202606-0010',
      entry_date: '2026-06-19',
      description: 'PPMV — VW Golf',
      status: 'reversed',
      audit_kind: 'reversed',
      role: 'dependent_cost',
      total_amount: '1051.04',
      capitalized_amount: '0.00',
    },
    {
      journal_entry_id: 57,
      entry_number: '202606-0010-ST',
      entry_date: '2026-07-03',
      description: 'Storno: PPMV — VW Golf',
      status: 'posted',
      audit_kind: 'storno',
      role: 'dependent_cost',
      total_amount: '1051.04',
      capitalized_amount: '0.00',
    },
    {
      journal_entry_id: 58,
      entry_number: '202606-0012',
      entry_date: '2026-06-19',
      description: 'PPMV uplata',
      status: 'posted',
      audit_kind: 'active',
      role: 'payment',
      total_amount: '1051.04',
      capitalized_amount: null,
    },
  ],
  reconciliation: {
    capitalized_net: '17049.79',
    acquisition_cost: '17049.79',
    difference: '0.00',
    balanced: true,
  },
};

describe('AssetJournalEntriesPanel', () => {
  beforeEach(() => {
    fetchAssetJournalEntries.mockReset();
    fetchAssetJournalEntries.mockResolvedValue(payload);
  });

  it('renders roles, lifecycle labels, JE links and balanced recon', async () => {
    render(
      <AssetJournalEntriesPanel slug="finestar" origin="https://api.test" token="t" assetId={3} />,
    );
    await waitFor(() => expect(screen.getByRole('link', { name: '202605-0012' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: '202605-0012' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/51',
    );
    expect(screen.getByText('Nabava')).toBeInTheDocument();
    expect(screen.getAllByText('Ovisni trošak').length).toBeGreaterThan(1);
    expect(screen.getByText('Plaćanje')).toBeInTheDocument();
    expect(screen.getAllByText('Knjižena').length).toBeGreaterThan(1);
    expect(screen.getByText('Stornirana')).toBeInTheDocument();
    expect(screen.getByText('Storno')).toBeInTheDocument();
    expect(screen.getByText('Usklađeno')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText('Novi')).not.toBeInTheDocument();
    expect(screen.queryByText('Poveži')).not.toBeInTheDocument();
    expect(screen.queryByText('Ukloni')).not.toBeInTheDocument();
  });

  it('shows a warning when reconciliation is unbalanced', async () => {
    fetchAssetJournalEntries.mockResolvedValue({
      ...payload,
      reconciliation: {
        capitalized_net: '16000.00',
        acquisition_cost: '17049.79',
        difference: '-1049.79',
        balanced: false,
      },
    });
    render(
      <AssetJournalEntriesPanel slug="finestar" origin="https://api.test" token="t" assetId={3} />,
    );
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('status').textContent).toMatch(/razlikuju/);
  });

  it('shows the empty table state', async () => {
    fetchAssetJournalEntries.mockResolvedValue({
      results: [],
      reconciliation: {
        capitalized_net: '0.00',
        acquisition_cost: '17049.79',
        difference: '-17049.79',
        balanced: false,
      },
    });
    render(
      <AssetJournalEntriesPanel slug="finestar" origin="https://api.test" token="t" assetId={3} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Nema povezanih temeljnica.')).toBeInTheDocument();
    });
  });
});
