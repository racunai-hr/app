import { useEffect, useRef, useState } from 'react';

import { useAppShell } from './AppShellContext';

export function UserMenu() {
  const { me, canAccessAdmin, logout } = useAppShell();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="app-user" ref={rootRef}>
      <button
        type="button"
        className="app-icon-btn"
        aria-expanded={open}
        aria-haspopup="true"
        data-testid="user-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {me.user.username}
      </button>
      {open && (
        <div className="app-popover app-popover-end" role="menu">
          <p className="app-popover-kicker">{me.user.email || me.user.username}</p>
          {canAccessAdmin && (
            <a
              href={me.platform_admin_url}
              className="app-popover-item"
              role="menuitem"
              data-testid="django-admin-link"
            >
              Admin
            </a>
          )}
          <button type="button" className="app-popover-item" role="menuitem" onClick={logout}>
            Odjava
          </button>
        </div>
      )}
    </div>
  );
}
