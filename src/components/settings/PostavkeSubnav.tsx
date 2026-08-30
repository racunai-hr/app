'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const POSTAVKE_SUBNAV = [
  { path: '', label: 'Pregled' },
  { path: '/vrste-troska', label: 'Vrste troška' },
  { path: '/mjesta-troska', label: 'Mjesta troška' },
] as const;

export function PostavkeSubnav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/t/${slug}/postavke`;

  return (
    <nav className="tabs banking-subnav" aria-label="Postavke tvrtke">
      {POSTAVKE_SUBNAV.map((item) => {
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
