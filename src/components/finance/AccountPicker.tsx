'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  formatAccountOption,
  type AccountRef,
  type ChartOfAccountsList,
} from '@/lib/expensePosting';

export const ACCOUNT_PICKER_DEBOUNCE_MS = 250;

type Props = {
  label: string;
  value: AccountRef | null;
  onChange: (account: AccountRef | null) => void;
  search: (term: string, signal: AbortSignal) => Promise<ChartOfAccountsList>;
  placeholder?: string;
  disabled?: boolean;
};

function displayLabel(account: AccountRef | null): string {
  return account ? formatAccountOption(account) : '';
}

export function AccountPicker({
  label,
  value,
  onChange,
  search,
  placeholder = 'Zadano konto vrste',
  disabled = false,
}: Props) {
  const listboxId = useId();
  const inputId = useId();
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const [searchText, setSearchText] = useState(displayLabel(value));
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<AccountRef[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const trimmed = searchText.trim();
  const canSearch = trimmed.length >= 1;

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setSearchText(displayLabel(value));
  }, [value]);

  useEffect(() => {
    if (disabled || !open || !canSearch) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    const handle = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(false);
      search(trimmed, controller.signal)
        .then((payload) => {
          if (seq !== requestSeq.current) return;
          setResults(payload.results);
          setTotalCount(payload.count);
          setHighlight(payload.results.length > 0 ? 0 : -1);
          setLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted || seq !== requestSeq.current) return;
          setResults([]);
          setTotalCount(0);
          setHighlight(-1);
          setError(true);
          setLoading(false);
          void err;
        });
    }, ACCOUNT_PICKER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [canSearch, disabled, open, search, trimmed]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function restoreCommitted() {
    setSearchText(displayLabel(value));
    setOpen(false);
    setResults([]);
    setTotalCount(0);
    setError(false);
    setHighlight(-1);
    setLoading(false);
  }

  function commit(account: AccountRef) {
    onChange(account);
    setSearchText(formatAccountOption(account));
    setOpen(false);
    setResults([]);
    setTotalCount(0);
    setError(false);
    setHighlight(-1);
    setLoading(false);
  }

  function clear() {
    onChange(null);
    setSearchText('');
    setOpen(false);
    setResults([]);
    setTotalCount(0);
    setError(false);
    setHighlight(-1);
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      restoreCommitted();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (results.length === 0) return;
      setHighlight((current) => (current + 1) % results.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open || results.length === 0) return;
      setHighlight((current) => (current <= 0 ? results.length - 1 : current - 1));
      return;
    }
    if (event.key === 'Enter' && open && highlight >= 0 && results[highlight]) {
      event.preventDefault();
      commit(results[highlight]);
    }
  }

  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const showList = open && canSearch;
  const truncated = totalCount > results.length;
  const empty = showList && !loading && !error && results.length === 0;

  return (
    <div className="account-picker" ref={rootRef}>
      <label id={labelId} htmlFor={inputId}>
        {label}
      </label>
      <div className="account-picker-control">
        <input
          id={inputId}
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={highlight >= 0 && showList ? optionId(highlight) : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => {
            if (canSearch) setOpen(true);
          }}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && rootRef.current?.contains(next)) return;
            restoreCommitted();
          }}
          onKeyDown={handleKeyDown}
        />
        {value ? (
          <button
            type="button"
            className="account-picker-clear"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
          >
            Očisti
          </button>
        ) : null}
      </div>
      <div
        id={listboxId}
        role="listbox"
        className="account-picker-list"
        hidden={!showList}
        aria-labelledby={labelId}
      >
        {loading ? (
          <div className="account-picker-status" role="status">
            Tražim…
          </div>
        ) : null}
        {error ? (
          <div className="account-picker-status is-error" role="status">
            Greška pri dohvaćanju konta
          </div>
        ) : null}
        {empty ? (
          <div className="account-picker-status" role="status">
            Nema rezultata
          </div>
        ) : null}
        {!loading && !error
          ? results.map((row, index) => (
              <div
                key={row.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === highlight}
                className={index === highlight ? 'is-active' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(row)}
                onMouseEnter={() => setHighlight(index)}
              >
                {formatAccountOption(row)}
              </div>
            ))
          : null}
        {truncated && !loading && !error ? (
          <div className="account-picker-hint" role="status">
            Prikazano prvih {results.length} od {totalCount} — suzite pretragu
          </div>
        ) : null}
      </div>
    </div>
  );
}
