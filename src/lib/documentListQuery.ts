import { buildDocumentQuery, type DocumentDirection, type DocumentListQuery } from './documents';

const EMPTY_DOCUMENT_LIST_QUERY: DocumentListQuery = {
  direction: '',
  view: '',
  search: '',
  year: '',
  month: '',
  status: '',
  date_from: '',
  date_to: '',
  page: 1,
  page_size: 20,
};

export function parseDocumentListQuery(params: URLSearchParams): DocumentListQuery {
  const direction = params.get('direction');
  return {
    direction:
      direction === 'incoming' || direction === 'outgoing' || direction === 'deposit'
        ? direction
        : '',
    view: params.get('view') || '',
    search: params.get('search') || '',
    year: params.get('year') || '',
    month: params.get('month') || '',
    status: params.get('status') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    page: Number(params.get('page') || '1') || 1,
    page_size: 20,
  };
}

export function serializeDocumentListUrlQuery(query: DocumentListQuery): URLSearchParams {
  const params = buildDocumentQuery(query, { includePage: false });
  if (query.page && query.page > 1) {
    params.set('page', String(query.page));
  }
  return params;
}

export function documentsListHref(slug: string, query: Partial<DocumentListQuery> = {}): string {
  return documentListUrl(slug, 'dokumenti', { ...EMPTY_DOCUMENT_LIST_QUERY, ...query });
}

/** Canonical hrefs for common operativni pregledi (Faza 3a). */
export const DOCUMENTS_OPERATIVE_HREFS = {
  incoming: (slug: string) => documentsListHref(slug, { direction: 'incoming' }),
  incomingReadyToPay: (slug: string) =>
    documentsListHref(slug, { direction: 'incoming', view: 'incoming_ready_to_pay' }),
  outgoing: (slug: string) => documentsListHref(slug, { direction: 'outgoing' }),
  deposit: (slug: string) => documentsListHref(slug, { direction: 'deposit' }),
  unpaidReceivables: (slug: string) =>
    documentsListHref(slug, { direction: 'outgoing', view: 'unpaid_outgoing' }),
  openPayables: (slug: string) =>
    documentsListHref(slug, { direction: 'incoming', view: 'incoming_ready_to_pay' }),
  partiallyPaid: (slug: string) => documentsListHref(slug, { view: 'partially_paid' }),
  overdueReceivables: (slug: string) =>
    documentsListHref(slug, { direction: 'outgoing', view: 'overdue_outgoing' }),
} as const;

export function documentListUrl(
  slug: string,
  basePath: 'dokumenti' | 'saldakonti',
  query: DocumentListQuery,
): string {
  const qs = serializeDocumentListUrlQuery(query).toString();
  const path = `/t/${slug}/${basePath}`;
  return qs ? `${path}?${qs}` : path;
}

export function mergeDocumentListQuery(
  current: DocumentListQuery,
  patch: Partial<DocumentListQuery>,
): DocumentListQuery {
  return { ...current, ...patch };
}

export type DocumentsSubnavPreset = 'all' | 'incoming' | 'outgoing' | 'attention';

export type DocumentsOperativePreset =
  | 'unpaid_receivables'
  | 'open_payables'
  | 'partially_paid'
  | 'overdue_receivables';

/** SYSTEM_VIEWS finance presets surfaced in Documents subnav (Faza 3a slice 2). */
export const DOCUMENTS_OPERATIVE_PRESETS: ReadonlyArray<{
  id: DocumentsOperativePreset;
  label: string;
  query: Pick<DocumentListQuery, 'direction' | 'view'>;
}> = [
  {
    id: 'unpaid_receivables',
    label: 'Otvorena potraživanja',
    query: { direction: 'outgoing', view: 'unpaid_outgoing' },
  },
  {
    id: 'open_payables',
    label: 'Otvorene obveze',
    query: { direction: 'incoming', view: 'incoming_ready_to_pay' },
  },
  {
    id: 'partially_paid',
    label: 'Djelomično plaćeno',
    query: { direction: '', view: 'partially_paid' },
  },
  {
    id: 'overdue_receivables',
    label: 'Dospjelo',
    query: { direction: 'outgoing', view: 'overdue_outgoing' },
  },
];

const OPERATIVE_SYSTEM_VIEWS = new Set(
  DOCUMENTS_OPERATIVE_PRESETS.map((preset) => preset.query.view).filter(Boolean),
);

function withoutOperativeView(view: string): string {
  return OPERATIVE_SYSTEM_VIEWS.has(view) ? '' : view;
}

export const DOCUMENTS_SUBNAV = [
  { id: 'all' as const, label: 'Svi dokumenti' },
  { id: 'incoming' as const, label: 'Ulazni' },
  { id: 'outgoing' as const, label: 'Izlazni' },
  { id: 'attention' as const, label: 'Zahtijeva pažnju' },
];

export function patchForDocumentsSubnav(
  current: DocumentListQuery,
  preset: DocumentsSubnavPreset,
): DocumentListQuery {
  const base = { ...current, page: 1 };
  switch (preset) {
    case 'incoming':
      return { ...base, direction: 'incoming', view: withoutOperativeView(base.view) };
    case 'outgoing':
      return { ...base, direction: 'outgoing', view: withoutOperativeView(base.view) };
    case 'attention':
      return { ...base, view: 'attention' };
    case 'all':
      if (base.direction) {
        return { ...base, direction: '', page: 1 };
      }
      if (base.view) {
        return { ...base, view: '', page: 1 };
      }
      return base;
  }
}

export function patchForOperativeSubnav(
  current: DocumentListQuery,
  preset: DocumentsOperativePreset,
): DocumentListQuery {
  const def = DOCUMENTS_OPERATIVE_PRESETS.find((row) => row.id === preset);
  if (!def) return { ...current, page: 1 };
  return {
    ...current,
    direction: def.query.direction,
    view: def.query.view,
    page: 1,
  };
}

export function isDocumentsSubnavActive(
  query: DocumentListQuery,
  preset: DocumentsSubnavPreset,
): boolean {
  switch (preset) {
    case 'all':
      return !query.direction && !query.view;
    case 'incoming':
      return query.direction === 'incoming';
    case 'outgoing':
      return query.direction === 'outgoing';
    case 'attention':
      return query.view === 'attention';
  }
}

export function isOperativeSubnavActive(
  query: DocumentListQuery,
  preset: DocumentsOperativePreset,
): boolean {
  const def = DOCUMENTS_OPERATIVE_PRESETS.find((row) => row.id === preset);
  if (!def) return false;
  if (query.view !== def.query.view) return false;
  if (def.query.direction) {
    return query.direction === def.query.direction;
  }
  return !query.direction;
}

export function patchDirectionTab(
  current: DocumentListQuery,
  direction: '' | DocumentDirection,
): DocumentListQuery {
  return { ...current, direction, page: 1 };
}

function buildDokumentiUrlFromSearchParams(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (typeof value === 'string') {
      params.append(key, value);
      continue;
    }
    for (const entry of value) {
      params.append(key, entry);
    }
  }
  const qs = params.toString();
  return qs ? `/t/${slug}/dokumenti?${qs}` : `/t/${slug}/dokumenti`;
}

/** Legacy `/saldakonti?...` bookmark → `/dokumenti?...` (Faza 3a). */
export function saldakontiToDokumentiUrl(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  return buildDokumentiUrlFromSearchParams(slug, searchParams);
}

/** @deprecated Use saldakontiToDokumentiUrl */
export function dokumentiRedirectUrl(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  return saldakontiToDokumentiUrl(slug, searchParams);
}
