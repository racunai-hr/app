import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api';

const push = vi.fn();
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

const clearTokens = vi.fn();
vi.mock('@/lib/auth', () => ({
  clearTokens: () => clearTokens(),
}));

const postPdvLedger = vi.fn();
vi.mock('@/lib/pdv', async () => {
  const actual = await vi.importActual<typeof import('@/lib/pdv')>('@/lib/pdv');
  return {
    ...actual,
    postPdvLedger: (...args: unknown[]) => postPdvLedger(...args),
  };
});

import { PdvOpenPeriodForm } from './PdvOpenPeriodForm';

const defaultProps = {
  slug: 'alma-cizmic',
  origin: 'http://127.0.0.1:8000',
  token: 'token',
  role: 'accountant',
};

function submitPeriod(value: string) {
  fireEvent.change(screen.getByLabelText('Razdoblje'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Generiraj knjige' }));
}

describe('PdvOpenPeriodForm', () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    clearTokens.mockReset();
    postPdvLedger.mockReset();
  });

  it('hides the submit button for viewers', () => {
    render(<PdvOpenPeriodForm {...defaultProps} role="viewer" />);
    expect(screen.queryByRole('button', { name: 'Generiraj knjige' })).not.toBeInTheDocument();
    expect(screen.getByText('Generiranje knjiga zahtijeva ulogu računovođe.')).toBeInTheDocument();
  });

  it('posts ledger for 2026-08 and navigates to kontrolni pregledi', async () => {
    postPdvLedger.mockResolvedValue({ created: 1, total: 1 });
    render(<PdvOpenPeriodForm {...defaultProps} />);
    submitPeriod('2026-08');
    await waitFor(() => {
      expect(postPdvLedger).toHaveBeenCalledWith(
        'http://127.0.0.1:8000',
        'token',
        '2026-08',
      );
    });
    expect(push).toHaveBeenCalledWith(
      '/t/alma-cizmic/porezi/pdv/kontrolni-pregledi?period=2026-08',
    );
  });

  it('disables input and button while posting so a second click does not rebuild twice', async () => {
    let resolveLedger: (value: { created: number; total: number }) => void = () => undefined;
    postPdvLedger.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLedger = resolve;
        }),
    );
    render(<PdvOpenPeriodForm {...defaultProps} />);
    submitPeriod('2026-08');
    await waitFor(() => {
      expect(postPdvLedger).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByLabelText('Razdoblje')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Generiram…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Generiram…' }));
    expect(postPdvLedger).toHaveBeenCalledTimes(1);
    resolveLedger({ created: 1, total: 1 });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/t/alma-cizmic/porezi/pdv/kontrolni-pregledi?period=2026-08',
      );
    });
  });

  it('shows a 409 detail and does not navigate', async () => {
    postPdvLedger.mockRejectedValue(
      new ApiError('PDV 08/2026: period status=submitted', 409),
    );
    render(<PdvOpenPeriodForm {...defaultProps} />);
    submitPeriod('2026-08');
    expect(await screen.findByText('PDV 08/2026: period status=submitted')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('does not post when the month is empty or invalid', () => {
    render(<PdvOpenPeriodForm {...defaultProps} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Generiraj knjige' }).closest('form')!);
    expect(postPdvLedger).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Razdoblje'), { target: { value: '2026-13' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generiraj knjige' }));
    expect(postPdvLedger).not.toHaveBeenCalled();
  });
});
