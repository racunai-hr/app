'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { ZpPeriodList } from '@/components/tax/ZpPeriodList';
import { ZpWorkflow } from '@/components/tax/ZpWorkflow';
import { parsePdvPeriod } from '@/lib/pdv';

export default function ZpPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const period = parsePdvPeriod(searchParams.get('period'));

  if (!period) {
    return (
      <PdvPage
        slug={params.slug}
        title="ZP razdoblja"
        description="Zbirna prijava isporuka u EU. Dobra su PDV polje 103, usluge polje 104."
        showSubnav={false}
      >
        {({ origin, token }) => <ZpPeriodList slug={params.slug} origin={origin} token={token} />}
      </PdvPage>
    );
  }

  return (
    <PdvPage
      slug={params.slug}
      period={period}
      periodKind="ZP"
      showSubnav={false}
      title="ZP"
      description="Agregirane EU isporuke, unsigned XML i evidencija ručne predaje."
    >
      {({ origin, token, role }) => (
        <ZpWorkflow
          slug={params.slug}
          period={period}
          origin={origin}
          token={token}
          role={role}
        />
      )}
    </PdvPage>
  );
}
