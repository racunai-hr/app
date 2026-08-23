import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FixedAssetDetail } from '@/lib/assets';

import { AssetOverview } from './AssetOverview';

function sample(overrides: Partial<FixedAssetDetail> = {}): FixedAssetDetail {
  return {
    id: 2,
    inventory_number: 'OS-001',
    name: 'VW T-Cross',
    status: 'active',
    origin: 'purchase',
    purchase_date: '2026-05-22',
    activation_date: '2026-07-01',
    acquisition_cost: '8000.00',
    accumulated_depreciation: '133.33',
    current_book_value: '7866.67',
    vin: 'WVGZZZC1ZPY022544',
    useful_life_months: 60,
    depreciation_method: 'linear',
    activation_journal_entry_id: 88,
    ...overrides,
  };
}

describe('AssetOverview', () => {
  it('links activation journal entry only when id exists', () => {
    const { rerender } = render(<AssetOverview slug="finestar" asset={sample()} />);
    expect(screen.getByRole('link', { name: 'Temeljnica aktivacije' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/88',
    );
    rerender(
      <AssetOverview slug="finestar" asset={sample({ activation_journal_entry_id: null })} />,
    );
    expect(screen.queryByRole('link', { name: 'Temeljnica aktivacije' })).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
