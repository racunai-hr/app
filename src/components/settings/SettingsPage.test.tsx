import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ slug: 'finestar' }),
  usePathname: () => '/t/finestar/postavke/mjesta-troska',
}));

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
  clearTokens: vi.fn(),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    fetchMe: vi.fn().mockResolvedValue({
      user: { id: 1, username: 'viewer', email: '', is_superuser: false },
      tenants: [
        {
          slug: 'finestar',
          name: 'FineStar',
          role: 'viewer',
          is_default: true,
          admin_url: 'https://finestar-stage.racunai.hr/admin/',
        },
      ],
      platform_admin_url: 'https://admin.racunai.hr/admin/',
    }),
  };
});

import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('lets a viewer read settings and reports no write capability', async () => {
    render(
      <SettingsPage slug="finestar" title="Mjesta troška" description="Šifarnik MT.">
        {({ canWrite }) => <p>{canWrite ? 'write' : 'read-only'}</p>}
      </SettingsPage>,
    );
    expect(await screen.findByText('read-only')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
