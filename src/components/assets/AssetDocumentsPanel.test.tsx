import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchDocuments = vi.fn();

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocuments: (...args: unknown[]) => fetchDocuments(...args),
  };
});

import { sampleDocument } from '@/test/documentFixtures';

import { AssetDocumentsPanel } from './AssetDocumentsPanel';

describe('AssetDocumentsPanel', () => {
  beforeEach(() => {
    fetchDocuments.mockReset();
    fetchDocuments.mockResolvedValue({
      count: 1,
      results: [
        sampleDocument({
          id: 9,
          direction: 'official',
          internal_number: 'UP/I-410-22/26-09/49557',
        }),
      ],
    });
  });

  it('loads documents with the fixed_asset filter and links them', async () => {
    render(
      <AssetDocumentsPanel slug="finestar" origin="https://api.test" token="t" assetId={4} />,
    );
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Detalji računa Službeni · UP/I-410-22/26-09/49557' }),
      ).toBeInTheDocument(),
    );
    expect(fetchDocuments).toHaveBeenCalledWith('https://api.test', 't', {
      fixed_asset: 4,
      page_size: 50,
    });
    expect(
      screen.getByRole('link', { name: 'Detalji računa Službeni · UP/I-410-22/26-09/49557' }),
    ).toHaveAttribute('href', '/t/finestar/dokumenti/sluzbeni/9');
  });
});
