import type { MeResponse, UserInfo } from '@/lib/api';

type MeOverrides = Omit<Partial<MeResponse>, 'user'> & {
  user?: Partial<UserInfo>;
};

export function sampleMe(overrides: MeOverrides = {}): MeResponse {
  const { user, ...rest } = overrides;
  return {
    user: {
      id: 1,
      username: 'ana',
      email: 'ana@finestar.hr',
      is_superuser: false,
      ...user,
    },
    tenants: [
      {
        slug: 'finestar',
        name: 'Fine Star d.o.o.',
        role: 'accountant',
        is_default: true,
        admin_url: 'https://finestar.racunai.hr/admin/',
      },
    ],
    platform_admin_url: 'https://admin.racunai.hr/admin/',
    ...rest,
  };
}
