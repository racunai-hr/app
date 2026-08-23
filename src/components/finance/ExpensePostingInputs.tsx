'use client';

import {
  accountSourceLabel,
  formatAccountOption,
  type AccountRef,
  type ExpenseCategory,
} from '@/lib/expensePosting';

type Props = {
  categories: ExpenseCategory[];
  accounts: AccountRef[];
  categoryId: number | null;
  expenseAccountId: number | null;
  disabled?: boolean;
  allowEmptyCategory?: boolean;
  accountSource?: string | null;
  remember?: boolean;
  showRemember?: boolean;
  lockedMessage?: string | null;
  onCategoryChange: (categoryId: number | null) => void;
  onAccountChange: (expenseAccountId: number | null) => void;
  onRememberChange?: (remember: boolean) => void;
};

export function ExpensePostingInputs({
  categories,
  accounts,
  categoryId,
  expenseAccountId,
  disabled = false,
  allowEmptyCategory = false,
  accountSource,
  remember = false,
  showRemember = false,
  lockedMessage,
  onCategoryChange,
  onAccountChange,
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
