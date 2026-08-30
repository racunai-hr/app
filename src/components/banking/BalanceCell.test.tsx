import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { BalanceDto } from '@/lib/banking';

import { BalanceCell } from './BalanceCell';

function balance(overrides: Partial<BalanceDto> = {}): BalanceDto {
  return {
    balance_type: 'statement-closing',
    amount: '1000.00',
    currency: 'EUR',
    as_of: '2026-08-18T00:00:00+02:00',
    source: 'statement',
    is_stale: true,
    ...overrides,
  };
}

describe('BalanceCell', () => {
  it('renders a clickable stale badge when import is allowed', () => {
    const onImport = vi.fn();
    render(<BalanceCell balances={[balance()]} canImport onImport={onImport} />);
    const button = screen.getByRole('button', {
      name: 'Zastarjelo — uvezi novi XML izvadak (camt.053)',
    });
    fireEvent.click(button);
    expect(onImport).toHaveBeenCalledTimes(1);
  });

  it('keeps stale as a span when import is not allowed', () => {
    render(<BalanceCell balances={[balance()]} />);
    expect(screen.getByText('Zastarjelo').tagName).toBe('SPAN');
    expect(
      screen.queryByRole('button', { name: /Zastarjelo — uvezi novi XML izvadak/ }),
    ).toBeNull();
  });

  it('keeps fresh as a span even when import is allowed', () => {
    render(<BalanceCell balances={[balance({ is_stale: false })]} canImport onImport={vi.fn()} />);
    const fresh = screen.getByText('Svježe');
    expect(fresh.tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
