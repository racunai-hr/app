import type { DocumentDetail } from './documents';

/** Subledger states that warrant a banking reconcile CTA (Faza 3a). */
export const BANKING_RECONCILE_OPEN_SUBLEDGER_STATES = new Set(['open', 'partial']);

type BankCloseDocument = Pick<DocumentDetail, 'direction' | 'subledger' | 'subledger_context'>;

export function subledgerStateForBankClose(detail: BankCloseDocument): string | null {
  const fromContext = detail.subledger_context?.state;
  if (fromContext) return fromContext;
  const fromBlock = detail.subledger.state.value;
  return fromBlock != null ? String(fromBlock) : null;
}

export function subledgerItemIdForBanking(
  detail: Pick<DocumentDetail, 'subledger_context'>,
): number | null {
  const id = detail.subledger_context?.item_id;
  return typeof id === 'number' && id > 0 ? id : null;
}

export function shouldShowBankCloseCta(detail: BankCloseDocument): boolean {
  if (detail.direction === 'deposit') return false;
  const state = subledgerStateForBankClose(detail);
  return state != null && BANKING_RECONCILE_OPEN_SUBLEDGER_STATES.has(state);
}

/** Deep link to Banking reconcile (ADR-0025 write path). */
export function bankingReconcileHref(slug: string, subledgerItemId?: number | null): string {
  const params = new URLSearchParams({ match_status: 'unmatched' });
  if (subledgerItemId != null && subledgerItemId > 0) {
    params.set('subledger_item', String(subledgerItemId));
  }
  return `/t/${slug}/bankarstvo/uskladivanje?${params.toString()}`;
}

export function documentBankCloseHref(
  slug: string,
  detail: Pick<DocumentDetail, 'subledger_context'>,
): string {
  return bankingReconcileHref(slug, subledgerItemIdForBanking(detail));
}

export type ReconcileCandidateSource = {
  source_type: string;
  source_id: number;
  source_label: string;
};

export type ReconcileDocumentLink = {
  href: string;
  label: string;
};

/** Post-reconcile navigation back to source document (Faza 3a slice 4). */
export function reconcileCandidateDocumentLink(
  slug: string,
  candidate: ReconcileCandidateSource,
): ReconcileDocumentLink | null {
  if (!candidate.source_id) return null;
  switch (candidate.source_type) {
    case 'expense':
      return {
        href: `/t/${slug}/dokumenti/ulazni/${candidate.source_id}`,
        label: candidate.source_label || 'Ulazni dokument',
      };
    case 'invoice':
      return {
        href: `/t/${slug}/dokumenti/izlazni/${candidate.source_id}`,
        label: candidate.source_label || 'Izlazni dokument',
      };
    default:
      return null;
  }
}

export function parseSubledgerItemParam(params: URLSearchParams): number | null {
  const raw = Number(params.get('subledger_item') || '');
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

export type SubledgerItemRow = {
  item_id: number;
  status: string;
  source_type: string;
  source_id: number;
  source_label: string;
};

export function shouldShowSubledgerItemBankClose(status: string | null | undefined): boolean {
  return status != null && BANKING_RECONCILE_OPEN_SUBLEDGER_STATES.has(status);
}

export function subledgerItemBankCloseHref(slug: string, itemId: number): string {
  return bankingReconcileHref(slug, itemId);
}

export function subledgerItemDocumentLink(
  slug: string,
  row: ReconcileCandidateSource,
): ReconcileDocumentLink | null {
  return reconcileCandidateDocumentLink(slug, row);
}
