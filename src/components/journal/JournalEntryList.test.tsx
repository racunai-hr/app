import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const searchParams = new URLSearchParams();
const fetchJournalEntries = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
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
    fetchJournalEntries: (...args: unknown[]) => fetchJournalEntries(...args),
  };
});

import { JournalEntryList } from './JournalEntryList';

const page = {
  as_of: '2026-08-19T10:00:00Z',
  count: 2,
  page: 1,
  page_size: 20,
  results: [
    {
      id: 1,
      entry_number: '202608-MAN',
      entry_date: '2026-08-03',
      description: 'PPMV obveza A8',
      status: 'posted' as const,
      is_auto: false,
      source_type: 'manual' as const,
      total_debit: '10347.20',
      total_credit: '10347.20',
    },
    {
      id: 2,
      entry_number: '202607-INV',
      entry_date: '2026-07-27',
      description: 'Izlazni račun',
      status: 'draft' as const,
      is_auto: true,
      source_type: 'invoice' as const,
      total_debit: '25000.00',
      total_credit: '25000.00',
    },
  ],
};

describe('JournalEntryList', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchJournalEntries.mockReset();
    fetchJournalEntries.mockResolvedValue(page);
    searchParams.delete('status');
    searchParams.delete('search');
    searchParams.delete('date_from');
    searchParams.delete('date_to');
    searchParams.delete('page');
  });

  it('renders the read-only journal list with HR labels and entry number links', async () => {
    render(<JournalEntryList slug="finestar" />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: '202608-MAN' })).toBeInTheDocument();
    });
    expect(screen.getByText('Glavna knjiga — Fine Star d.o.o.')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Broj' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Izvor' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Duguje' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Potražuje' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ručno' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Račun' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Knjižena' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Nacrt' })).toBeInTheDocument();
    expect(screen.getAllByText('10.347,20')).toHaveLength(2);
    expect(screen.getByText('19. 8. 2026. u 12:00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '202608-MAN' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/1',
    );
    expect(screen.getByRole('link', { name: '202607-INV' })).toHaveAttribute(
      'href',
      '/t/finestar/glavna-knjiga/2',
    );
    expect(screen.queryByRole('button', { name: /otvori/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /otvori/i })).toBeNull();
    expect(fetchJournalEntries).toHaveBeenCalledWith(
      'https://finestar-stage.racunai.hr',
      'token',
      expect.objectContaining({ page: 1, page_size: 20 }),
    );
  });
});
