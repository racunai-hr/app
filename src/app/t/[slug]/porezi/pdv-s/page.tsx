'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { PdvSPeriodList } from '@/components/tax/PdvSPeriodList';
import { PdvSWorkflow } from '@/components/tax/PdvSWorkflow';
import { parsePdvPeriod } from '@/lib/pdv';

export default function PdvSPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const period = parsePdvPeriod(searchParams.get('period'));

  if (!period) {
    return (
      <PdvPage
        slug={params.slug}
        title="PDV-S razdoblja"
        description="Odabir razdoblja za Obrazac PDV-S. Nije PDV prijava, ZP ni OSS."
        showSubnav={false}
      >
        {({ origin, token }) => <PdvSPeriodList slug={params.slug} origin={origin} token={token} />}
      </PdvPage>
    );
  }

  return (
    <PdvPage
      slug={params.slug}
      period={period}
      periodKind="PDV-S"
      showSubnav={false}
      title="PDV-S"
      description="Agregirane EU stavke, unsigned XML i evidencija ručne predaje. Nije ZP ni OSS."
    >
      {({ origin, token, role }) => (
        <PdvSWorkflow
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
