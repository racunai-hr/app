import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { IzjaveReport } from './IzjaveReport';

describe('IzjaveReport', () => {
  it('offers only years that already have filed statements', () => {
    render(<IzjaveReport slug="finestar" />);

    const year = screen.getByLabelText('Godina');
    expect(year.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['2013']);
    expect(screen.getByText(/Registrirano 12\.12\.2013\./)).toBeInTheDocument();
    expect(screen.getByText(/Izjave potpisane 26\.02\.2014\./)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Neobavljanje djelatnosti' })).toBeInTheDocument();
    expect(screen.getByText(/kvartalni obveznik PDV-a/)).toBeInTheDocument();
    expect(screen.getByText(/OIB 03626641565/)).toBeInTheDocument();
    expect(screen.getByText('Društvo samo vodi poslovne knjige.')).toBeInTheDocument();
    expect(screen.getByText(/poštanski sandučić/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Porez na dobit' })).toBeInTheDocument();
    expect(screen.getByText(/Potpisano 17\.02\.2014\./)).toBeInTheDocument();
    expect(screen.getByText(/oslobođenja od predaje poreza na dobit za 2013/)).toBeInTheDocument();
  });

  it('shows no year control when the tenant has no filed statements', () => {
    render(<IzjaveReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranih izjava.')).toBeInTheDocument();
    expect(screen.queryByText(/03626641565/)).not.toBeInTheDocument();
  });
});
