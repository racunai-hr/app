import { provenanceText, provenanceTone, type Provenance } from '@/lib/provenance';
import { statusLabel } from '@/lib/documentLabels';

type Props = {
  field: Provenance;
  label?: (value: NonNullable<Provenance['value']>) => string;
};

export function ProvenanceBadge({ field, label = statusLabel }: Props) {
  const tone = provenanceTone(field);
  const text = provenanceText(field, label);
  return (
    <span className={`badge badge-${tone}`} data-tone={tone}>
      {text}
    </span>
  );
}
