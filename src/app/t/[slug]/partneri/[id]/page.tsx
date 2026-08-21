'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerOverview } from '@/components/partners/PartnerOverview';

export default function PartnerPregledPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role, partner, reloadPartner }) => (
        <PartnerOverview
          origin={origin}
          token={token}
          role={role}
          partner={partner}
          onSaved={reloadPartner}
        />
      )}
    </PartnerCardShell>
  );
}
