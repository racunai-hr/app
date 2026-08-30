'use client';

import {
  accountSourceLabel,
  formatAccountOption,
  type AccountRef,
  type ExpenseCategory,
} from '@/lib/expensePosting';
import { formatCostCenterOption, type CostCenterRef } from '@/lib/costCenters';

type Props = {
  categories: ExpenseCategory[];
  accounts: AccountRef[];
  categoryId: number | null;
  expenseAccountId: number | null;
  costCenters?: CostCenterRef[];
  costCenterId?: number | null;
  disabled?: boolean;
  allowEmptyCategory?: boolean;
  accountSource?: string | null;
  remember?: boolean;
  showRemember?: boolean;
  lockedMessage?: string | null;
  onCategoryChange: (categoryId: number | null) => void;
  onAccountChange: (expenseAccountId: number | null) => void;
  onCostCenterChange?: (costCenterId: number | null) => void;
  onRememberChange?: (remember: boolean) => void;
};

export function ExpensePostingInputs({
  categories,
  accounts,
  categoryId,
  expenseAccountId,
  costCenters = [],
  costCenterId = null,
  disabled = false,
  allowEmptyCategory = false,
  accountSource,
  remember = false,
  showRemember = false,
  lockedMessage,
  onCategoryChange,
  onAccountChange,
  onCostCenterChange,
  onRememberChange,
}: Props) {
  const selected = categories.find((row) => row.id === categoryId) || null;
  const defaultHint = selected?.default_account
    ? formatAccountOption(selected.default_account)
    : null;

  return (
    <div className="expense-posting-fields">
      {lockedMessage ? (
        <p className="posting-locked-note" role="status">
          {lockedMessage}
        </p>
      ) : null}
      <label>
        Vrsta troška
        <select
          value={categoryId ?? ''}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            onCategoryChange(value === '' ? null : Number(value));
          }}
        >
          {allowEmptyCategory ? (
            <option value="">Predloži pri potvrdi</option>
          ) : (
            <option value="" disabled>
              Odaberite vrstu
            </option>
          )}
          {categories.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Konto rashoda
        <select
          value={expenseAccountId ?? ''}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            onAccountChange(value === '' ? null : Number(value));
          }}
        >
          <option value="">
            {defaultHint ? `Zadano konto vrste (${defaultHint})` : 'Zadano konto vrste'}
          </option>
          {accounts.map((row) => (
            <option key={row.id} value={row.id}>
              {formatAccountOption(row)}
            </option>
          ))}
        </select>
      </label>
      {onCostCenterChange ? (
        <label>
          Mjesto troška
          <select
            value={costCenterId ?? ''}
            disabled={disabled}
            onChange={(event) => {
              const value = event.target.value;
              onCostCenterChange(value === '' ? null : Number(value));
            }}
          >
            <option value="">Zadano (vrsta troška / vozilo)</option>
            {costCenters
              .filter((row) => row.is_bookable !== false)
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {formatCostCenterOption(row)}
                </option>
              ))}
          </select>
        </label>
      ) : null}
      {accountSource ? (
        <p className="muted-inline">Izvor konta: {accountSourceLabel(accountSource)}</p>
      ) : null}
      {showRemember ? (
        <label className="ocr-override">
          <input
            type="checkbox"
            checked={remember}
            disabled={disabled}
            onChange={(event) => onRememberChange?.(event.target.checked)}
          />
          Zapamti vrstu troška za ovog partnera
        </label>
      ) : null}
    </div>
  );
}
