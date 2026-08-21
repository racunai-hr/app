import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDocumentDetail } from '@/test/documentFixtures';

const fetchDocument = vi.fn();
const downloadDocumentPdf = vi.fn();
const downloadDocumentUbl = vi.fn();

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
}));

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocument: (...args: unknown[]) => fetchDocument(...args),
    downloadDocumentPdf: (...args: unknown[]) => downloadDocumentPdf(...args),
    downloadDocumentUbl: (...args: unknown[]) => downloadDocumentUbl(...args),
  };
});

import { DocumentDetailPanel } from './DocumentDetailPanel';

describe('DocumentDetailPanel', () => {
  beforeEach(() => {
    fetchDocument.mockReset();
    downloadDocumentPdf.mockReset();
    downloadDocumentUbl.mockReset();
  });

  it('renders amounts and UBL button only when ubl_available', async () => {
    fetchDocument.mockResolvedValue(
      sampleDocumentDetail({
        direction: 'incoming',
        id: 30,
        internal_number: 'T-30',
        source_number: '26210-H120-5154',
        amounts: {
          currency: 'EUR',
          net: '364.71',
          vat: '7.49',
          gross: '372.20',
          fx_rate: { value: null, reason: 'not_recorded', source: null },
        },
        ubl_available: true,
        pdf_available: false,
      }),
    );

    render(
      <DocumentDetailPanel
        selection={{ direction: 'incoming', id: 30 }}
        origin="https://finestar-stage.racunai.hr"
        onClose={() => undefined}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('372,20 EUR')).toBeInTheDocument();
    });
    expect(screen.getByText('7,49 EUR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preuzmi UBL' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Preuzmi PDF' })).toBeNull();
  });

  it('hides evidence actions when both flags are false', async () => {
    fetchDocument.mockResolvedValue(
      sampleDocumentDetail({ ubl_available: false, pdf_available: false }),
    );
    render(
      <DocumentDetailPanel
        selection={{ direction: 'incoming', id: 1 }}
        origin="https://example.test"
        onClose={() => undefined}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('125,00 EUR')).toBeInTheDocument();
    });
    expect(screen.queryByText('Dokazi')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Preuzmi UBL' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Preuzmi PDF' })).toBeNull();
  });

  it('calls PDF download only when pdf_available', async () => {
    fetchDocument.mockResolvedValue(
      sampleDocumentDetail({ ubl_available: false, pdf_available: true }),
    );
    downloadDocumentPdf.mockResolvedValue(undefined);
    render(
      <DocumentDetailPanel
        selection={{ direction: 'outgoing', id: 4 }}
        origin="https://example.test"
        onClose={() => undefined}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Preuzmi PDF' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preuzmi PDF' }));
    await waitFor(() => {
      expect(downloadDocumentPdf).toHaveBeenCalledWith(
        'https://example.test',
        'token',
        'outgoing',
        4,
      );
    });
  });

  it('renders page mode with back link and expanded sections', async () => {
    fetchDocument.mockResolvedValue(
      sampleDocumentDetail({
        direction: 'outgoing',
        id: 4,
        internal_number: '2026-0001',
        journal_lines: [
          {
            account_code: '1200',
            account_name: 'Kupci',
            debit: '1000.00',
            credit: '0.00',
            description: 'AR',
          },
        ],
        payments: [
          {
            id: 1,
            payment_number: 'P-1',
            amount: '1000.00',
            payment_date: '2026-07-10',
            payment_method: 'bank',
            status: 'completed',
          },
        ],
      }),
    );
    render(
      <DocumentDetailPanel
        mode="page"
        slug="finestar"
        selection={{ direction: 'outgoing', id: 4 }}
        origin="https://example.test"
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '2026-0001' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Natrag na saldakonte' })).toHaveAttribute(
      'href',
      '/t/finestar/saldakonti?direction=outgoing',
    );
    expect(screen.getByRole('heading', { name: 'Stavke temeljnice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plaćanja' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zatvori' })).toBeNull();
  });
});
