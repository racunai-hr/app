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
});
