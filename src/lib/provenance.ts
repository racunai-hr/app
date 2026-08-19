export const PROVENANCE_REASONS = ['not_recorded', 'not_provable', 'not_applicable'] as const;

export type ProvenanceReason = (typeof PROVENANCE_REASONS)[number];

export type Provenance<T = string | number | string[] | boolean | null> = {
  value: T | null;
  reason: ProvenanceReason | null;
  source: string | null;
};

export type ProvenanceTone = 'unknown' | 'neutral' | 'success' | 'warning' | 'danger';

export const REASON_LABELS: Record<ProvenanceReason, string> = {
  not_recorded: 'nije evidentirano',
  not_provable: 'nije dokazivo',
  not_applicable: 'nije primjenjivo',
};

const SUCCESS_VALUES = new Set(['paid', 'closed', 'posted', 'matched', 'accepted']);
const DANGER_VALUES = new Set([
  'overdue',
  'rejected',
  'eracun_rejected',
  'disputed',
  'failed',
  'cancelled',
]);
const WARNING_VALUES = new Set(['partial', 'partially_paid', 'draft', 'unmatched', 'not_posted']);

export function isKnown<T>(field: Provenance<T>): field is Provenance<T> & { value: T } {
  return field.value != null;
}

export function provenanceText(
  field: Provenance,
  valueLabel: (value: NonNullable<Provenance['value']>) => string = String,
): string {
  if (field.value == null) {
    return REASON_LABELS[field.reason ?? 'not_recorded'];
  }
  return valueLabel(field.value);
}

export function provenanceTone(field: Provenance): ProvenanceTone {
  if (field.value == null) {
    return 'unknown';
  }
  const raw = String(field.value);
  if (SUCCESS_VALUES.has(raw)) return 'success';
  if (DANGER_VALUES.has(raw)) return 'danger';
  if (WARNING_VALUES.has(raw)) return 'warning';
  return 'neutral';
}

export function assertNeverGreenFromNull(field: Provenance): boolean {
  return field.value != null || provenanceTone(field) !== 'success';
}
