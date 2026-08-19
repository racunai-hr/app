import { AppShell } from '@/components/app-shell/AppShell';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
