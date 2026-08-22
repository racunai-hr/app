'use client';

import { useParams } from 'next/navigation';

import { PdvKontrolniPregledi } from '@/components/tax/PdvKontrolniPregledi';
import { PdvPage } from '@/components/tax/PdvPage';
import { RequirePdvPeriod } from '@/components/tax/RequirePdvPeriod';

export default function PdvKontrolniPreglediPage() {
  const params = useParams<{ slug: string }>();
  return (
    <RequirePdvPeriod slug={params.slug}>
      {(period) => (
        <PdvPage
          slug={params.slug}
          period={period}
          title="Kontrolni pregledi"
          description="Stanje knjige odabranog razdoblja. Redovi I-RA/U-RA nisu u ovom API-ju."
        >
          {({ origin, token, role }) => (
            <PdvKontrolniPregledi
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
