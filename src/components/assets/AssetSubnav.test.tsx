import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/t/finestar/imovina/3/temeljnice',
}));

import { AssetSubnav } from './AssetSubnav';

describe('AssetSubnav', () => {
  it('includes Dokumenti and Temeljnice between Pregled and Amortizacija', () => {
    render(<AssetSubnav slug="finestar" assetId={3} />);
    const links = screen.getAllByRole('link').map((node) => node.textContent);
    expect(links).toEqual(['Pregled', 'Dokumenti', 'Temeljnice', 'Amortizacija']);
    expect(screen.getByRole('link', { name: 'Dokumenti' })).toHaveAttribute(
      'href',
      '/t/finestar/imovina/3/dokumenti',
    );
    expect(screen.getByRole('link', { name: 'Temeljnice' })).toHaveAttribute(
      'href',
      '/t/finestar/imovina/3/temeljnice',
    );
    expect(screen.getByRole('link', { name: 'Temeljnice' })).toHaveClass('tab-active');
  });
});
