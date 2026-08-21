import type { CurrencyKpi } from '@/lib/documents';
import { formatHrMoney } from '@/lib/formatHr';

type Props = {
  byCurrency: Record<string, CurrencyKpi>;
};

const TILES = [
  {
    id: 'outgoing',
    label: 'Izlazni',
    value: (row: CurrencyKpi, currency: string) =>
      `${row.outgoing_count} · ${formatHrMoney(row.outgoing_gross, currency)}`,
  },
  {
    id: 'incoming',
    label: 'Ulazni',
    value: (row: CurrencyKpi, currency: string) =>
      `${row.incoming_count} · ${formatHrMoney(row.incoming_gross, currency)}`,
  },
  {
    id: 'receivables',
    label: 'Potraživanja',
    value: (row: CurrencyKpi, currency: string) => formatHrMoney(row.open_receivables, currency),
  },
  {
    id: 'payables',
    label: 'Obveze',
    value: (row: CurrencyKpi, currency: string) => formatHrMoney(row.open_payables, currency),
  },
] as const;

export function DocumentKpi({ byCurrency }: Props) {
  const currencies = Object.keys(byCurrency).sort();
  if (currencies.length === 0) {
    return <p className="kpi-empty">Nema KPI podataka za trenutni filter.</p>;
  }
  return (
    <div className="kpi-grid" data-testid="document-kpi">
      {TILES.map((tile) => (
        <section key={tile.id} className="kpi-card" aria-label={tile.label}>
          <h3>{tile.label}</h3>
          {currencies.map((currency) => (
            <p key={currency} className="kpi-value">
              {tile.value(byCurrency[currency], currency)}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
