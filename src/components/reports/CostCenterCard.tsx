'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { DocumentTable } from '@/components/documents/DocumentTable';
import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import {
  COST_CENTER_KIND_LABELS,
  fetchCostCenter,
  fetchCostCenterReport,
  formatCostCenterOption,
  type CostCenter,
  type CostCenterReportRow,
} from '@/lib/costCenters';
import { fetchDocuments, tenantApiOrigin, type DocumentSummary } from '@/lib/documents';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';
import {
  fetchJournalEntries,
  journalSourceLabel,
  journalStatusLabel,
  type JournalEntryListItem,
} from '@/lib/journal';

type Props = { slug: string; costCenterId: number };

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function linkedAssetIds(center: CostCenter): { id: number; name: string }[] {
  const byId = new Map<number, string>();
  for (const asset of center.fixed_assets || []) {
    byId.set(asset.id, asset.name);
  }
  if (center.vehicle?.fixed_asset_id) {
    byId.set(center.vehicle.fixed_asset_id, center.vehicle.name);
  }
  return [...byId.entries()].map(([id, name]) => ({ id, name }));
}

export function CostCenterCard({ slug, costCenterId }: Props) {
  const router = useRouter();
  const period = currentPeriod();
  const [center, setCenter] = useState<CostCenter | null>(null);
  const [rdgRow, setRdgRow] = useState<CostCenterReportRow | null>(null);
  const [entries, setEntries] = useState<JournalEntryListItem[] | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = getAccessToken();
    if (!access) {
      setLoading(false);
      router.replace('/');
      return;
    }
    if (!Number.isFinite(costCenterId) || costCenterId <= 0) {
      setLoading(false);
      setError('Mjesto troška nije pronađeno.');
      return;
    }
    let cancelled = false;
    const abort = new AbortController();
    setLoading(true);
    setError('');
    fetchMe(access)
      .then(async (me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) throw new ApiError('Tvrtka nije pronađena.', 404);
        const origin = tenantApiOrigin(found.admin_url);
        const [detail, report, journal, docs] = await Promise.all([
          fetchCostCenter(origin, access, costCenterId, abort.signal),
          fetchCostCenterReport(origin, access, period.year, period.month, true, abort.signal),
          fetchJournalEntries(origin, access, { cost_center: costCenterId, page_size: 50 }),
          fetchDocuments(origin, access, { cost_center: costCenterId, page_size: 50 }),
        ]);
        if (cancelled) return;
        setCenter(detail);
        setRdgRow(report.results.find((row) => row.cost_center_id === costCenterId) || null);
        setEntries(journal.results);
        setDocuments(docs.results);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Kartica mjesta troška se nije učitala.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [slug, costCenterId, router, period.year, period.month]);

  const assets = center ? linkedAssetIds(center) : [];
  const emptyPosted =
    (!rdgRow || rdgRow.total === '0' || rdgRow.total === '0.00') && (entries?.length ?? 0) === 0;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <p>
            <Link href={`/t/${slug}/izvjestaji/mjesta-troska`}>← RDG po mjestima troška</Link>
          </p>
          <h1>
            {center ? `${center.code} ${center.name}` : loading ? 'Učitavanje…' : 'Mjesto troška'}
          </h1>
          {center ? (
            <p>
              {COST_CENTER_KIND_LABELS[center.kind] || center.kind}
              {center.parent ? ` · ${formatCostCenterOption(center.parent)}` : ''}
            </p>
          ) : null}
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/postavke/mjesta-troska`}>
          Šifarnik
        </Link>
      </header>

      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <div className="loading">Učitavanje…</div> : null}

      {center ? (
        <>
          {assets.length > 0 ? (
            <p>
              Povezana imovina:{' '}
              {assets.map((asset, index) => (
                <span key={asset.id}>
                  {index > 0 ? ', ' : null}
                  <Link href={`/t/${slug}/imovina/${asset.id}/dokumenti`}>{asset.name}</Link>
                </span>
              ))}
            </p>
          ) : null}

          {emptyPosted ? (
            <p className="muted">
              Nema knjiženih RDG stavki s ovim MT. Dokumenti vezani na vozilo/OS su na{' '}
              {assets[0] ? (
                <Link href={`/t/${slug}/imovina/${assets[0].id}/dokumenti`}>kartici imovine</Link>
              ) : (
                'kartici imovine'
              )}
              .
            </p>
          ) : null}

          <section>
            <h2>RDG</h2>
            <p>
              Razdoblje {String(period.month).padStart(2, '0')}.{period.year}. kumulativno ·{' '}
              {formatHrAmount(rdgRow?.total || '0.00')}
            </p>
            {rdgRow?.accounts && rdgRow.accounts.length > 0 ? (
              <div className="table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Konto</th>
                      <th>Naziv</th>
                      <th>Iznos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rdgRow.accounts.map((account) => (
                      <tr key={account.account_code}>
                        <td>{account.account_code}</td>
                        <td>{account.account_name}</td>
                        <td className="cell-amount">{formatHrAmount(account.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section>
            <h2>Temeljnice</h2>
            {entries && entries.length > 0 ? (
              <div className="table-wrap">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Broj</th>
                      <th>Opis</th>
                      <th>Vrsta</th>
                      <th>Status</th>
                      <th>Iznos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((row) => (
                      <tr key={row.id}>
                        <td>{row.entry_date ? formatHrInputDate(row.entry_date) : '—'}</td>
                        <td>
                          <Link href={`/t/${slug}/glavna-knjiga/${row.id}`}>{row.entry_number}</Link>
                        </td>
                        <td>{row.description || '—'}</td>
                        <td>{journalSourceLabel(row.source_type)}</td>
                        <td>{journalStatusLabel(row.status)}</td>
                        <td className="cell-amount">{formatHrAmount(row.total_debit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="table-empty">Nema temeljnica s ovim mjestom troška.</p>
            )}
          </section>

          <section>
            <h2>Dokumenti</h2>
            <p className="banking-role-note">
              Knjiženi dokumenti čiji JE ima stavku s ovim MT. Operativni dokumenti vozila/OS su na
              kartici imovine.
            </p>
            {documents ? <DocumentTable rows={documents} slug={slug} /> : null}
          </section>
        </>
      ) : null}
    </section>
  );
}
