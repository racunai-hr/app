import { FormEvent, useEffect, useRef, useState } from 'react';

import { dashboardMock } from '@/lib/dashboard/mockData';
import { roleLabel } from '@/lib/api';

import { useAppShell } from './AppShellContext';
import { UserMenu } from './UserMenu';

export function TopBar() {
  const { activeTenant, me, sidebarOpen, setSidebarOpen, showMockToast, switchTenant } = useAppShell();
  const [query, setQuery] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(event.target as Node)) {
        setNotesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    showMockToast();
  }

  return (
    <header className="app-topbar">
      <button
        type="button"
        className="app-menu-toggle"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        Izbornik
      </button>

      <form className="app-search" onSubmit={handleSearch} role="search">
        <label htmlFor="app-search-input" className="sr-only">
          Pretraga
        </label>
        <input
          id="app-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pretraži dokumente, partnere, konta"
        />
      </form>

      <div className="app-topbar-end">
        <div className="app-notes" ref={notesRef}>
          <button
            type="button"
            className="app-icon-btn"
            aria-expanded={notesOpen}
            aria-haspopup="true"
            onClick={() => setNotesOpen((open) => !open)}
          >
            Obavijesti
            <span className="app-note-count">{dashboardMock.notifications.length}</span>
          </button>
          {notesOpen && (
            <div className="app-popover" role="menu">
              <p className="app-popover-kicker">Mock obavijesti</p>
              {dashboardMock.notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="app-popover-item"
                  role="menuitem"
                  onClick={() => {
                    setNotesOpen(false);
                    showMockToast();
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTenant && me.tenants.length > 1 ? (
          <label className="app-company-select">
            <span className="sr-only">Aktivna tvrtka</span>
            <select
              value={activeTenant.slug}
              onChange={(event) => switchTenant(event.target.value)}
            >
              {me.tenants.map((tenant) => (
                <option key={tenant.slug} value={tenant.slug}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="app-company">
            <span className="app-company-name">{activeTenant?.name ?? 'Nema tvrtke'}</span>
            {activeTenant && (
              <span className="app-company-role">{roleLabel(activeTenant.role)}</span>
            )}
          </p>
        )}

        <UserMenu />
      </div>
    </header>
  );
}
