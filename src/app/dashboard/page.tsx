'use client';

import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { useAppShell } from '@/components/app-shell/AppShellContext';

export default function DashboardPage() {
  const { activeTenant, showMockToast } = useAppShell();

  if (!activeTenant) {
    return (
      <div className="app-empty">
        <h1>Pregled</h1>
        <p>Nemate dodijeljen pristup nijednoj tvrtki. Kontaktirajte podršku.</p>
      </div>
    );
  }

  return <DashboardHome companyName={activeTenant.name} onMockAction={() => showMockToast()} />;
}
