'use client';

import { useCallback } from 'react';

import {
  accountSourceLabel,
  formatAccountOption,
  type AccountRef,
  type ChartOfAccountsList,
  type ExpenseCategory,
} from '@/lib/expensePosting';
import { formatCostCenterOption, type CostCenterRef } from '@/lib/costCenters';

import { AccountPicker } from './AccountPicker';

type Props = {
  categories: ExpenseCategory[];
  categoryId: number | null;
  expenseAccount: AccountRef | null;
  searchAccounts: (term: string, signal: AbortSignal) => Promise<ChartOfAccountsList>;
  costCenters?: CostCenterRef[];
  costCenterId?: number | null;
  disabled?: boolean;
  allowEmptyCategory?: boolean;
  accountSource?: string | null;
  remember?: boolean;
  showRemember?: boolean;
  lockedMessage?: string | null;
  hideCategory?: boolean;
  hideAccount?: boolean;
  onCategoryChange: (categoryId: number | null) => void;
  onAccountChange: (expenseAccount: AccountRef | null) => void;
  onCostCenterChange?: (costCenterId: number | null) => void;
  onRememberChange?: (remember: boolean) => void;
};

export function ExpensePostingInputs({
  categories,
  categoryId,
  expenseAccount,
  searchAccounts,
  costCenters = [],
  costCenterId = null,
  disabled = false,
  allowEmptyCategory = false,
  accountSource,
  remember = false,
  showRemember = false,
  lockedMessage,
  hideCategory = false,
  hideAccount = false,
  onCategoryChange,
  onAccountChange,
  onCostCenterChange,
  onRememberChange,
}: Props) {
  const selected = categories.find((row) => row.id === categoryId) || null;
  const defaultHint = selected?.default_account
    ? formatAccountOption(selected.default_account)
    : null;
  const search = useCallback(
    (term: string, signal: AbortSignal) => searchAccounts(term, signal),
    [searchAccounts],
  );

  return (
    <div className="expense-posting-fields">
      {lockedMessage ? (
        <p className="posting-locked-note" role="status">
          {lockedMessage}
        </p>
      ) : null}
      {hideCategory && hideAccount ? (
        <p className="muted-inline">
          Konto se bira na stavkama. Mjesto troška vrijedi za klasu 4; klasa 1 knjiži se bez
          mjesta troška.
        </p>
      ) : null}
      {hideCategory ? null : (
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
      )}
      {hideAccount ? null : (
        <AccountPicker
          label="Konto rashoda"
          value={expenseAccount}
          onChange={onAccountChange}
          search={search}
          placeholder={defaultHint ? `Zadano konto vrste (${defaultHint})` : 'Zadano konto vrste'}
          disabled={disabled}
        />
      )}
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
      {hideAccount || !accountSource ? null : (
        <p className="muted-inline">Izvor konta: {accountSourceLabel(accountSource)}</p>
      )}
      {showRemember && !hideCategory ? (
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
