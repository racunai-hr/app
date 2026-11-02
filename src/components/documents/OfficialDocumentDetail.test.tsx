import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMe } from '@/lib/api';
import type { DocumentDetail } from '@/lib/documents';
import type { Provenance } from '@/lib/provenance';
import { sampleDocumentDetail } from '@/test/documentFixtures';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
  clearTokens: vi.fn(),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    fetchMe: vi.fn(),
  };
});

const fetchDocument = vi.fn();
const downloadDocumentPdf = vi.fn();
const fetchDocumentPdfBlob = vi.fn();

vi.mock('@/lib/documents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents')>('@/lib/documents');
  return {
    ...actual,
    fetchDocument: (...args: unknown[]) => fetchDocument(...args),
    downloadDocumentPdf: (...args: unknown[]) => downloadDocumentPdf(...args),
    fetchDocumentPdfBlob: (...args: unknown[]) => fetchDocumentPdfBlob(...args),
  };
});

const fetchOfficialDocumentPostingProfiles = vi.fn();

vi.mock('@/lib/finance', async () => {
  const actual = await vi.importActual<typeof import('@/lib/finance')>('@/lib/finance');
  return {
    ...actual,
    fetchOfficialDocumentPostingProfiles: (...args: unknown[]) =>
      fetchOfficialDocumentPostingProfiles(...args),
  };
});

import { OfficialDocumentDetail } from './OfficialDocumentDetail';

function field<T>(value: T | null, reason: Provenance['reason'] = null): Provenance<T> {
  return { value, reason, source: value == null ? null : 'test' };
}

function sampleOfficialDetail(overrides: Partial<DocumentDetail> = {}): DocumentDetail {
  return sampleDocumentDetail({
    id: 1,
    kind: 'official',
    direction: 'official',
    source_number: 'UP/I-410-22/26-09/49557',
    partner_name: 'Ministarstvo financija — Carinska uprava, CU Šibenik',
    document_date: '2026-08-03',
    due_date: '2026-08-18',
    document_status: field('registered'),
    operational_status: field('posted'),
    description: 'WAUZZZF86RN003268',
    notes: 'Vrijednosna komponenta 7.051,54 € / ekološka komponenta 3.295,66 €',
    related_fixed_asset_id: 4,
    posting_profile_name: 'PPMV – nabava vozila',
    amounts: {
      currency: 'EUR',
      net: '10347.20',
      vat: '0.00',
      gross: '10347.20',
      fx_rate: field(null, 'not_applicable'),
    },
    posting: {
      state: field('posted'),
      entry_number: field('202608-0024'),
      entry_date: field('2026-08-03'),
      fiscal_period: field('2026-08'),
      fiscal_locked: field(false),
    },
    subledger: {
      state: field('open'),
      open_amount: field('10347.20'),
      original_amount: field('10347.20'),
      aging_bucket: field('1_30'),
      days: field(6),
    },
    ...overrides,
  });
}

const viewerMe = {
  user: { id: 1, username: 'viewer', email: '', is_superuser: false },
  tenants: [
    {
      slug: 'finestar',
      name: 'FineStar',
      role: 'viewer',
      is_default: true,
      admin_url: 'https://finestar-stage.racunai.hr/admin/',
    },
  ],
  platform_admin_url: 'https://admin.racunai.hr/admin/',
};

describe('OfficialDocumentDetail', () => {
  beforeEach(() => {
    fetchDocument.mockReset();
    downloadDocumentPdf.mockReset();
    fetchDocumentPdfBlob.mockReset();
    fetchOfficialDocumentPostingProfiles.mockReset();
    replace.mockReset();
    vi.mocked(fetchMe).mockResolvedValue(viewerMe as never);
    fetchOfficialDocumentPostingProfiles.mockResolvedValue([]);
  });

  it('uses incoming-dl cards, HR amount, verbatim notes and asset link', async () => {
    fetchDocument.mockResolvedValue(sampleOfficialDetail());
    const { container } = render(<OfficialDocumentDetail slug="finestar" documentId={1} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dokument' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Knjiženje' })).toBeInTheDocument();
    expect(container.querySelector('.docs-detail-list')).toBeNull();
    expect(container.querySelector('.incoming-dl')).not.toBeNull();
    expect(screen.getAllByText('10.347,20 EUR').length).toBeGreaterThan(0);
    expect(screen.getByText('WAUZZZF86RN003268')).toBeInTheDocument();

    const notes = container.querySelector('.incoming-notes');
    expect(notes?.textContent).toBe(
      'Vrijednosna komponenta 7.051,54 € / ekološka komponenta 3.295,66 €',
    );

    const asset = screen.getByRole('link', { name: 'Kartica #4' });
    expect(asset).toHaveAttribute('href', '/t/finestar/imovina/4');

    const posted = screen.getByText('Knjižen');
    expect(posted.className).toContain('badge-success');
  });

  it('does not render a success badge for null provenance', async () => {
    fetchDocument.mockResolvedValue(
      sampleOfficialDetail({
        operational_status: field(null, 'not_recorded'),
      }),
    );
    render(<OfficialDocumentDetail slug="finestar" documentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('nije evidentirano')).toBeInTheDocument();
    });

    const unknown = screen.getByText('nije evidentirano');
    expect(unknown).toHaveAttribute('data-tone', 'unknown');
    expect(unknown.className).not.toContain('badge-success');
  });
});
