'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerDepositsPanel } from '@/components/partners/PartnerDepositsPanel';
import { PartnerFinancialSummaryStrip } from '@/components/partners/PartnerFinancialSummaryStrip';
import { PartnerSubledgerPanel } from '@/components/partners/PartnerSubledgerPanel';

export default function PartnerSaldakontoPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role }) => (
        <>
          <PartnerFinancialSummaryStrip origin={origin} token={token} partnerId={partnerId} />
          <PartnerSubledgerPanel
            slug={params.slug}
            origin={origin}
            token={token}
            partnerId={partnerId}
          />
          <PartnerDepositsPanel origin={origin} token={token} partnerId={partnerId} role={role} />
        </>
      )}
    </PartnerCardShell>
  );
}
