'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function IzvjestajiPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>Izvještaji</h1>
          <p>RDG presjek po mjestima troška. Ostali financijski izvještaji ostaju u admin izvozu.</p>
        </div>
      </header>
      <ul>
        <li>
          <Link href={`/t/${slug}/izvjestaji/mjesta-troska`}>RDG po mjestima troška</Link>
        </li>
      </ul>
    </section>
  );
}
