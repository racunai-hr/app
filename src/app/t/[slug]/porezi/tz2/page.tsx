'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { PdvPage } from '@/components/tax/PdvPage';
import { Tz2Workflow } from '@/components/tax/Tz2Workflow';
import { parseTz2Year } from '@/lib/tz2';

export default function Tz2Page() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const year = parseTz2Year(searchParams.get('year'));

  return (
    <PdvPage
      slug={params.slug}
      title={`TZ 2 — ${year}`}
      description="Obrazac TZ 2, turistička članarina. Nije PDV. XML slijedi službenu XSD shemu, ne ekran ePorezne."
      showSubnav={false}
    >
      {({ origin, token, role }) => (
        <Tz2Workflow slug={params.slug} year={year} origin={origin} token={token} role={role} />
      )}
    </PdvPage>
  );
}
