'use client';

import { useParams } from 'next/navigation';

import { PdvIspravakForm } from '@/components/tax/PdvIspravakForm';
import { PdvPage } from '@/components/tax/PdvPage';

export default function PdvIspravakPage() {
  const params = useParams<{ slug: string }>();

  return (
    <PdvPage
      slug={params.slug}
      title="PDV-ispravak"
      description="ObrazacPDVispravak v1.0. Obavijest o nenaplativom potraživanju, ne ispravak PDV prijave."
      showSubnav={false}
    >
      {({ origin, token }) => <PdvIspravakForm origin={origin} token={token} />}
    </PdvPage>
  );
}
