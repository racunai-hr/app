import { payrollMoneyParts } from '@/lib/formatHr';

type Props = {
  amount: string | number | null | undefined;
  hrk: boolean;
};

export function PayrollMoney({ amount, hrk }: Props) {
  const parts = payrollMoneyParts(amount, hrk);
  if (!parts.eur) return <>{parts.document}</>;
  return (
    <div className="cell-stack">
      <span>{parts.document}</span>
      <span className="text-muted">{parts.eur}</span>
    </div>
  );
}
