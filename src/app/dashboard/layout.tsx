import type { Metadata } from 'next';

import { AppShell } from '@/components/app-shell/AppShell';

export const metadata: Metadata = {
  title: 'Pregled — racunAI',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
