'use client';

import { useParams } from 'next/navigation';

import { PartnerBankAccountsPanel } from '@/components/partners/PartnerBankAccountsPanel';
import { PartnerCardShell } from '@/components/partners/PartnerCardShell';

export default function PartnerBankovniRacuniPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role }) => (
        <PartnerBankAccountsPanel origin={origin} token={token} role={role} partnerId={partnerId} />
      )}
    </PartnerCardShell>
  );
}
