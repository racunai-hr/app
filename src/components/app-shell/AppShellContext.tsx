'use client';

import { createContext, useContext } from 'react';

import type { MeResponse, TenantInfo } from '@/lib/api';

export type AppShellContextValue = {
  me: MeResponse;
  activeTenant: TenantInfo | null;
  canAccessAdmin: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showMockToast: (message?: string) => void;
  switchTenant: (slug: string) => void;
  logout: () => void;
};

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const value = useContext(AppShellContext);
  if (!value) {
    throw new Error('useAppShell must be used inside AppShell');
  }
  return value;
}
