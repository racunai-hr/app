import { describe, expect, it } from 'vitest';

import {
  documentListUrl,
  documentsListHref,
  dokumentiRedirectUrl,
  DOCUMENTS_OPERATIVE_HREFS,
  isDocumentsSubnavActive,
  isOperativeSubnavActive,
  parseDocumentListQuery,
  patchDirectionTab,
  patchForDocumentsSubnav,
  patchForOperativeSubnav,
  saldakontiToDokumentiUrl,
} from '@/lib/documentListQuery';

describe('documentListQuery', () => {
  it('parses direction and view independently', () => {
    const query = parseDocumentListQuery(
      new URLSearchParams('direction=incoming&view=attention&search=acme&page=2'),
    );
    expect(query.direction).toBe('incoming');
    expect(query.view).toBe('attention');
    expect(query.search).toBe('acme');
    expect(query.page).toBe(2);
  });

  it('keeps view when subnav switches direction only', () => {
    const current = parseDocumentListQuery(new URLSearchParams('view=attention&search=acme'));
    const next = patchForDocumentsSubnav(current, 'incoming');
    expect(next).toEqual({
      direction: 'incoming',
      view: 'attention',
      search: 'acme',
      year: '',
      month: '',
      status: '',
      date_from: '',
      date_to: '',
      page: 1,
      page_size: 20,
    });
  });

  it('clears direction but keeps view when Svi dokumenti is chosen with a direction set', () => {
    const current = parseDocumentListQuery(new URLSearchParams('direction=outgoing&view=attention'));
    const next = patchForDocumentsSubnav(current, 'all');
    expect(next.direction).toBe('');
    expect(next.view).toBe('attention');
    expect(next.page).toBe(1);
  });

  it('clears view when Svi dokumenti is chosen without direction but with view', () => {
    const current = parseDocumentListQuery(new URLSearchParams('view=attention&search=acme'));
    const next = patchForDocumentsSubnav(current, 'all');
    expect(next.direction).toBe('');
    expect(next.view).toBe('');
    expect(next.search).toBe('acme');
  });

  it('keeps direction when Zahtijeva pažnju is chosen', () => {
    const current = parseDocumentListQuery(new URLSearchParams('direction=incoming&search=acme'));
    const next = patchForDocumentsSubnav(current, 'attention');
    expect(next.direction).toBe('incoming');
    expect(next.view).toBe('attention');
    expect(next.search).toBe('acme');
  });

  it('direction tabs change only direction and page', () => {
    const current = parseDocumentListQuery(new URLSearchParams('view=attention&search=acme&page=3'));
    const next = patchDirectionTab(current, 'deposit');
    expect(next.direction).toBe('deposit');
    expect(next.view).toBe('attention');
    expect(next.search).toBe('acme');
    expect(next.page).toBe(1);
  });

  it('builds dokumenti URLs with orthogonal query params', () => {
    const url = documentListUrl('finestar', 'dokumenti', {
      direction: 'incoming',
      view: 'attention',
      search: 'acme',
      page: 1,
      page_size: 20,
    });
    expect(url).toBe('/t/finestar/dokumenti?direction=incoming&view=attention&search=acme');
  });

  it('marks subnav presets from direction and view independently', () => {
    const incomingAttention = parseDocumentListQuery(
      new URLSearchParams('direction=incoming&view=attention'),
    );
    expect(isDocumentsSubnavActive(incomingAttention, 'incoming')).toBe(true);
    expect(isDocumentsSubnavActive(incomingAttention, 'attention')).toBe(true);
    expect(isDocumentsSubnavActive(incomingAttention, 'all')).toBe(false);
    expect(isDocumentsSubnavActive(incomingAttention, 'outgoing')).toBe(false);

    const deposit = parseDocumentListQuery(new URLSearchParams('direction=deposit&view=attention'));
    expect(isDocumentsSubnavActive(deposit, 'all')).toBe(false);
    expect(isDocumentsSubnavActive(deposit, 'incoming')).toBe(false);
    expect(isDocumentsSubnavActive(deposit, 'attention')).toBe(true);

    const partiallyPaid = parseDocumentListQuery(new URLSearchParams('view=partially_paid'));
    expect(isDocumentsSubnavActive(partiallyPaid, 'all')).toBe(false);
    expect(isOperativeSubnavActive(partiallyPaid, 'partially_paid')).toBe(true);
  });

  it('applies operative subnav patches from SYSTEM_VIEWS', () => {
    const current = parseDocumentListQuery(new URLSearchParams('search=acme&page=3'));
    expect(patchForOperativeSubnav(current, 'unpaid_receivables')).toEqual({
      ...current,
      direction: 'outgoing',
      view: 'unpaid_outgoing',
      page: 1,
    });
    expect(patchForOperativeSubnav(current, 'partially_paid')).toEqual({
      ...current,
      direction: '',
      view: 'partially_paid',
      page: 1,
    });
  });

  it('clears operative view when browse direction changes', () => {
    const current = parseDocumentListQuery(
      new URLSearchParams('direction=outgoing&view=unpaid_outgoing&search=acme'),
    );
    const next = patchForDocumentsSubnav(current, 'incoming');
    expect(next.direction).toBe('incoming');
    expect(next.view).toBe('');
    expect(next.search).toBe('acme');
  });

  describe('saldakontiToDokumentiUrl', () => {
    it('redirects bare saldakonti path to dokumenti', () => {
      expect(saldakontiToDokumentiUrl('finestar', {})).toBe('/t/finestar/dokumenti');
    });

    it('preserves full query string on redirect', () => {
      expect(
        saldakontiToDokumentiUrl('finestar', {
          direction: 'incoming',
          view: 'attention',
          search: 'acme',
        }),
      ).toBe('/t/finestar/dokumenti?direction=incoming&view=attention&search=acme');
    });

    it('preserves pagination query on redirect', () => {
      expect(saldakontiToDokumentiUrl('finestar', { page: '2' })).toBe(
        '/t/finestar/dokumenti?page=2',
      );
    });

    it('preserves multi-value query params on redirect', () => {
      const url = saldakontiToDokumentiUrl('finestar', { status: ['open', 'overdue'] });
      expect(url).toBe('/t/finestar/dokumenti?status=open&status=overdue');
      expect(new URLSearchParams(url.split('?')[1]!).getAll('status')).toEqual([
        'open',
        'overdue',
      ]);
    });

    it('delegates to the same implementation as dokumentiRedirectUrl', () => {
      const params = { direction: 'outgoing', search: 'sam' };
      expect(saldakontiToDokumentiUrl('finestar', params)).toBe(
        dokumentiRedirectUrl('finestar', params),
      );
    });
  });

  describe('documentsListHref', () => {
    it('builds dokumenti URLs from partial query', () => {
      expect(
        documentsListHref('finestar', { direction: 'incoming', view: 'incoming_ready_to_pay' }),
      ).toBe('/t/finestar/dokumenti?direction=incoming&view=incoming_ready_to_pay');
    });

    it('exposes operative presets without saldakonti paths', () => {
      expect(DOCUMENTS_OPERATIVE_HREFS.outgoing('finestar')).toBe(
        '/t/finestar/dokumenti?direction=outgoing',
      );
      expect(DOCUMENTS_OPERATIVE_HREFS.incomingReadyToPay('finestar')).toBe(
        '/t/finestar/dokumenti?direction=incoming&view=incoming_ready_to_pay',
      );
    });
  });
});
