import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { BiljeskeReport } from './BiljeskeReport';

describe('BiljeskeReport', () => {
  it('shows the 2021 decision and the notes with lipa on the tax block', () => {
    render(<BiljeskeReport slug="finestar" />);

    expect(screen.getByRole('option', { name: '2022' })).toBeInTheDocument();
    expect(screen.getByText(/Šibenik, 28\.03\.2023\./)).toBeInTheDocument();
    expect(screen.getAllByText('84.806,75 kn').length).toBeGreaterThan(0);
    expect(screen.getByText('721,98')).toBeInTheDocument();
    expect(screen.getByText('85.528,73')).toBeInTheDocument();
    expect(screen.getByText('93.381,86')).toBeInTheDocument();
    expect(screen.getByText(/8,00 kn/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2021' } });

    expect(screen.getByRole('option', { name: '2021' })).toBeInTheDocument();
    expect(screen.getByText(/Šibenik, 24\.03\.2022\./)).toBeInTheDocument();
    expect(screen.getAllByText('8.775,11 kn').length).toBeGreaterThan(0);
    expect(screen.getByText(/osnovano 2013\./)).toBeInTheDocument();
    expect(screen.getByText(/MBS 080885494/)).toBeInTheDocument();
    expect(screen.getByText(/Toni Šupe/)).toBeInTheDocument();
    expect(screen.getByText(/9\.604,00 kn/)).toBeInTheDocument();
    expect(screen.getByText('Dani zajmovi, depoziti i slično')).toBeInTheDocument();
    expect(screen.getAllByText('364.954').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−8.775').length).toBeGreaterThan(0);
    expect(screen.getByText('1.440')).toBeInTheDocument();
    expect(screen.getByText('3.809,35')).toBeInTheDocument();
    expect(screen.getByText('12.584,46')).toBeInTheDocument();
    expect(screen.getByText('1.590,00')).toBeInTheDocument();
    expect(screen.getByText('10.365,11')).toBeInTheDocument();
    expect(screen.getByText('10 %')).toBeInTheDocument();
    expect(document.getElementById('odluka')).not.toBeNull();
    expect(document.getElementById('biljeske')).not.toBeNull();
  });

  it('stays empty for a tenant without notes', () => {
    render(<BiljeskeReport slug="alma-cizmic" />);
    expect(screen.getByText('Nema odluke i bilješki.')).toBeInTheDocument();
  });
});
