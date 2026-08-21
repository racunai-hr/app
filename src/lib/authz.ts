import type { MeResponse, TenantInfo } from '@/lib/api';

const ACTIVE_TENANT_KEY = 'racunai_active_tenant';

export function canAccessDjangoAdmin(me: MeResponse | null | undefined): boolean {
  return me?.user.can_access_django_admin === true;
}

export function getStoredTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACTIVE_TENANT_KEY);
}

export function storeTenantSlug(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACTIVE_TENANT_KEY, slug);
}

export function resolveActiveTenant(
  tenants: TenantInfo[],
  urlSlug?: string | null,
  storedSlug?: string | null,
): TenantInfo | null {
  if (!tenants.length) return null;
  if (urlSlug) {
    const fromUrl = tenants.find((row) => row.slug === urlSlug);
    if (fromUrl) return fromUrl;
  }
  if (storedSlug) {
    const stored = tenants.find((row) => row.slug === storedSlug);
    if (stored) return stored;
  }
  return (
    tenants.find((row) => row.slug === 'finestar') ||
    tenants.find((row) => row.is_default) ||
    tenants[0]
  );
}
