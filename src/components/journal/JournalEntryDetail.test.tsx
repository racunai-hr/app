import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchJournalEntry = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/partners/usePartnerSession', () => ({
  usePartnerSession: () => ({
    session: {
      tenant: { slug: 'finestar', name: 'Fine Star d.o.o.' },
      origin: 'https://finestar-stage.racunai.hr',
      token: 'token',
      role: 'viewer',
    },
    loading: false,
    error: '',
  }),
}));

vi.mock('@/lib/journal', async () => {
  const actual = await vi.importActual<typeof import('@/lib/journal')>('@/lib/journal');
  return {
    ...actual,
    fetchJournalEntry: (...args: unknown[]) => fetchJournalEntry(...args),
  };
});

import { JournalEntryDetailView } from './JournalEntryDetail';

const detail = {
  id: 15,
  entry_number: '202607-0015',
  entry_date: '2026-07-27',
  description: 'Izlazni račun Asenova',
  status: 'posted' as const,
  is_auto: true,
  source_type: 'invoice' as const,
  total_debit: '25000.00',
  total_credit: '25000.00',
  as_of: '2026-08-19T10:00:00Z',
  reference: 'INV-001/2026',
  source_id: 8,
  lines: [
    {
      id: 101,
      account_code: '1200',
      account_name: 'Kupci',
      description: 'Potraživanje',
      debit: '25000.00',
      credit: '0.00',
    },
    {
      id: 102,
      account_code: '7500',
      account_name: 'Prihodi',
      description: 'Prihod',
      debit: '0.00',
      credit: '25000.00',
    },
  ],
};

describe('JournalEntryDetailView', () => {
  beforeEach(() => {
    fetchJournalEntry.mockReset();
    fetchJournalEntry.mockResolvedValue(detail);
  });

  it('renders header, lines and back link without bank match UI', async () => {
    render(<JournalEntryDetailView slug="finestar" entryId={15} />);
    await waitFor(() => {
      expect(screen.getByText('202607-0015 — Fine Star d.o.o.')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Natrag na listu' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga',
    );
    expect(screen.getByText('INV-001/2026')).toBeInTheDocument();
    expect(screen.getByText('Račun')).toBeInTheDocument();
    expect(screen.getByText('Knjižena')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Konto' })).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('Kupci')).toBeInTheDocument();
    expect(screen.getByText('7500')).toBeInTheDocument();
    expect(screen.getAllByText('25.000,00').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole('link', { name: /transakcij/i })).toBeNull();
    expect(screen.queryByText(/has_bank_match/i)).toBeNull();
    expect(fetchJournalEntry).toHaveBeenCalledWith(
      'https://finestar-stage.racunai.hr',
      'token',
      15,
    );
  });
});
