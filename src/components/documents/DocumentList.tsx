'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Pagination } from '@/components/ui/Pagination';
import { usePageBounds } from '@/components/ui/usePageBounds';
import { ApiError, fetchMe, type TenantInfo } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { SYSTEM_VIEWS } from '@/lib/documentLabels';
import { formatHrDateTime } from '@/lib/formatHr';
import {
  documentListUrl,
  mergeDocumentListQuery,
  parseDocumentListQuery,
  patchDirectionTab,
} from '@/lib/documentListQuery';
import { canWritePurchasing } from '@/lib/purchasing';
import {
  exportDocuments,
  fetchDocuments,
  INCOMING_GROUP_DIRECTION,
  tenantApiOrigin,
  triggerBlobDownload,
  type DocumentDirection,
  type DocumentDirectionFilter,
  type DocumentListQuery,
  type DocumentListResponse,
} from '@/lib/documents';
import { pageCountOf } from '@/lib/pagination';

import { DateField } from './DateField';
import { DocumentDetailPanel } from './DocumentDetailPanel';
import { DocumentKpi } from './DocumentKpi';
import { DocumentTable } from './DocumentTable';
import { EracunSyncButton } from './EracunSyncButton';

const TABS: { value: DocumentDirectionFilter; label: string }[] = [
  { value: '', label: 'Svi' },
  { value: 'outgoing', label: 'Izlazni' },
  { value: INCOMING_GROUP_DIRECTION, label: 'Ulazni' },
  { value: 'deposit', label: 'Kaucije' },
];

function isDirectionTabActive(direction: DocumentDirectionFilter | undefined, tab: DocumentDirectionFilter): boolean {
  if (tab === INCOMING_GROUP_DIRECTION) {
    return direction === 'incoming' || direction === INCOMING_GROUP_DIRECTION;
  }
  return direction === tab;
}

type DocumentListProps = {
  slug: string;
  basePath?: 'dokumenti' | 'saldakonti';
  showHeader?: boolean;
};

export function DocumentList({
  slug,
  basePath = 'dokumenti',
  showHeader = true,
}: DocumentListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = useMemo(() => parseDocumentListQuery(searchParams), [searchKey, searchParams]);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [data, setData] = useState<DocumentListResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [selection, setSelection] = useState<{
    direction: DocumentDirection;
    id: number;
  } | null>(null);

  const replaceQuery = useCallback(
    (next: Partial<DocumentListQuery>) => {
      router.replace(documentListUrl(slug, basePath, mergeDocumentListQuery(query, next)));
    },
    [basePath, query, router, slug],
  );
  const onPage = useCallback((page: number) => replaceQuery({ page }), [replaceQuery]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      router.replace('/');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMe(token)
      .then((me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) {
          throw new ApiError('Tvrtka nije pronađena.', 404);
        }
        if (cancelled) return;
        setTenant(found);
        return fetchDocuments(tenantApiOrigin(found.admin_url), token, query);
      })
      .then((list) => {
        if (!cancelled && list) setData(list);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Lista se nije učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // URL query is the source of truth; avoid depending on router identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchKey encodes filters
  }, [searchKey, slug, epoch]);

  async function handleExport(format: 'csv' | 'xlsx') {
    const token = getAccessToken();
    if (!token || !tenant) return;
    setExporting(format);
    try {
      const { blob, filename } = await exportDocuments(
        tenantApiOrigin(tenant.admin_url),
        token,
        query,
        format,
      );
      triggerBlobDownload(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Izvoz nije uspio.');
    } finally {
      setExporting(null);
    }
  }

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    replaceQuery({
      search: String(form.get('search') || ''),
      year: String(form.get('year') || ''),
      month: String(form.get('month') || ''),
      status: String(form.get('status') || ''),
      view: String(form.get('view') || ''),
      date_from: String(form.get('date_from') || ''),
      date_to: String(form.get('date_to') || ''),
      page: 1,
    });
  }

  const pageCount = data ? pageCountOf(data.count, query.page_size || 20) : 1;
  usePageBounds({
    page: query.page || 1,
    pageCount,
    ready: Boolean(data) && !loading && !error,
    onPage,
  });

  const exportActions = (
    <div className="export-actions">
      {showHeader &&
        (query.direction === 'incoming' || query.direction === INCOMING_GROUP_DIRECTION) &&
        tenant &&
        canWritePurchasing(tenant.role) && (
        <Link className="btn btn-primary" href={`/t/${slug}/ulazni-racuni/ucitaj`}>
          Učitaj račun
        </Link>
      )}
      <button
        type="button"
        className="btn btn-secondary"
        disabled={!tenant || Boolean(exporting)}
        onClick={() => handleExport('csv')}
      >
        {exporting === 'csv' ? 'CSV…' : 'CSV'}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={!tenant || Boolean(exporting)}
        onClick={() => handleExport('xlsx')}
      >
        {exporting === 'xlsx' ? 'XLSX…' : 'XLSX'}
      </button>
    </div>
  );

  const listBody = (
    <>
        {!showHeader && (
          <div className="docs-list-toolbar">
            {tenant && canWritePurchasing(tenant.role) && (
              <EracunSyncButton
                origin={tenantApiOrigin(tenant.admin_url)}
                onImported={() => {
                  replaceQuery({ page: 1 });
                  setEpoch((value) => value + 1);
                }}
              />
            )}
            {exportActions}
          </div>
        )}

        <nav className="tabs" aria-label="Smjer dokumenata">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={isDirectionTabActive(query.direction, tab.value) ? 'tab tab-active' : 'tab'}
              onClick={() => replaceQuery(patchDirectionTab(query, tab.value))}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <form className="filter-bar" onSubmit={handleFilter} key={searchParams.toString()}>
          <label className="filter-field">
            <span>Pretraga</span>
            <input name="search" defaultValue={query.search} placeholder="Broj ili partner" />
          </label>
          <label className="filter-field">
            <span>Godina</span>
            <input name="year" defaultValue={query.year} placeholder="npr. 2026" inputMode="numeric" />
          </label>
          <label className="filter-field">
            <span>Mjesec</span>
            <input name="month" defaultValue={query.month} placeholder="npr. 8" inputMode="numeric" />
          </label>
          <label className="filter-field">
            <span>Status dokumenta</span>
            <select name="status" defaultValue={query.status}>
              <option value="">Svi statusi</option>
              <option value="draft">Nacrt</option>
              <option value="sent">Poslan</option>
              <option value="paid">Plaćen</option>
              <option value="overdue">Dospio</option>
              <option value="cancelled">Otkazan</option>
              <option value="approved">Odobren</option>
            </select>
          </label>
          <label className="filter-field">
            <span>Pogled</span>
            <select name="view" defaultValue={query.view}>
              {SYSTEM_VIEWS.map((view) => (
                <option key={view.value || 'all'} value={view.value}>
                  {view.label}
                </option>
              ))}
            </select>
          </label>
          <DateField name="date_from" label="Od datuma" defaultValue={query.date_from} />
          <DateField name="date_to" label="Do datuma" defaultValue={query.date_to} />
          <button type="submit" className="btn btn-primary filter-submit">
            Primijeni
          </button>
        </form>

        {data && (
          <p className="as-of">
            Presjek <time dateTime={data.as_of}>{formatHrDateTime(data.as_of)}</time> · {data.count}{' '}
            dokumenata
          </p>
        )}

        {error && <div className="error">{error}</div>}
        {loading && !data && <div className="loading">Učitavanje…</div>}
        {data && <DocumentKpi byCurrency={data.summary.by_currency} />}
        {data && data.results.some((row) => row.vat.disclaimer) && (
          <p className="disclaimer" role="note">
            Status predaje PDV razdoblja ne potvrđuje pojedinačni obuhvat računa.
          </p>
        )}
        {data && (
          <DocumentTable
            rows={data.results}
            slug={slug}
            onOpenDocument={(next) => {
              if (next.direction !== 'deposit') return;
              setSelection(next);
            }}
          />
        )}

        {selection && selection.direction === 'deposit' && tenant && (
          <DocumentDetailPanel
            selection={selection}
            origin={tenantApiOrigin(tenant.admin_url)}
            onClose={() => setSelection(null)}
            slug={slug}
          />
        )}

        {data && (
          <Pagination
            page={query.page || 1}
            pageCount={pageCount}
            count={data.count}
            pageSize={query.page_size}
            onPage={onPage}
            onPageSize={(page_size) => replaceQuery({ page_size, page: 1 })}
          />
        )}
    </>
  );

  if (!showHeader) {
    return listBody;
  }

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Saldakonti{tenant ? ` — ${tenant.name}` : ''}</h1>
          <p>Pregled ulaznih i izlaznih računa te otvorenih stavaka.</p>
        </div>
        {exportActions}
      </header>
      {listBody}
    </section>
  );
}
