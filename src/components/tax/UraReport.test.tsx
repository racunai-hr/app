import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { UraReport } from './UraReport';

describe('UraReport', () => {
  it('opens the later December filing and shows zeros for an empty month', () => {
    render(<UraReport slug="finestar" />);

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Prosinac 2022.',
      'Studeni 2022.',
      'Rujan 2022.',
      'Kolovoz 2022.',
      'Srpanj 2022.',
      'Lipanj 2022.',
      'Svibanj 2022.',
      'Travanj 2022.',
    ]);
    expect(screen.getByText('SUPERIOR PORTO')).toBeInTheDocument();
    expect(screen.getByText(/LESNINA H\.D\.O\.O\./)).toBeInTheDocument();
    expect(screen.getByText(/cf53d8fe-597a-469b-bac0-ba543c275e1e/)).toBeInTheDocument();
    expect(screen.queryByText('51f831f9-4ea1-4c69-9506-0bf1727864cc')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mjesec'), { target: { value: '2022-11' } });

    expect(screen.getByText('Nema primljenih računa.')).toBeInTheDocument();
    expect(screen.getByText(/c41a0b3e-6f95-4580-91b0-396624007c84/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mjesec'), { target: { value: '2022-05' } });

    expect(screen.getByText(/LAKOL ŠIBENIK d\.o\.o\./)).toBeInTheDocument();
    expect(screen.getByText(/T\.O\. BRAKUS/)).toBeInTheDocument();
    expect(screen.getByText(/19\.046,83/)).toBeInTheDocument();
  });

  it('stays empty for another tenant', () => {
    render(<UraReport slug="alma-cizmic" />);
    expect(screen.getByText('Nema generiranog obrasca U-RA.')).toBeInTheDocument();
  });
});
