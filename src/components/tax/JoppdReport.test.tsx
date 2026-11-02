import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { JoppdReportView } from './JoppdReport';

describe('JoppdReport', () => {
  it('opens the latest 2022 report and keeps the February hours on the first one', () => {
    render(<JoppdReportView slug="finestar" />);

    expect(screen.getByLabelText('Izvješće')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(10);
    expect(screen.getByText(/CAROLINA PLAZA RODIGUEZ/)).toBeInTheDocument();
    expect(screen.getByText(/94b2ac53-1383-4e87-a994-be1aafda3dc7/)).toBeInTheDocument();
    expect(screen.queryByText(/Zaprimljeno/)).not.toBeInTheDocument();
    expect(screen.getAllByText('5.000,00').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Izvješće'), { target: { value: '2022-03-31' } });

    expect(screen.getByText(/21a24f07-d574-4d00-9a38-3eff8dfca664/)).toBeInTheDocument();
    expect(screen.getAllByText('2.500,00').length).toBeGreaterThan(0);
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('stays empty for another tenant', () => {
    render(<JoppdReportView slug="alma-cizmic" />);
    expect(screen.getByText('Nema generiranog obrasca JOPPD.')).toBeInTheDocument();
  });
});
