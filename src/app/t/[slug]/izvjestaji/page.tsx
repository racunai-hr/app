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
          <p>
            RDG po mjestima troška, bruto bilanca, statutarni obrasci bilance (POD-BIL) i računa
            dobiti i gubitka (POD-RDG) te snimak predanog godišnjeg financijskog izvještaja.
            Bilanca i RDG po kontnim razredima ostaju u admin izvozu.
          </p>
        </div>
      </header>
      <ul>
        <li>
          <Link href={`/t/${slug}/izvjestaji/mjesta-troska`}>RDG po mjestima troška</Link>
        </li>
        <li>
          <Link href={`/t/${slug}/izvjestaji/bilanca`}>Bilanca (POD-BIL)</Link>
        </li>
        <li>
          <Link href={`/t/${slug}/izvjestaji/pod-rdg`}>Račun dobiti i gubitka (POD-RDG)</Link>
        </li>
        <li>
          <Link href={`/t/${slug}/izvjestaji/gfi`}>Godišnji financijski izvještaj</Link>
        </li>
        <li>
          <Link href={`/t/${slug}/izvjestaji/biljeske`}>Odluka i bilješke</Link>
        </li>
        <li>
          <Link href={`/t/${slug}/izvjestaji/bruto-bilanca`}>Bruto bilanca</Link>
        </li>
      </ul>
    </section>
  );
}
