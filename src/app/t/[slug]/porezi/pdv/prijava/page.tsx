'use client';

import { useParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { PdvPrijava } from '@/components/tax/PdvPrijava';
import { RequirePdvPeriod } from '@/components/tax/RequirePdvPeriod';

export default function PdvPrijavaPage() {
  const params = useParams<{ slug: string }>();
  return (
    <RequirePdvPeriod slug={params.slug}>
      {(period) => (
        <PdvPage
          slug={params.slug}
          period={period}
          title="Prijava"
          description="Draft Obrazac PDV, boxovi, unsigned XML i evidencija ručne predaje na ePoreznu."
        >
          {({ origin, token, role }) => (
            <PdvPrijava
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
