import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PartnerContact } from '@/lib/partners';

const fetchPartnerContacts = vi.fn();
const patchPartnerContact = vi.fn();
const createPartnerContact = vi.fn();
const deletePartnerContact = vi.fn();

vi.mock('@/lib/partners', async () => {
  const actual = await vi.importActual<typeof import('@/lib/partners')>('@/lib/partners');
  return {
    ...actual,
    fetchPartnerContacts: (...args: unknown[]) => fetchPartnerContacts(...args),
    patchPartnerContact: (...args: unknown[]) => patchPartnerContact(...args),
    createPartnerContact: (...args: unknown[]) => createPartnerContact(...args),
    deletePartnerContact: (...args: unknown[]) => deletePartnerContact(...args),
  };
});

import { PartnerContactsPanel } from './PartnerContactsPanel';

function contact(overrides: Partial<PartnerContact> = {}): PartnerContact {
  return {
    id: 1,
    partner_id: 17,
    contact_type: 'general',
    first_name: 'Ana',
    last_name: 'Anić',
    full_name: 'Ana Anić',
    position: '',
    department: '',
    email: 'ana@example.com',
    phone: '01',
    mobile: '',
    notes: '',
    is_primary: true,
    is_active: true,
    created_at: null,
    ...overrides,
  };
}

describe('PartnerContactsPanel', () => {
  beforeEach(() => {
    fetchPartnerContacts.mockReset();
    patchPartnerContact.mockReset();
    createPartnerContact.mockReset();
    deletePartnerContact.mockReset();
    fetchPartnerContacts.mockResolvedValue({
      as_of: '2026-08-20T00:00:00Z',
      count: 1,
      results: [contact()],
    });
  });

  it('hides write controls for viewer', async () => {
    render(
      <PartnerContactsPanel origin="https://api.test" token="t" role="viewer" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByText('Ana Anić')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Uredi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Dodaj kontakt' })).toBeNull();
  });

  it('edits with dirty PATCH and cancel restores list actions', async () => {
    patchPartnerContact.mockResolvedValue(contact({ email: 'nova@example.com' }));
    fetchPartnerContacts
      .mockResolvedValueOnce({
        as_of: '2026-08-20T00:00:00Z',
        count: 1,
        results: [contact()],
      })
      .mockResolvedValueOnce({
        as_of: '2026-08-20T00:00:00Z',
        count: 1,
        results: [contact({ email: 'nova@example.com' })],
      });

    render(
      <PartnerContactsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));
    expect(screen.getByRole('heading', { name: 'Uredi kontakt' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nova@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(patchPartnerContact).toHaveBeenCalled());
    expect(patchPartnerContact.mock.calls[0][4]).toEqual({ email: 'nova@example.com' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument());
  });

  it('Odustani discards draft without PATCH', async () => {
    render(
      <PartnerContactsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'x@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(patchPartnerContact).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Uredi' })).toBeInTheDocument();
  });

  it('primary change reloads from server', async () => {
    fetchPartnerContacts.mockResolvedValue({
      as_of: '2026-08-20T00:00:00Z',
      count: 2,
      results: [contact({ id: 1, is_primary: true }), contact({ id: 2, first_name: 'Boris', last_name: 'B', full_name: 'Boris B', is_primary: false, email: '' })],
    });
    patchPartnerContact.mockResolvedValue(contact({ id: 2, is_primary: true }));

    render(
      <PartnerContactsPanel origin="https://api.test" token="t" role="owner" partnerId={17} />,
    );
    await waitFor(() => expect(screen.getByText('Boris B')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Postavi primarni' }));
    await waitFor(() => expect(patchPartnerContact).toHaveBeenCalledWith(
      'https://api.test',
      't',
      17,
      2,
      { is_primary: true },
    ));
    expect(fetchPartnerContacts.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
