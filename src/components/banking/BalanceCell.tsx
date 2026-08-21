import { formatHrMoney, formatHrSnapshot } from '@/lib/formatHr';
import type { BalanceDto } from '@/lib/banking';
import { BALANCE_SOURCE_LABELS, BALANCE_TYPE_LABELS, labelOrRaw } from '@/lib/bankingLabels';

export function BalanceCell({ balances }: { balances: BalanceDto[] }) {
  if (!balances.length) {
    return <span className="text-muted">Nema salda</span>;
  }
  return (
    <ul className="banking-balances">
      {balances.map((balance) => (
        <li key={`${balance.balance_type}-${balance.as_of}`}>
          <strong>{formatHrMoney(balance.amount, balance.currency)}</strong>
          <span className="banking-balance-meta">
            {labelOrRaw(BALANCE_TYPE_LABELS, balance.balance_type)} · izvor{' '}
            {labelOrRaw(BALANCE_SOURCE_LABELS, balance.source)} ·{' '}
            <time dateTime={balance.as_of ?? undefined}>
              {balance.as_of ? formatHrSnapshot(balance.as_of) : '—'}
            </time>
            {balance.is_stale ? (
              <span className="badge badge-warning banking-stale">Zastarjelo</span>
            ) : (
              <span className="badge badge-success banking-stale">Svježe</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
