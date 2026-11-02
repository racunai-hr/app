'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { PdForm } from '@/components/tax/PdForm';
import { PdvPage } from '@/components/tax/PdvPage';
import { parsePdYear } from '@/lib/pd';

export default function PdPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const year = parsePdYear(searchParams.get('year'));

  return (
    <PdvPage
      slug={params.slug}
      title={`PD — ${year}`}
      description="Prijava poreza na dobit iz glavne knjige. Nije PDV."
      showSubnav={false}
    >
      {({ origin, token }) => (
        <PdForm slug={params.slug} year={year} origin={origin} token={token} />
      )}
    </PdvPage>
  );
}
