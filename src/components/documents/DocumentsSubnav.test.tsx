import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const searchParams = new URLSearchParams();

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
  useSearchParams: () => searchParams,
}));

import { DOCUMENTS_SUBNAV, DocumentsSubnav } from './DocumentsSubnav';

describe('DocumentsSubnav', () => {
  beforeEach(() => {
    searchParams.forEach((_, key) => searchParams.delete(key));
  });

  it('renders preset links under the dokumenti base path', () => {
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Svi dokumenti' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti',
    );
    expect(screen.getByRole('link', { name: 'Ulazni' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=incoming',
    );
    expect(screen.getByRole('link', { name: 'Izlazni' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=outgoing',
    );
    expect(screen.getByRole('link', { name: 'Zahtijeva pažnju' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?view=attention',
    );
    expect(DOCUMENTS_SUBNAV).toHaveLength(4);
  });

  it('marks incoming and attention active independently', () => {
    searchParams.set('direction', 'incoming');
    searchParams.set('view', 'attention');
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Ulazni' })).toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Zahtijeva pažnju' })).toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Svi dokumenti' })).not.toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Izlazni' })).not.toHaveClass('tab-active');
  });

  it('preserves other filters when building incoming href', () => {
    searchParams.set('view', 'attention');
    searchParams.set('search', 'acme');
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Ulazni' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=incoming&view=attention&search=acme',
    );
  });

  it('clears view on Svi dokumenti when only view is set', () => {
    searchParams.set('view', 'attention');
    searchParams.set('search', 'acme');
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Svi dokumenti' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?search=acme',
    );
  });
});
