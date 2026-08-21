import { describe, expect, it } from 'vitest';

import { canAccessDjangoAdmin, resolveActiveTenant } from '@/lib/authz';
import { sampleMe } from '@/test/meFixtures';

describe('canAccessDjangoAdmin', () => {
  it('is false when the field is missing', () => {
    expect(canAccessDjangoAdmin(sampleMe())).toBe(false);
  });

  it('is false when the field is explicitly false', () => {
    expect(canAccessDjangoAdmin(sampleMe({ user: { can_access_django_admin: false } }))).toBe(false);
  });

  it('is true only for a strict true flag', () => {
    expect(canAccessDjangoAdmin(sampleMe({ user: { can_access_django_admin: true } }))).toBe(true);
  });

  it('does not treat superuser or tenant owner as admin access', () => {
    const me = sampleMe({
      user: { is_superuser: true },
      tenants: [
        {
          slug: 'finestar',
          name: 'Fine Star d.o.o.',
          role: 'owner',
          is_default: true,
          admin_url: 'https://finestar.racunai.hr/admin/',
        },
      ],
    });
    expect(canAccessDjangoAdmin(me)).toBe(false);
  });
});

describe('resolveActiveTenant', () => {
  const tenants = [
    { slug: 'demo', name: 'Demo', role: 'viewer', is_default: true, admin_url: 'https://demo.example/admin/' },
    {
      slug: 'finestar',
      name: 'Fine Star d.o.o.',
      role: 'accountant',
      is_default: false,
      admin_url: 'https://finestar.example/admin/',
    },
  ];

  it('prefers the URL slug', () => {
    expect(resolveActiveTenant(tenants, 'demo', 'finestar')?.slug).toBe('demo');
  });

  it('prefers Fine Star when no URL slug is present', () => {
    expect(resolveActiveTenant(tenants, null, null)?.slug).toBe('finestar');
  });
});
