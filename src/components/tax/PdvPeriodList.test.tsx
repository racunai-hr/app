import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const fetchPdvPeriods = vi.fn();
const postPdvLedger = vi.fn();
vi.mock('@/lib/pdv', async () => {
  const actual = await vi.importActual<typeof import('@/lib/pdv')>('@/lib/pdv');
  return {
    ...actual,
    fetchPdvPeriods: (...args: unknown[]) => fetchPdvPeriods(...args),
    postPdvLedger: (...args: unknown[]) => postPdvLedger(...args),
  };
});

import { PdvPeriodList } from './PdvPeriodList';

describe('PdvPeriodList', () => {
  beforeEach(() => {
    fetchPdvPeriods.mockReset();
    postPdvLedger.mockReset();
  });

  it('still shows Otvori razdoblje when the tenant has no VAT periods', async () => {
    fetchPdvPeriods.mockResolvedValue({ count: 0, results: [] });
    render(
      <PdvPeriodList
        slug="alma-cizmic"
        origin="http://127.0.0.1:8000"
        token="token"
        role="accountant"
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Otvori razdoblje' })).toBeInTheDocument();
    });
    expect(screen.getByText('Nema PDV razdoblja za ovu tvrtku.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generiraj knjige' })).toBeInTheDocument();
  });

  it('shows the filed HRK amount for an imported paper return', async () => {
    const base = {
      period_status: 'submitted',
      has_ledger: false,
      return_version: 1,
      return_status: 'imported',
      return_source: 'imported',
      latest_return_version: 1,
      latest_return_status: 'imported',
      correction_in_progress: false,
      vat_due: '0.00',
      submitted_at: '2022-02-21T12:44:02+00:00',
    };
    fetchPdvPeriods.mockResolvedValue({
      count: 2,
      results: [
        {
          ...base,
          period: '2022-02',
          period_from: '2022-02-01',
          period_to: '2022-02-28',
          return_version: 2,
          latest_return_version: 2,
          document_vat_due: '-26740.53',
          document_currency: 'HRK',
          submitted_at: '2022-03-25T08:06:06+00:00',
        },
        {
          ...base,
          period: '2022-01',
          period_from: '2022-01-01',
          period_to: '2022-01-31',
          document_vat_due: '-5.00',
          document_currency: 'HRK',
        },
      ],
    });
    render(
      <PdvPeriodList slug="finestar" origin="http://127.0.0.1:8000" token="token" role="owner" />,
    );
    await waitFor(() => {
      expect(screen.getByRole('link', { name: '02/2022' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '01/2022' })).toBeInTheDocument();
    expect(screen.getByText(/26\.740,53 HRK/)).toBeInTheDocument();
    expect(screen.getByText(/5,00 HRK/)).toBeInTheDocument();
  });
});
