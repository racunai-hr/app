import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPartnerSubledger = vi.fn();

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

vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    fetchPartnerSubledger: (...args: unknown[]) => fetchPartnerSubledger(...args),
  };
});

import { PartnerSubledgerPanel } from './PartnerSubledgerPanel';

function subledgerRow(overrides: Record<string, unknown> = {}) {
  return {
    item_id: 42,
    partner_id: 3,
    partner_name: 'Partner d.o.o.',
    direction: 'incoming',
    direction_label: 'Ulazni',
    source_type: 'expense',
    source_id: 30,
    source_label: '26210-H120-5154',
    original_amount: '100.00',
    open_amount: '60.00',
    due_date: '2026-08-06',
    days_overdue: 0,
    aging_bucket: 'current',
    status: 'partial',
    ...overrides,
  };
}

describe('PartnerSubledgerPanel', () => {
  beforeEach(() => {
    fetchPartnerSubledger.mockReset();
  });

  it('links document and shows banking close CTA for open rows', async () => {
    fetchPartnerSubledger.mockResolvedValue({
      as_of_date: '2026-08-19',
      partner_id: 3,
      count: 1,
      results: [subledgerRow()],
      closed_count: 0,
      closed_results: [],
    });
    render(
      <PartnerSubledgerPanel
        slug="finestar"
        origin="https://x"
        token="t"
        partnerId={3}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('link', { name: '26210-H120-5154' })).toBeInTheDocument();
    });
    expect(fetchPartnerSubledger).toHaveBeenCalledWith('https://x', 't', 3, {
      includeClosed: true,
    });
    expect(screen.getByRole('link', { name: '26210-H120-5154' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti/ulazni/30',
    );
    expect(screen.getByRole('link', { name: 'Zatvori bankom' })).toHaveAttribute(
      'href',
      '/t/finestar/bankarstvo/uskladivanje?match_status=unmatched&subledger_item=42',
    );
    expect(screen.getByText('Djelomičan')).toBeInTheDocument();
    expect(screen.getByText('Nedospjelo')).toBeInTheDocument();
  });

  it('shows empty open message and closed history without bank CTA', async () => {
    fetchPartnerSubledger.mockResolvedValue({
      as_of_date: '2026-08-19',
      partner_id: 3,
      count: 0,
      results: [],
      closed_count: 1,
      closed_results: [subledgerRow({ status: 'closed', open_amount: '0.00' })],
    });
    render(
      <PartnerSubledgerPanel
        slug="finestar"
        origin="https://x"
        token="t"
        partnerId={3}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Nema otvorenih potraživanja ni obveza/)).toBeInTheDocument();
    });
    expect(screen.getByText('Zatvorene stavke (1)')).toBeInTheDocument();
    expect(screen.getByText('Zatvoren')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Zatvori bankom' })).toBeNull();
  });
});
