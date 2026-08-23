import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchDepreciationSchedule = vi.fn();

vi.mock('@/lib/assets', async () => {
  const actual = await vi.importActual<typeof import('@/lib/assets')>('@/lib/assets');
  return {
    ...actual,
    fetchDepreciationSchedule: (...args: unknown[]) => fetchDepreciationSchedule(...args),
  };
});

import { AssetDepreciationPanel } from './AssetDepreciationPanel';

describe('AssetDepreciationPanel', () => {
  beforeEach(() => {
    fetchDepreciationSchedule.mockReset();
  });

  it('links journal entry only when id exists and shows empty state', async () => {
    fetchDepreciationSchedule.mockResolvedValue({
      results: [
        {
          id: 1,
          year: 2026,
          month: 7,
          depreciation_amount: '133.33',
          accumulated_depreciation: '133.33',
          book_value_after: '7866.67',
          posted: true,
          journal_entry_id: 91,
        },
        {
          id: 2,
          year: 2026,
          month: 8,
          depreciation_amount: '133.33',
          accumulated_depreciation: '133.33',
          book_value_after: '7733.34',
          posted: false,
          journal_entry_id: null,
        },
      ],
    });
    const { rerender } = render(
      <AssetDepreciationPanel slug="finestar" origin="https://api.test" token="t" assetId={2} />,
    );
    await waitFor(() => expect(screen.getByRole('link', { name: 'Temeljnica' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Temeljnica' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/91',
    );
    expect(screen.getByText('Nije knjiženo')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);

    fetchDepreciationSchedule.mockResolvedValue({ results: [] });
    rerender(
      <AssetDepreciationPanel slug="finestar" origin="https://api.test" token="t" assetId={3} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Nema obračuna amortizacije.')).toBeInTheDocument();
    });
  });
});
