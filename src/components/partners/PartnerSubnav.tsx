'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PARTNER_SUBNAV = [
  { path: '', label: 'Pregled' },
  { path: '/kontakti', label: 'Kontakti' },
  { path: '/bankovni-racuni', label: 'Bankovni računi' },
  { path: '/dokumenti', label: 'Dokumenti' },
  { path: '/saldakonto', label: 'Saldakonto' },
] as const;

export function PartnerSubnav({ slug, partnerId }: { slug: string; partnerId: number }) {
  const pathname = usePathname();
  const base = `/t/${slug}/partneri/${partnerId}`;

  return (
    <nav className="tabs banking-subnav" aria-label="Kartica partnera">
      {PARTNER_SUBNAV.map((item) => {
        const href = `${base}${item.path}`;
        const current =
          item.path === ''
            ? pathname === base || pathname === `${base}/`
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={item.path || 'overview'} href={href} className={current ? 'tab tab-active' : 'tab'}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
