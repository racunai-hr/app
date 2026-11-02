'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PDV_SUBNAV = [
  { id: 'razdoblja', path: '', label: 'Razdoblja' },
  { id: 'kontrolni-pregledi', path: '/kontrolni-pregledi', label: 'Kontrolni pregledi' },
  { id: 'prijava', path: '/prijava', label: 'Prijava' },
] as const;

export function PdvSubnav({ slug, period }: { slug: string; period?: string | null }) {
  const pathname = usePathname();
  const base = `/t/${slug}/porezi/pdv`;
  const validPeriod = period && /^\d{4}-(0[1-9]|1[0-2])$/.test(period) ? period : null;

  return (
    <nav className="tabs banking-subnav" aria-label="PDV">
      {PDV_SUBNAV.map((item) => {
        const scoped = item.path !== '';
        const href =
          scoped && validPeriod
            ? `${base}${item.path}?period=${validPeriod}`
            : base;
        const current =
          item.path === ''
            ? pathname === base || pathname === `${base}/`
            : pathname === `${base}${item.path}` || pathname.startsWith(`${base}${item.path}/`);
        return (
          <Link key={item.id} href={href} className={current ? 'tab tab-active' : 'tab'}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
