'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { tenantApiOrigin } from '@/lib/documents';
import { formatHrAmount } from '@/lib/formatHr';
import { fetchCostCenterReport, type CostCenterReport } from '@/lib/costCenters';

type Props = { slug: string };

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function CostCenterReportView({ slug }: Props) {
  const router = useRouter();
  const initial = currentPeriod();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [cumulative, setCumulative] = useState(true);
  const [data, setData] = useState<CostCenterReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = getAccessToken();
    if (!access) {
      setLoading(false);
      router.replace('/');
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
        const report = await fetchCostCenterReport(
          tenantApiOrigin(found.admin_url),
          access,
          year,
          month,
          cumulative,
          abort.signal,
        );
        if (!cancelled) setData(report);
      })
      .catch((err) => {
        if (cancelled || abort.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Izvještaj se nije učitao.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [slug, year, month, cumulative, router]);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>RDG po mjestima troška</h1>
          <p>Kanonski trag je stavka temeljnice. Promjena MT-a na dokumentu ne mijenja već knjižene stavke.</p>
        </div>
        <Link className="btn btn-secondary" href={`/t/${slug}/izvjestaji`}>
          Natrag
        </Link>
      </header>
      <form className="expense-posting-fields" onSubmit={(event) => event.preventDefault()}>
        <label>
          Godina
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          />
        </label>
        <label>
          Mjesec
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          />
        </label>
        <label className="ocr-override">
          <input
            type="checkbox"
            checked={cumulative}
            onChange={(event) => setCumulative(event.target.checked)}
          />
          Kumulativno od siječnja
        </label>
      </form>
      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <div className="loading">Učitavanje…</div> : null}
      {data ? (
        <>
          <p>
            Ukupno {formatHrAmount(data.total)} · s MT {formatHrAmount(data.assigned_total)} · bez MT{' '}
            {formatHrAmount(data.unassigned_total)}
          </p>
          <div className="table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Šifra</th>
                  <th>Naziv</th>
                  <th>Vrsta</th>
                  <th>Iznos</th>
                </tr>
              </thead>
              <tbody>
                {data.results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Nema RDG stavki s mjestom troška u razdoblju.
                    </td>
                  </tr>
                ) : (
                  data.results.map((row) => (
                    <tr key={`${row.cost_center_id ?? 'none'}-${row.code}`}>
                      <td>{row.code || '—'}</td>
                      <td>
                        {row.cost_center_id ? (
                          <Link href={`/t/${slug}/izvjestaji/mjesta-troska/${row.cost_center_id}`}>
                            {row.name}
                          </Link>
                        ) : (
                          row.name
                        )}
                      </td>
                      <td>{row.kind || '—'}</td>
                      <td className="cell-amount">{formatHrAmount(row.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
