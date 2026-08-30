'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { CostCenterSettings } from '@/components/settings/CostCenterSettings';
import { ExpenseCategorySettings } from '@/components/settings/ExpenseCategorySettings';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { POSTAVKE_SUBNAV } from '@/components/settings/PostavkeSubnav';

const SECTION_HINTS: Record<string, string> = {
  '/vrste-troska': 'Zadano rashodno konto po vrsti troška. Predlaže konto pri knjiženju.',
  '/mjesta-troska': 'Šifarnik mjesta troška (MT) — lokacije, objekti i režije.',
};

export function SettingsOverviewRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  return (
    <SettingsPage
      slug={slug}
      title="Postavke tvrtke"
      description="Šifarnici koji hrane knjiženje. Pravila knjiženja se ovdje ne uređuju."
    >
      {() => (
        <section className="incoming-card">
          <h2>Šifarnici</h2>
          <ul>
            {POSTAVKE_SUBNAV.filter((item) => item.path !== '').map((item) => (
              <li key={item.path}>
                <Link href={`/t/${slug}/postavke${item.path}`}>{item.label}</Link>
                {SECTION_HINTS[item.path] ? ` — ${SECTION_HINTS[item.path]}` : null}
              </li>
            ))}
          </ul>
        </section>
      )}
    </SettingsPage>
  );
}

export function ExpenseCategoriesRoute() {
  const params = useParams<{ slug: string }>();
  return (
    <SettingsPage
      slug={params.slug}
      title="Vrste troška"
      description="Vrsta troška određuje predloženo rashodno konto pri knjiženju."
    >
      {({ origin, token, canWrite }) => (
        <ExpenseCategorySettings origin={origin} token={token} canWrite={canWrite} />
      )}
    </SettingsPage>
  );
}

export function CostCentersRoute() {
  const params = useParams<{ slug: string }>();
  return (
    <SettingsPage
      slug={params.slug}
      title="Mjesta troška"
      description="MT na dokumentu je input za resolver. Kanonski trag nakon knjiženja je stavka temeljnice."
    >
      {({ origin, token, canWrite }) => (
        <CostCenterSettings origin={origin} token={token} canWrite={canWrite} />
      )}
    </SettingsPage>
  );
}
