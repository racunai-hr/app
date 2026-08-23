'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ASSET_SUBNAV = [
  { path: '', label: 'Pregled' },
  { path: '/amortizacija', label: 'Amortizacija' },
] as const;

export function AssetSubnav({ slug, assetId }: { slug: string; assetId: number }) {
  const pathname = usePathname();
  const base = `/t/${slug}/imovina/${assetId}`;

  return (
    <nav className="tabs banking-subnav" aria-label="Kartica imovine">
      {ASSET_SUBNAV.map((item) => {
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
