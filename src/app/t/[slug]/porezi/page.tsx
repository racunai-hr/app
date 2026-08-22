'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const TAX_HUB = [
  { href: 'pdv', label: 'PDV', ready: true },
  { href: null, label: 'EU poslovanje', ready: false },
  { href: null, label: 'Porez na dobit', ready: false },
  { href: null, label: 'JOPPD i primici', ready: false },
  { href: null, label: 'Ostali porezi i naknade', ready: false },
  { href: null, label: 'Predaje i potvrde', ready: false },
  { href: null, label: 'Porezni kalendar', ready: false },
] as const;

export default function PoreziHubPage() {
  const params = useParams<{ slug: string }>();
  const base = `/t/${params.slug}/porezi`;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Porezi i obrasci</h1>
          <p>Kanonski porezni moduli. Djelatnost nije stavka ovog izbornika.</p>
        </div>
      </header>
      <ul className="tax-hub-list">
        {TAX_HUB.map((item) => (
          <li key={item.label}>
            {item.ready && item.href ? (
              <Link href={`${base}/${item.href}`}>{item.label}</Link>
            ) : (
              <span>
                {item.label} <span className="app-placeholder-note">uskoro</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
