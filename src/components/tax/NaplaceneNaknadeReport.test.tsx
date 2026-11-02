import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { NaplaceneNaknadeReport } from './NaplaceneNaknadeReport';

describe('NaplaceneNaknadeReport', () => {
  it('offers only years that already have the request', () => {
    render(<NaplaceneNaknadeReport slug="finestar" />);

    const year = screen.getByLabelText('Godina');
    expect(year.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['2015']);
    expect(screen.getByText(/Molba od 21\.12\.2015\./)).toBeInTheDocument();
    expect(screen.getByText(/Ispostava Susedgrad/)).toBeInTheDocument();
    expect(
      screen.getByText('Molimo primjenu postupka oporezivanja prema naplaćenim naknadama od 01.01.2016.'),
    ).toBeInTheDocument();
  });

  it('shows no year control when the tenant has no request', () => {
    render(<NaplaceneNaknadeReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generirane molbe.')).toBeInTheDocument();
    expect(screen.queryByText(/21\.12\.2015/)).not.toBeInTheDocument();
  });
});