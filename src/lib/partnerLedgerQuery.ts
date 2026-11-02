export type PartnerLedgerDirection = 'all' | 'receivable' | 'payable';

export type PartnerLedgerQuery = {
  year: string;
  direction: PartnerLedgerDirection;
};

const DEFAULT_QUERY: PartnerLedgerQuery = {
  year: '',
  direction: 'all',
};

export function defaultLedgerDirection(partnerType: string): PartnerLedgerDirection {
  switch (partnerType) {
    case 'customer':
      return 'receivable';
    case 'supplier':
      return 'payable';
    default:
      return 'all';
  }
}

export function parsePartnerLedgerQuery(
  params: URLSearchParams,
  partnerType: string,
): PartnerLedgerQuery {
  const direction = params.get('direction');
  const parsedDirection: PartnerLedgerDirection =
    direction === 'receivable' || direction === 'payable' || direction === 'all'
      ? direction
      : defaultLedgerDirection(partnerType);
  return {
    year: params.get('year') || '',
    direction: parsedDirection,
  };
}

export function mergePartnerLedgerQuery(
  current: PartnerLedgerQuery,
  patch: Partial<PartnerLedgerQuery>,
): PartnerLedgerQuery {
  return { ...current, ...patch };
}

export function serializePartnerLedgerQuery(query: PartnerLedgerQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.year) params.set('year', query.year);
  params.set('direction', query.direction);
  return params;
}

export function partnerLedgerUrl(
  slug: string,
  partnerId: number,
  query: PartnerLedgerQuery,
): string {
  const qs = serializePartnerLedgerQuery(query).toString();
  const path = `/t/${slug}/partneri/${partnerId}/saldakonto`;
  return qs ? `${path}?${qs}` : path;
}

export function patchLedgerYear(
  current: PartnerLedgerQuery,
  year: number,
): PartnerLedgerQuery {
  return mergePartnerLedgerQuery(current, { year: String(year) });
}

export function patchLedgerDirection(
  current: PartnerLedgerQuery,
  direction: PartnerLedgerDirection,
): PartnerLedgerQuery {
  return mergePartnerLedgerQuery(current, { direction });
}

export { DEFAULT_QUERY as EMPTY_PARTNER_LEDGER_QUERY };
