'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BANKING_SUBNAV = [
  { path: '', label: 'Pregled' },
  { path: '/racuni', label: 'Računi' },
  { path: '/izvodi', label: 'Izvodi' },
  { path: '/transakcije', label: 'Transakcije' },
  { path: '/uskladivanje', label: 'Usklađivanje' },
  { path: '/nalozi', label: 'Platni nalozi' },
] as const;

export function BankingSubnav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/t/${slug}/bankarstvo`;

  return (
    <nav className="tabs banking-subnav" aria-label="Bankarstvo">
      {BANKING_SUBNAV.map((item) => {
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
