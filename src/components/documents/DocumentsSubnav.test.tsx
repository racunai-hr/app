import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { searchParams } = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}));

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

import {
  DOCUMENTS_OPERATIVE_PRESETS,
  DOCUMENTS_SUBNAV,
  DocumentsSubnav,
} from './DocumentsSubnav';

describe('DocumentsSubnav', () => {
  beforeEach(() => {
    for (const key of [...searchParams.keys()]) {
      searchParams.delete(key);
    }
  });

  it('renders browse preset links under the dokumenti base path', () => {
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

  it('renders operative preset links mapped to SYSTEM_VIEWS', () => {
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Otvorena potraživanja' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=outgoing&view=unpaid_outgoing',
    );
    expect(screen.getByRole('link', { name: 'Otvorene obveze' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=incoming&view=incoming_ready_to_pay',
    );
    expect(screen.getByRole('link', { name: 'Djelomično plaćeno' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?view=partially_paid',
    );
    expect(screen.getByRole('link', { name: 'Dospjelo' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=outgoing&view=overdue_outgoing',
    );
    expect(DOCUMENTS_OPERATIVE_PRESETS).toHaveLength(4);
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

  it('marks operative preset active without highlighting browse all', () => {
    searchParams.set('view', 'partially_paid');
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Djelomično plaćeno' })).toHaveClass('tab-active');
    expect(screen.getByRole('link', { name: 'Svi dokumenti' })).not.toHaveClass('tab-active');
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

  it('clears operative view when switching to Ulazni browse preset', () => {
    searchParams.set('direction', 'outgoing');
    searchParams.set('view', 'unpaid_outgoing');
    searchParams.set('search', 'acme');
    render(<DocumentsSubnav slug="finestar" />);
    expect(screen.getByRole('link', { name: 'Ulazni' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti?direction=incoming&search=acme',
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
