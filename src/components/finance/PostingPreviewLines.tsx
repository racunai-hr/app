'use client';

import { costCenterLabel } from '@/lib/costCenters';
import { formatHrMoney } from '@/lib/formatHr';
import {
  formatAccountOption,
  type ExpensePostingPreview,
} from '@/lib/expensePosting';

type Props = {
  preview: ExpensePostingPreview | null;
  currency?: string;
  emptyLabel?: string;
};

export function PostingPreviewLines({
  preview,
  currency = 'EUR',
  emptyLabel = 'Nema prijedloga knjiženja.',
}: Props) {
  const lines = preview?.lines ?? [];
  if (lines.length === 0) {
    return <p className="muted-inline">{emptyLabel}</p>;
  }
  return (
    <div className="table-wrap incoming-table-wrap">
      <table className="docs-table posting-preview-table">
        <thead>
          <tr>
            <th>Polje</th>
            <th>Opis</th>
            <th>Duguje</th>
            <th>Potražuje</th>
            <th>MT</th>
            <th>Iznos</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.amount_field}-${line.debit.code}-${index}`}>
              <td>{line.amount_field}</td>
              <td>{line.description || '—'}</td>
              <td>{formatAccountOption(line.debit)}</td>
              <td>{formatAccountOption(line.credit)}</td>
              <td>
                {costCenterLabel(
                  (line as { debit_cost_center?: { code: string; name: string } | null }).debit_cost_center
                  ?? (line as { credit_cost_center?: { code: string; name: string } | null }).credit_cost_center
                  ?? null,
                )}
              </td>
              <td className="cell-amount">{formatHrMoney(line.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
