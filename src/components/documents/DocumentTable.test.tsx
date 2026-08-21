import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { sampleDocument } from '@/test/documentFixtures';

import { DocumentTable } from './DocumentTable';

describe('DocumentTable', () => {
  it('shows an empty state without a detail link', () => {
    const { container } = render(<DocumentTable rows={[]} />);
    expect(screen.getByText('Nema dokumenata za odabrani filter.')).toBeInTheDocument();
    expect(container.querySelector('a')).toBeNull();
  });

  it('renders compact columns, controls, and unknown operational status', () => {
    const { container } = render(<DocumentTable rows={[sampleDocument()]} />);
    expect(screen.getByText('Izlazni · R-100')).toBeInTheDocument();
    expect(screen.getByText('Izvorni broj: SRC-1')).toBeInTheDocument();
    expect(screen.getByText('Plaćen bez saldakonta')).toBeInTheDocument();
    expect(screen.getByText('Ažurirano nakon knjiženja')).toBeInTheDocument();
    expect(screen.getByText('nije dokazivo')).toHaveAttribute('data-tone', 'unknown');
    expect(screen.getByText('Status dokumenta: Poslan')).toBeInTheDocument();
    expect(screen.getByText('Razdoblje: 2026-03')).toBeInTheDocument();
    expect(screen.getByText('125,00 EUR')).toBeInTheDocument();
    expect(screen.queryByText('OIB')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('.badge-success')).toBeNull();
  });

  it('opens outgoing detail via button; incoming uses dokumenti/ulazni link', () => {
    const onOpenDocument = vi.fn();
    render(
      <DocumentTable
        slug="finestar"
        rows={[
          sampleDocument(),
          sampleDocument({
            id: 30,
            direction: 'incoming',
            internal_number: 'T-30',
            source_number: '26210-H120-5154',
          }),
        ]}
        onOpenDocument={onOpenDocument}
      />,
    );
    const open = screen.getByRole('button', { name: 'Detalji računa Izlazni · R-100' });
    fireEvent.click(open);
    expect(onOpenDocument).toHaveBeenCalledWith({ direction: 'outgoing', id: 4 });

    const incoming = screen.getByRole('link', { name: 'Detalji računa Ulazni · T-30' });
    expect(incoming).toHaveAttribute('href', '/t/finestar/dokumenti/ulazni/30');
  });

  it('does not paint success from raw paid when operational status is empty', () => {
    const { container } = render(
      <DocumentTable
        rows={[
          sampleDocument({
            operational_status: { value: null, reason: 'not_provable', source: 'subledger' },
            document_status: { value: 'paid', reason: null, source: 'invoice' },
          }),
        ]}
      />,
    );
    const unknown = screen.getByText('nije dokazivo');
    expect(unknown).toHaveAttribute('data-tone', 'unknown');
    expect(unknown.className).not.toContain('badge-success');
    expect(screen.getByText('Status dokumenta: Plaćen')).toBeInTheDocument();
    expect(container.querySelector('.badge-success')).toBeNull();
  });
});
