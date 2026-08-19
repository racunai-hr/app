'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerContactsPanel } from '@/components/partners/PartnerContactsPanel';

export default function PartnerKontaktiPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token, role }) => (
        <PartnerContactsPanel origin={origin} token={token} role={role} partnerId={partnerId} />
      )}
    </PartnerCardShell>
  );
}
