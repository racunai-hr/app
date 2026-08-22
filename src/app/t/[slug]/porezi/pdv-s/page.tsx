'use client';

import { useParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { PdvSWorkflow } from '@/components/tax/PdvSWorkflow';
import { RequirePdvPeriod } from '@/components/tax/RequirePdvPeriod';

export default function PdvSPage() {
  const params = useParams<{ slug: string }>();
  return (
    <RequirePdvPeriod slug={params.slug}>
      {(period) => (
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
      )}
    </RequirePdvPeriod>
  );
}
