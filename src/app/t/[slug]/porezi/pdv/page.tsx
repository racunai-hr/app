'use client';

import { useParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { PdvPeriodList } from '@/components/tax/PdvPeriodList';

export default function PdvRazdobljaPage() {
  const params = useParams<{ slug: string }>();
  return (
    <PdvPage
      slug={params.slug}
      title="PDV razdoblja"
      description="Odabir poreznog razdoblja. Kontrolni pregledi i prijava otvaraju se tek nakon odabira mjeseca."
    >
      {({ origin, token }) => <PdvPeriodList origin={origin} token={token} />}
    </PdvPage>
  );
}
