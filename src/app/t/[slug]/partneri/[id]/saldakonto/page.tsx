'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerDepositsPanel } from '@/components/partners/PartnerDepositsPanel';
import { PartnerFinancialSummaryStrip } from '@/components/partners/PartnerFinancialSummaryStrip';
import { PartnerLedgerPanel } from '@/components/partners/PartnerLedgerPanel';
import { PartnerSubledgerPanel } from '@/components/partners/PartnerSubledgerPanel';

export default function PartnerSaldakontoPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role, partner }) => (
        <>
          <PartnerFinancialSummaryStrip origin={origin} token={token} partnerId={partnerId} />
          <PartnerLedgerPanel
            slug={params.slug}
            origin={origin}
            token={token}
            partnerId={partnerId}
            partnerType={partner.partner_type}
          />
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
