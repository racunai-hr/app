import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocumentKpi } from './DocumentKpi';

describe('DocumentKpi', () => {
  it('renders four compact metric tiles', () => {
    render(
      <DocumentKpi
        byCurrency={{
          EUR: {
            outgoing_count: 2,
            incoming_count: 1,
            outgoing_gross: '200.00',
            incoming_gross: '50.00',
            open_receivables: '80.00',
            open_payables: '10.00',
          },
        }}
      />,
    );
    expect(screen.getByLabelText('Izlazni')).toBeInTheDocument();
    expect(screen.getByLabelText('Ulazni')).toBeInTheDocument();
    expect(screen.getByLabelText('Potraživanja')).toBeInTheDocument();
    expect(screen.getByLabelText('Obveze')).toBeInTheDocument();
    expect(screen.getByText('2 · 200,00 EUR')).toBeInTheDocument();
    expect(screen.getByText('80,00 EUR')).toBeInTheDocument();
  });
});
