import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/Logo';
import { APP_NAV, isNavActive } from '@/lib/dashboard/nav';

import { useAppShell } from './AppShellContext';

export function Sidebar() {
  const pathname = usePathname() || '';
  const { activeTenant } = useAppShell();
  const slug = activeTenant?.slug ?? '';

  return (
    <aside className="app-sidebar" id="app-sidebar">
      <Link href="/dashboard" className="app-brand">
        <Logo size={32} showText />
      </Link>
      <nav className="app-nav" aria-label="Glavna navigacija">
        {APP_NAV.map((item) => {
          const disabled = item.id !== 'pregled' && !slug;
          const href = item.id === 'pregled' ? '/dashboard' : item.href(slug);
          const current = !disabled && isNavActive(pathname, item, slug);
          if (disabled) {
            return (
              <span key={item.id} className="app-nav-link is-disabled">
                {item.label}
              </span>
            );
          }
          return (
            <Link
              key={item.id}
              href={href}
              className={current ? 'app-nav-link is-current' : 'app-nav-link'}
              aria-current={current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
