'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import type { OpenItemCandidate, TransactionDto } from '@/lib/banking';
import {
  MATCH_REASON_LABELS,
  SUBLEDGER_SOURCE_LABELS,
  labelOrRaw,
} from '@/lib/bankingLabels';
import { reconcileCandidateDocumentLink } from '@/lib/bankingReconcile';
import { formatHrAmount, formatHrInputDate, formatHrMoney } from '@/lib/formatHr';

type Props = {
  slug: string;
  transaction: TransactionDto;
  candidates: OpenItemCandidate[];
  loading: boolean;
  busy: boolean;
  highlightSubledgerItemId: number | null;
  onClose: () => void;
  onSearch: (q: string) => void;
  onConfirm: (item: OpenItemCandidate) => void;
};

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OpenItemPickerDialog({
  slug,
  transaction,
  candidates,
  loading,
  busy,
  highlightSubledgerItemId,
  onClose,
  onSearch,
  onConfirm,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const skipInitialSearch = useRef(true);
  useEffect(() => {
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }
    const handle = window.setTimeout(() => onSearch(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [onSearch, search]);

  useEffect(() => {
    if (highlightSubledgerItemId == null || candidates.length === 0) {
      return;
    }
    const node = document.getElementById(`subledger-item-${highlightSubledgerItemId}`);
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [candidates, highlightSubledgerItemId]);

  const counterparty = transaction.counterparty_name || '—';
  const pnb = transaction.reference ? `PNB ${transaction.reference}` : 'bez PNB';

  return (
    <div
      className="banking-picker-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="banking-picker-title"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="banking-picker-panel"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="banking-picker-head">
          <div>
            <h2 id="banking-picker-title">Odaberi otvorenu stavku</h2>
            <p className="banking-role-note">
              Transakcija #{transaction.id} · {formatHrInputDate(transaction.transaction_date)} ·{' '}
              {formatHrMoney(transaction.amount, transaction.currency)} · {counterparty} · {pnb}.
              Bankovni račun dolazi iz izvoda.
            </p>
          </div>
          <button
            type="button"
            className="banking-icon-btn"
            disabled={busy}
            onClick={onClose}
            title="Zatvori"
            aria-label="Zatvori odabir stavke"
          >
            <IconClose />
          </button>
        </div>

        <label className="filter-field banking-picker-search">
          <span>Traži partnera</span>
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Naziv, OIB…"
          />
        </label>

        {loading && <div className="loading">Učitavanje kandidata…</div>}
        {!loading && candidates.length === 0 && (
          <p className="table-empty">Nema otvorenih stavki istog iznosa i smjera.</p>
        )}
        {candidates.length > 0 && (
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Dokument</th>
                  <th>Otvoreno</th>
                  <th>Podudaranje</th>
                  <th className="banking-col-action">Akcija</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((item) => {
                  const highlighted =
                    highlightSubledgerItemId != null && item.item_id === highlightSubledgerItemId;
                  const documentLink = reconcileCandidateDocumentLink(slug, item);
                  return (
                    <tr
                      key={item.item_id}
                      id={highlighted ? `subledger-item-${item.item_id}` : undefined}
                      className={highlighted ? 'banking-row-active' : undefined}
                    >
                      <td>{item.partner_name || '—'}</td>
                      <td>
                        <div className="cell-stack">
                          <span>
                            {labelOrRaw(SUBLEDGER_SOURCE_LABELS, item.source_type)} ·{' '}
                            {item.source_label}
                          </span>
                          {documentLink ? (
                            <Link className="banking-je-link" href={documentLink.href}>
                              Otvori dokument
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td>{formatHrAmount(item.open_amount)}</td>
                      <td>
                        <div className="banking-picker-reasons">
                          {item.recommended ? (
                            <span className="badge badge-success">Preporučeno</span>
                          ) : null}
                          {item.match_reasons.map((reason) => (
                            <span key={reason} className="banking-picker-reason">
                              {labelOrRaw(MATCH_REASON_LABELS, reason)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="banking-col-action">
                        <button
                          type="button"
                          className="banking-action-btn"
                          disabled={busy}
                          onClick={() => onConfirm(item)}
                          title={item.action_label}
                        >
                          <IconCheck />
                          <span>{item.action_label}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
