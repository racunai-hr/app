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
    cost_center: null,
    ...overrides,
  };
}

describe('AssetOverview', () => {
  it('links the cost center to its card', () => {
    render(
      <AssetOverview
        slug="finestar"
        asset={sample({
          cost_center: { id: 18, code: '701', name: 'Audi A8 Lang 50 TDI' },
        })}
      />,
    );
    expect(screen.getByRole('link', { name: '701 · Audi A8 Lang 50 TDI' })).toHaveAttribute(
      'href',
      '/t/finestar/izvjestaji/mjesta-troska/18',
    );
  });

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
    expect(screen.getByText('Mjesto troška').parentElement).toHaveTextContent('—');
  });
});
