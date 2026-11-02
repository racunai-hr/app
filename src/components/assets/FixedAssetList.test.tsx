import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const searchParams = new URLSearchParams();
const fetchFixedAssets = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('./useAssetsSession', () => ({
  useAssetsSession: () => ({
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

vi.mock('@/lib/assets', async () => {
  const actual = await vi.importActual<typeof import('@/lib/assets')>('@/lib/assets');
  return {
    ...actual,
    fetchFixedAssets: (...args: unknown[]) => fetchFixedAssets(...args),
  };
});

import { FixedAssetList } from './FixedAssetList';

const page = {
  count: 2,
  page: 1,
  page_size: 20,
  results: [
    {
      id: 2,
      inventory_number: 'OS-001',
      name: 'VW T-Cross',
      status: 'active',
      origin: 'purchase',
      purchase_date: '2026-05-22',
      activation_date: '2026-07-01',
      acquisition_cost: '8000.00',
      accumulated_depreciation: '133.33',
      current_book_value: '7866.67',
    },
    {
      id: 4,
      inventory_number: 'OS-003',
      name: 'Star stroj',
      status: 'disposed',
      origin: 'opening_balance',
      purchase_date: '2020-01-15',
      activation_date: '2020-02-01',
      acquisition_cost: '1000.00',
      accumulated_depreciation: '1000.00',
      current_book_value: '0.00',
    },
  ],
};

describe('FixedAssetList', () => {
  beforeEach(() => {
    replace.mockReset();
    fetchFixedAssets.mockReset();
    fetchFixedAssets.mockResolvedValue(page);
    searchParams.delete('status');
    searchParams.delete('origin');
    searchParams.delete('search');
    searchParams.delete('page');
    searchParams.delete('page_size');
  });

  it('renders register columns, HR labels, and name links', async () => {
    render(<FixedAssetList slug="finestar" />);
    await waitFor(() => expect(fetchFixedAssets).toHaveBeenCalled());
    expect(screen.getByRole('columnheader', { name: 'Naziv' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VW T-Cross' })).toHaveAttribute(
      'href',
      '/t/finestar/imovina/2',
    );
    expect(screen.getByRole('cell', { name: 'Otpisano' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Početno stanje' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Novi' })).not.toBeInTheDocument();
    expect(screen.queryByText('Aktiviraj')).not.toBeInTheDocument();
    expect(screen.queryByText('Otpis')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /imovina\/novi/ })).not.toBeInTheDocument();
  });

  it('shows the empty register state', async () => {
    fetchFixedAssets.mockResolvedValue({ count: 0, page: 1, page_size: 20, results: [] });
    render(<FixedAssetList slug="finestar" />);
    await waitFor(() => {
      expect(screen.getByText('Nema imovine za odabrani filter.')).toBeInTheDocument();
    });
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('Assets write surface', () => {
  it('has no write routes or write HTTP in assets UI and client', () => {
    const roots = [
      join(process.cwd(), 'src/components/assets'),
      join(process.cwd(), 'src/app/t/[slug]/imovina'),
    ];
    const files = [
      join(process.cwd(), 'src/lib/assets.ts'),
      ...roots.flatMap((dir) => walk(dir)),
    ];
    const write = /method:\s*['"](?:POST|PATCH|PUT|DELETE)['"]|\/imovina\/novi/;
    for (const file of files) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(write);
    }
  });
});
