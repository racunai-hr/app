'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { fetchMe, type MeResponse } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import {
  canAccessDjangoAdmin,
  getStoredTenantSlug,
  resolveActiveTenant,
  storeTenantSlug,
} from '@/lib/authz';
import { MOCK_TOAST_MESSAGE } from '@/lib/dashboard/nav';

import { AppShellContext } from './AppShellContext';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { TopBar } from './TopBar';

import './app-shell.css';

export { useAppShell } from './AppShellContext';

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const urlSlug = typeof params.slug === 'string' ? params.slug : null;

  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [storedSlug, setStoredSlug] = useState<string | null>(null);

  useEffect(() => {
    setStoredSlug(getStoredTenantSlug());
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      router.replace('/');
      return;
    }

    let cancelled = false;
    fetchMe(token)
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch((err) => {
        if (cancelled) return;
        clearTokens();
        setError(err instanceof Error ? err.message : 'Sesija je istekla.');
        setTimeout(() => router.replace('/'), 1500);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const activeTenant = useMemo(
    () => (me ? resolveActiveTenant(me.tenants, urlSlug, storedSlug) : null),
    [me, urlSlug, storedSlug],
  );

  const showMockToast = useCallback((message?: string) => {
    setToast(message || MOCK_TOAST_MESSAGE);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const switchTenant = useCallback(
    (slug: string) => {
      storeTenantSlug(slug);
      setStoredSlug(slug);
      if (urlSlug && pathname.startsWith(`/t/${urlSlug}`)) {
        router.push(pathname.replace(`/t/${urlSlug}`, `/t/${slug}`));
      }
    },
    [pathname, router, urlSlug],
  );

  const logout = useCallback(() => {
    clearTokens();
    router.replace('/');
  }, [router]);

  if (loading) {
    return (
      <div className="app-shell app-shell-plain">
        <p className="app-loading">Učitavanje…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell app-shell-plain">
        <p className="app-error">{error}</p>
      </div>
    );
  }

  if (!me) return null;

  return (
    <AppShellContext.Provider
      value={{
        me,
        activeTenant,
        canAccessAdmin: canAccessDjangoAdmin(me),
        sidebarOpen,
        setSidebarOpen,
        showMockToast,
        switchTenant,
        logout,
      }}
    >
      <div className={sidebarOpen ? 'app-shell is-nav-open' : 'app-shell'}>
        <Sidebar />
        <div className="app-main">
          <TopBar />
          <div className="app-content">{children}</div>
        </div>
        {sidebarOpen && (
          <button
            type="button"
            className="app-nav-backdrop"
            aria-label="Zatvori izbornik"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </div>
    </AppShellContext.Provider>
  );
}
