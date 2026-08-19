import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const usePathname = vi.fn(() => '/t/finestar/bankarstvo/racuni');

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

import { BANKING_SUBNAV, BankingSubnav } from './BankingSubnav';

describe('BankingSubnav', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/t/finestar/bankarstvo/racuni');
  });

  it('renders all module cards under one Bankarstvo base path', () => {
    render(<BankingSubnav slug="finestar" />);
    for (const item of BANKING_SUBNAV) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        `/t/finestar/bankarstvo${item.path}`,
      );
    }
  });

  it('marks the current card as active', () => {
    render(<BankingSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Računi' })).toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Pregled' })).not.toHaveClass('tab-active');
  });

  it('activates Pregled only on the overview path', () => {
    usePathname.mockReturnValue('/t/finestar/bankarstvo');
    render(<BankingSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Pregled' })).toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Računi' })).not.toHaveClass('tab-active');
  });
});
