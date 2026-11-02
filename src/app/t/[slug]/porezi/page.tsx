'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { TAX_HUB_GROUPS } from '@/lib/taxHub';

export default function PoreziHubPage() {
  const params = useParams<{ slug: string }>();

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Porezi i obrasci</h1>
          <p>Katalog obrazaca. Djelatnost nije stavka ovog izbornika.</p>
        </div>
      </header>
      <div className="tax-hub">
        {TAX_HUB_GROUPS.map((group) => (
          <section key={group.id} className="tax-hub-group">
            <h2>{group.label}</h2>
            {group.forms.length ? (
              <ul className="tax-hub-list">
                {group.forms.map((form) => {
                  const href = form.ready && form.href ? form.href(params.slug) : null;
                  return (
                    <li key={form.id}>
                      {href ? (
                        <Link href={href}>
                          {form.label}
                          {form.note ? <span className="tax-hub-note">{form.note}</span> : null}
                        </Link>
                      ) : (
                        <span>
                          {form.label} <span className="app-placeholder-note">uskoro</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="tax-hub-empty">
                <span className="app-placeholder-note">uskoro</span>
              </p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
