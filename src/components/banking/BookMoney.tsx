import { formatHrMoney } from '@/lib/formatHr';

type Props = {
  amount: string | null | undefined;
  currency: string | null | undefined;
  amountEur?: string | null;
};

export function BookMoney({ amount, currency, amountEur }: Props) {
  const code = currency || 'EUR';
  if (!amountEur || code === 'EUR') {
    return <>{formatHrMoney(amount, code)}</>;
  }
  return (
    <div className="cell-stack">
      <span>{formatHrMoney(amount, code)}</span>
      <span className="text-muted">{formatHrMoney(amountEur, 'EUR')}</span>
    </div>
  );
}
