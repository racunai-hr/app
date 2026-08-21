'use client';

import { useParams } from 'next/navigation';

import { PartnerCardShell } from '@/components/partners/PartnerCardShell';
import { PartnerDocumentsPanel } from '@/components/partners/PartnerDocumentsPanel';

export default function PartnerDokumentiPage() {
  const params = useParams<{ slug: string; id: string }>();
  const partnerId = Number(params.id);
  return (
    <PartnerCardShell slug={params.slug} partnerId={partnerId}>
      {({ origin, token }) => (
        <PartnerDocumentsPanel origin={origin} token={token} partnerId={partnerId} />
      )}
    </PartnerCardShell>
  );
}
