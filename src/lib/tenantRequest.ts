import { getStoredTenantSlug } from './authz';

const TENANT_PATH_RE = /^\/t\/([^/]+)/;

export function activeTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const match = TENANT_PATH_RE.exec(window.location.pathname);
  if (match?.[1]) return match[1];
  return getStoredTenantSlug();
}

export function shouldSendTenantSlugHeader(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE);
}

export function tenantFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const slug = shouldSendTenantSlugHeader() ? activeTenantSlug() : null;
  if (!slug) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);
  if (!headers.has('X-Tenant-Slug')) {
    headers.set('X-Tenant-Slug', slug);
  }
  return fetch(input, { ...init, headers });
}
