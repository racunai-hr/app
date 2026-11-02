import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { storeTenantSlug } from './authz';
import { activeTenantSlug, tenantFetch } from './tenantRequest';

function mockPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { pathname },
  });
}

describe('activeTenantSlug', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('reads the slug from /t/<slug>/... pathname', () => {
    mockPathname('/t/alma-cizmic/dokumenti');
    expect(activeTenantSlug()).toBe('alma-cizmic');
  });

  it('falls back to sessionStorage off a tenant route', () => {
    mockPathname('/dashboard');
    storeTenantSlug('finestar');
    expect(activeTenantSlug()).toBe('finestar');
  });
});

describe('tenantFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    sessionStorage.clear();
  });

  it('adds X-Tenant-Slug when the origin override is set', async () => {
    process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE = 'http://127.0.0.1:8000';
    mockPathname('/t/alma-cizmic/partneri');
    await tenantFetch('http://127.0.0.1:8000/api/partners/');
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('X-Tenant-Slug')).toBe('alma-cizmic');
  });

  it('does not add the header without an origin override', async () => {
    delete process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    mockPathname('/t/alma-cizmic/partneri');
    await tenantFetch('https://alma-cizmic-stage.racunai.hr/api/partners/');
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('X-Tenant-Slug')).toBeNull();
  });

  it('does not add the header when no slug is known', async () => {
    process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE = 'http://127.0.0.1:8000';
    mockPathname('/dashboard');
    await tenantFetch('http://127.0.0.1:8000/api/auth/me/');
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('X-Tenant-Slug')).toBeNull();
  });
});
