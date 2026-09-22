import Link from 'next/link';

import {
  depreciationMethodLabel,
  type FixedAssetDetail,
} from '@/lib/assets';
import { formatHrAmount, formatHrInputDate } from '@/lib/formatHr';

type Props = { slug: string; asset: FixedAssetDetail };

export function AssetOverview({ slug, asset }: Props) {
  return (
    <dl className="incoming-dl incoming-dl-inline">
      <div>
        <dt>VIN</dt>
        <dd>{asset.vin || '—'}</dd>
      </div>
      <div>
        <dt>Vijek (mjeseci)</dt>
        <dd>{asset.useful_life_months ?? '—'}</dd>
      </div>
      <div>
        <dt>Metoda</dt>
        <dd>{depreciationMethodLabel(asset.depreciation_method)}</dd>
      </div>
      <div>
        <dt>Datum nabave</dt>
        <dd>{asset.purchase_date ? formatHrInputDate(asset.purchase_date) : '—'}</dd>
      </div>
      <div>
        <dt>Datum aktivacije</dt>
        <dd>{asset.activation_date ? formatHrInputDate(asset.activation_date) : '—'}</dd>
      </div>
      <div>
        <dt>Nabavna vrijednost</dt>
        <dd>{formatHrAmount(asset.acquisition_cost)}</dd>
      </div>
      <div>
        <dt>Akumulirana amortizacija</dt>
        <dd>{formatHrAmount(asset.accumulated_depreciation)}</dd>
      </div>
      <div>
        <dt>Knjigovodstvena vrijednost</dt>
        <dd>{formatHrAmount(asset.current_book_value)}</dd>
      </div>
      <div>
        <dt>Mjesto troška</dt>
        <dd>
          {asset.cost_center ? (
            <Link href={`/t/${slug}/izvjestaji/mjesta-troska/${asset.cost_center.id}`}>
              {asset.cost_center.code} · {asset.cost_center.name}
            </Link>
          ) : (
            '—'
          )}
        </dd>
      </div>
      <div>
        <dt>Temeljnica aktivacije</dt>
        <dd>
          {asset.activation_journal_entry_id != null ? (
            <Link href={`/t/${slug}/glavna-knjiga/${asset.activation_journal_entry_id}`}>
              Temeljnica aktivacije
            </Link>
          ) : (
            '—'
          )}
        </dd>
      </div>
    </dl>
  );
}
