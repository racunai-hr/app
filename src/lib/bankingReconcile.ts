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
