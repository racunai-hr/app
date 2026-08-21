import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TOAST_MESSAGE } from '@/lib/dashboard/nav';
import { sampleMe } from '@/test/meFixtures';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  fetchMe: vi.fn(),
  pathname: '/dashboard',
  params: {} as { slug?: string },
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  usePathname: () => mocks.pathname,
  useParams: () => mocks.params,
}));

vi.mock('@/lib/auth', () => ({
  getAccessToken: () => 'token',
  clearTokens: vi.fn(),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    fetchMe: (...args: unknown[]) => mocks.fetchMe(...args),
  };
});

import { AppShell } from './AppShell';

describe('AppShell', () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.push.mockReset();
    mocks.fetchMe.mockReset();
    mocks.pathname = '/dashboard';
    mocks.params = {};
    mocks.fetchMe.mockResolvedValue(sampleMe());
  });

  it('shows Fine Star, real nav links, and never Admin for an ordinary user', async () => {
    render(
      <AppShell>
        <p>sadržaj</p>
      </AppShell>,
    );

    await waitFor(() => {
      expect(screen.getByText('Fine Star d.o.o.')).toBeInTheDocument();
    });

    const nav = screen.getByRole('navigation', { name: 'Glavna navigacija' });
    expect(nav).toHaveTextContent('Pregled');
    expect(nav).toHaveTextContent('Saldakonti');
    expect(nav).not.toHaveTextContent('Admin');
    expect(screen.getByRole('link', { name: 'Saldakonti' })).toHaveAttribute(
      'href',
      '/t/finestar/saldakonti',
    );
    expect(screen.getByRole('link', { name: 'Dokumenti' })).toHaveAttribute(
      'href',
      '/t/finestar/dokumenti',
    );
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
    expect(screen.queryByText('Otvori admin')).toBeNull();

    fireEvent.click(screen.getByTestId('user-menu'));
    expect(screen.queryByTestId('django-admin-link')).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Odjava' })).toBeInTheDocument();
  });

  it('still hides Admin for a superuser tenant owner', async () => {
    mocks.fetchMe.mockResolvedValue(
      sampleMe({
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
      }),
    );

    render(
      <AppShell>
        <p>sadržaj</p>
      </AppShell>,
    );
    await waitFor(() => expect(screen.getByText('Fine Star d.o.o.')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('user-menu'));
    expect(screen.queryByTestId('django-admin-link')).toBeNull();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('shows Admin only in the user menu when the backend flag is true', async () => {
    mocks.fetchMe.mockResolvedValue(sampleMe({ user: { can_access_django_admin: true } }));
    render(
      <AppShell>
        <p>sadržaj</p>
      </AppShell>,
    );
    await waitFor(() => expect(screen.getByText('Fine Star d.o.o.')).toBeInTheDocument());

    const nav = screen.getByRole('navigation', { name: 'Glavna navigacija' });
    expect(nav).not.toHaveTextContent('Admin');
    expect(screen.queryByTestId('django-admin-link')).toBeNull();

    fireEvent.click(screen.getByTestId('user-menu'));
    const admin = screen.getByTestId('django-admin-link');
    expect(admin).toHaveTextContent('Admin');
    expect(admin).toHaveAttribute('href', 'https://admin.racunai.hr/admin/');
  });

  it('shows the mock toast from search', async () => {
    render(
      <AppShell>
        <p>sadržaj</p>
      </AppShell>,
    );
    await waitFor(() => expect(screen.getByLabelText('Pretraga')).toBeInTheDocument());
    fireEvent.submit(screen.getByLabelText('Pretraga').closest('form') as HTMLFormElement);
    expect(screen.getByTestId('mock-toast')).toHaveTextContent(MOCK_TOAST_MESSAGE);
  });
});
