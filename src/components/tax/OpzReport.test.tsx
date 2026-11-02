import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { OpzReport } from './OpzReport';

describe('OpzReport', () => {
  it('shows the empty 2022 form and the receipt', () => {
    render(<OpzReport slug="finestar" />);

    expect(screen.getByRole('option', { name: '2022' })).toBeInTheDocument();
    expect(screen.getByText(/Kupaca nema/)).toBeInTheDocument();
    expect(screen.getByText(/Nenaplaćeno\s*0,00/)).toBeInTheDocument();
    expect(screen.getByText(/215fe8c3-59c4-48d4-bb9e-b51c6693a283/)).toBeInTheDocument();
    expect(screen.getByText(/806fbbf3-0b39-4e0a-9082-987899f43dde/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 04\.05\.2023\. 07:50/)).toBeInTheDocument();
    expect(screen.getByText(/Obrazac je zaprimljen i čeka provjeru/)).toBeInTheDocument();
  });

  it('stays empty for another tenant', () => {
    render(<OpzReport slug="alma-cizmic" />);
    expect(screen.getByText('Nema generiranog obrasca OPZ.')).toBeInTheDocument();
  });
});
