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

  it('shows only the EUR tile when other currencies are present', () => {
    render(
      <DocumentKpi
        byCurrency={{
          DKK: {
            outgoing_count: 0,
            incoming_count: 1,
            outgoing_gross: '0.00',
            incoming_gross: '731.11',
            open_receivables: '0.00',
            open_payables: '0.00',
          },
          EUR: {
            outgoing_count: 7,
            incoming_count: 67,
            outgoing_gross: '61971.70',
            incoming_gross: '76073.10',
            open_receivables: '0.00',
            open_payables: '0.00',
          },
        }}
      />,
    );
    expect(screen.getByText('7 · 61.971,70 EUR')).toBeInTheDocument();
    expect(screen.getByText('67 · 76.073,10 EUR')).toBeInTheDocument();
    expect(screen.queryByText(/DKK/)).toBeNull();
    expect(document.querySelectorAll('.kpi-value')).toHaveLength(4);
  });
});
