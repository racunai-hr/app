'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/lib/api';
import { subledgerItemDocumentLink } from '@/lib/bankingReconcile';
import { CLOSING_KIND_LABELS, STATEMENT_DIRECTION_TABS } from '@/lib/documentLabels';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';
import {
  mergePartnerLedgerQuery,
  parsePartnerLedgerQuery,
  partnerLedgerUrl,
  patchLedgerDirection,
  patchLedgerYear,
  type PartnerLedgerDirection,
} from '@/lib/partnerLedgerQuery';
import {
  fetchPartnerStatement,
  type PartnerStatement,
  type PartnerStatementRow,
} from '@/lib/partners';

type Props = {
  slug: string;
  origin: string;
  token: string;
  partnerId: number;
  partnerType: string;
};

function rowTypeLabel(row: PartnerStatementRow): string {
  if (row.kind === 'opening_balance') {
    return row.label || 'Početno stanje';
  }
  if (row.kind === 'obligation') {
    return row.document_type_label || 'Obveza';
  }
  if (row.kind === 'allocation') {
    return CLOSING_KIND_LABELS[row.closing_kind || ''] || 'Plaćanje';
  }
  return row.kind;
}

function directionLabel(direction: string | undefined): string {
  if (direction === 'receivable') return 'Potraživanje';
  if (direction === 'payable') return 'Obveza';
  return '—';
}

function amountCell(value: string): string {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed === 0) return '—';
  return formatHrAmount(value);
}

export function PartnerLedgerPanel({ slug, origin, token, partnerId, partnerType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(
    () => parsePartnerLedgerQuery(searchParams, partnerType),
    [searchKey, searchParams, partnerType],
  );
  const [data, setData] = useState<PartnerStatement | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const activeYear = data?.year;
  const availableYears = useMemo(() => {
    if (!data?.available_years?.length) return [];
    return [...data.available_years].sort((a, b) => b - a);
  }, [data?.available_years]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const yearParam = query.year ? Number(query.year) : undefined;
    fetchPartnerStatement(origin, token, partnerId, {
      year: yearParam,
      direction: query.direction,
    })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        const urlYear = query.year ? Number(query.year) : null;
        if (urlYear !== payload.year) {
          router.replace(
            partnerLedgerUrl(
              slug,
              partnerId,
              mergePartnerLedgerQuery(query, { year: String(payload.year) }),
            ),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Kartica partnera nije učitana.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, token, partnerId, query.year, query.direction, slug, router]);

  function replaceQuery(patch: Partial<{ year: string; direction: PartnerLedgerDirection }>) {
    router.replace(
      partnerLedgerUrl(slug, partnerId, mergePartnerLedgerQuery(query, patch)),
    );
  }

  const showDirectionColumn = query.direction === 'all';
  const hasRows = (data?.rows.length ?? 0) > 0;
  const onlyZeroOpening =
    data?.rows.length === 1 && data.rows[0].kind === 'opening_balance' &&
    data.rows[0].balance === '0.00';

  return (
    <section style={{ marginBottom: '1.5rem' }}>
      <h2 className="partner-section-title">Kartica partnera</h2>
      {error ? <div className="error">{error}</div> : null}

      <nav className="tabs" aria-label="Smjer kartice" style={{ marginBottom: '0.75rem' }}>
        {STATEMENT_DIRECTION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={query.direction === tab.value ? 'tab active' : 'tab'}
            aria-current={query.direction === tab.value ? 'page' : undefined}
            onClick={() => replaceQuery(patchLedgerDirection(query, tab.value))}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {availableYears.length > 0 ? (
        <nav className="tabs" aria-label="Godina kartice" style={{ marginBottom: '0.75rem' }}>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              className={activeYear === year ? 'tab active' : 'tab'}
              aria-current={activeYear === year ? 'page' : undefined}
              onClick={() => replaceQuery(patchLedgerYear(query, year))}
            >
              {year}
            </button>
          ))}
        </nav>
      ) : null}

      {loading ? <div className="loading">Učitavanje…</div> : null}

      {!loading && !hasRows ? (
        <p role="status">
          Nema knjiženih događaja{activeYear ? ` za ${activeYear}` : ''}.
        </p>
      ) : null}

      {!loading && hasRows && onlyZeroOpening ? (
        <p role="status">
          Nema knjiženih događaja za {activeYear}.
        </p>
      ) : null}

      {!loading && hasRows && !onlyZeroOpening ? (
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Vrsta</th>
                {showDirectionColumn ? <th>Smjer</th> : null}
                <th>Dokument</th>
                <th>Duguje</th>
                <th>Potražuje</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((row, index) => {
                const documentLink =
                  row.source_type && row.source_id
                    ? subledgerItemDocumentLink(slug, {
                        source_type: row.source_type,
                        source_id: row.source_id,
                        source_label: row.source_label || '',
                      })
                    : null;
                const documentLabel = row.source_label || '—';
                return (
                  <tr key={`${row.kind}-${row.date}-${row.journal_entry_id ?? index}`}>
                    <td>{formatHrInputDate(row.date)}</td>
                    <td>{rowTypeLabel(row)}</td>
                    {showDirectionColumn ? <td>{directionLabel(row.direction)}</td> : null}
                    <td>
                      {documentLink ? (
                        <Link href={documentLink.href}>{documentLink.label}</Link>
                      ) : (
                        documentLabel
                      )}
                    </td>
                    <td>{amountCell(row.debit)}</td>
                    <td>{amountCell(row.credit)}</td>
                    <td>{formatHrAmount(row.balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
