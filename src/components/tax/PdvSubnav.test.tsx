import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const usePathname = vi.fn(() => '/t/finestar/porezi/pdv');

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

import { PDV_SUBNAV, PdvSubnav } from './PdvSubnav';

describe('PdvSubnav', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/t/finestar/porezi/pdv');
  });

  it('renders three tabs and sends scoped tabs without period to Razdoblja', () => {
    render(<PdvSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Razdoblja' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv',
    );
    expect(screen.getByRole('link', { name: 'Kontrolni pregledi' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv',
    );
    expect(screen.getByRole('link', { name: 'Prijava' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv',
    );
    expect(PDV_SUBNAV).toHaveLength(3);
  });

  it('copies a valid period only onto scoped tabs', () => {
    usePathname.mockReturnValue('/t/finestar/porezi/pdv/prijava');
    render(<PdvSubnav slug="finestar" period="2026-07" />);
    expect(screen.getByRole('link', { name: 'Razdoblja' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv',
    );
    expect(screen.getByRole('link', { name: 'Kontrolni pregledi' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv/kontrolni-pregledi?period=2026-07',
    );
    expect(screen.getByRole('link', { name: 'Prijava' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv/prijava?period=2026-07',
    );
  });

  it('treats an invalid period as missing context', () => {
    render(<PdvSubnav slug="finestar" period="2026-13" />);
    expect(screen.getByRole('link', { name: 'Prijava' })).toHaveAttribute(
      'href',
      '/t/finestar/porezi/pdv',
    );
  });
});
