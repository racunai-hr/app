'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerDepositsPanel } from '@/components/partners/PartnerDepositsPanel';
import { PartnerSubledgerPanel } from '@/components/partners/PartnerSubledgerPanel';

export default function PartnerSaldakontoPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role }) => (
        <>
          <PartnerDepositsPanel origin={origin} token={token} partnerId={partnerId} role={role} />
          <PartnerSubledgerPanel origin={origin} token={token} partnerId={partnerId} />
        </>
      )}
    </PartnerCardShell>
  );
}
