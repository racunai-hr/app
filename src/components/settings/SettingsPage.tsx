'use client';

import { type ReactNode } from 'react';

import { PostavkeSubnav } from '@/components/settings/PostavkeSubnav';
import { useSettingsSession } from '@/components/settings/useSettingsSession';

type Props = {
  slug: string;
  title: string;
  description: string;
  children: (session: { origin: string; token: string; canWrite: boolean; role: string }) => ReactNode;
};

export function SettingsPage({ slug, title, description, children }: Props) {
  const { session, loading, error } = useSettingsSession(slug);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>
            {title}
            {session ? ` — ${session.tenant.name}` : ''}
          </h1>
          <p>{description}</p>
        </div>
      </header>

      <PostavkeSubnav slug={slug} />

      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : null}
      {loading && !session ? <div className="loading">Učitavanje…</div> : null}
      {session
        ? children({
            origin: session.origin,
            token: session.token,
            canWrite: session.canWrite,
            role: session.role,
          })
        : null}
    </section>
  );
}
