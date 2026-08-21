export const MATCH_STATUS_LABELS: Record<string, string> = {
  unmatched: 'Neusklađeno',
  suggested: 'Prijedlog',
  matched: 'Usklađeno',
};

export const STATEMENT_STATUS_LABELS: Record<string, string> = {
  imported: 'Uvezen',
  reconciled: 'Usklađen',
  archived: 'Arhiviran',
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  debit: 'Terećenje',
  credit: 'Odobrenje',
};

export const BALANCE_SOURCE_LABELS: Record<string, string> = {
  statement: 'Izvod',
  psd2: 'PSD2',
};

export const BALANCE_TYPE_LABELS: Record<string, string> = {
  'statement-closing': 'Završno stanje izvoda',
  booked: 'Knjiženo',
  available: 'Raspoloživo',
};

export const PAYMENT_ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Nacrt',
  submitted: 'Poslan',
  sca_required: 'SCA',
  authorised: 'Autoriziran',
  accepted: 'Prihvaćen',
  executed: 'Izvršen',
  rejected: 'Odbijen',
  failed: 'Neuspješan',
};

export function labelOrRaw(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return map[value] || value;
}

/** Visible capability note — backend remains authoritative. */
export function bankingRoleCapabilityNote(role: string): string {
  if (role === 'viewer') {
    return 'Imate pristup samo pregledu bankovnih podataka.';
  }
  if (role === 'accountant' || role === 'owner') {
    return 'Možete uvesti CAMT izvod. Sinkronizacija i usklađivanje još nisu dostupni u ovom sučelju.';
  }
  return 'Prikaz bankovnih podataka ovisi o ulozi na tvrtki; backend potvrđuje ovlasti.';
}
