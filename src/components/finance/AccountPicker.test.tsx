import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountRef, ChartOfAccountsList } from '@/lib/expensePosting';

import { ACCOUNT_PICKER_DEBOUNCE_MS, AccountPicker } from './AccountPicker';

const ACCOUNT_4198: AccountRef = {
  id: 38413,
  code: '4198',
  name: 'Troškovi posredovanja pri nabavi ili prodaji dobara i usluga',
  active: true,
};

const ACCOUNT_4100: AccountRef = {
  id: 38001,
  code: '4100',
  name: 'Troškovi telefona, teleksa, telefaxa i sl.',
  active: true,
};

function listOf(results: AccountRef[], count = results.length): ChartOfAccountsList {
  return { count, results };
}

function typeSearch(value: string) {
  fireEvent.change(screen.getByRole('combobox'), { target: { value } });
}

async function flushSearch() {
  await act(async () => {
    vi.advanceTimersByTime(ACCOUNT_PICKER_DEBOUNCE_MS);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('AccountPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not search on mount and waits 250ms after the first character', async () => {
    const search = vi.fn().mockResolvedValue(listOf([ACCOUNT_4198]));
    render(
      <AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={search} />,
    );
    expect(search).not.toHaveBeenCalled();

    typeSearch('4');
    expect(search).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(ACCOUNT_PICKER_DEBOUNCE_MS - 1);
    });
    expect(search).not.toHaveBeenCalled();
    await flushSearch();
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('4');
    expect(search.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
  });

  it('selects a highlighted result with Enter and keeps value separate from typing', async () => {
    const onChange = vi.fn();
    const search = vi.fn().mockResolvedValue(listOf([ACCOUNT_4100, ACCOUNT_4198]));
    render(<AccountPicker label="Konto rashoda" value={null} onChange={onChange} search={search} />);

    const input = screen.getByRole('combobox');
    typeSearch('41');
    await flushSearch();
    expect(screen.getByRole('option', { name: /4198/ })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(ACCOUNT_4198);
    expect(input).toHaveValue('4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga');
  });

  it('restores the committed label on blur and Escape without calling onChange', async () => {
    const onChange = vi.fn();
    const search = vi.fn().mockResolvedValue(listOf([ACCOUNT_4100]));
    render(
      <AccountPicker
        label="Konto rashoda"
        value={ACCOUNT_4198}
        onChange={onChange}
        search={search}
      />,
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga');

    typeSearch('410');
    await flushSearch();
    expect(screen.getByRole('option', { name: /4100/ })).toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga');

    typeSearch('410');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('4198 · Troškovi posredovanja pri nabavi ili prodaji dobara i usluga');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('clears the committed value only via the clear button', () => {
    const onChange = vi.fn();
    render(
      <AccountPicker
        label="Konto rashoda"
        value={ACCOUNT_4198}
        onChange={onChange}
        search={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Očisti' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('keeps the later search when an earlier request resolves last', async () => {
    let resolveFirst!: (value: ChartOfAccountsList) => void;
    let resolveSecond!: (value: ChartOfAccountsList) => void;
    const search = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<ChartOfAccountsList>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<ChartOfAccountsList>((resolve) => {
            resolveSecond = resolve;
          }),
      );

    render(<AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={search} />);
    typeSearch('4');
    await flushSearch();
    typeSearch('41');
    await flushSearch();
    expect(search).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveSecond(listOf([ACCOUNT_4198]));
      await Promise.resolve();
    });
    expect(screen.getByRole('option', { name: /4198/ })).toBeInTheDocument();
    await act(async () => {
      resolveFirst(listOf([ACCOUNT_4100]));
      await Promise.resolve();
    });
    expect(screen.getByRole('option', { name: /4198/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /4100/ })).not.toBeInTheDocument();
  });

  it('shows loading, empty, error and truncation states', async () => {
    let resolveSearch!: (value: ChartOfAccountsList) => void;
    const search = vi.fn().mockImplementation(
      () =>
        new Promise<ChartOfAccountsList>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    const { rerender } = render(
      <AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={search} />,
    );
    typeSearch('4');
    await flushSearch();
    expect(screen.getByRole('status')).toHaveTextContent('Tražim…');

    await act(async () => {
      resolveSearch(listOf([], 0));
      await Promise.resolve();
    });
    expect(screen.getByRole('status')).toHaveTextContent('Nema rezultata');

    const failing = vi.fn().mockRejectedValue(new Error('network'));
    rerender(
      <AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={failing} />,
    );
    typeSearch('41');
    await flushSearch();
    expect(screen.getByRole('status')).toHaveTextContent('Greška pri dohvaćanju konta');

    const truncated = vi.fn().mockResolvedValue(listOf([ACCOUNT_4100], 501));
    rerender(
      <AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={truncated} />,
    );
    typeSearch('1');
    await flushSearch();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Prikazano prvih 1 od 501 — suzite pretragu',
    );
  });

  it('exposes combobox and listbox ARIA attributes', async () => {
    const search = vi.fn().mockResolvedValue(listOf([ACCOUNT_4198]));
    render(<AccountPicker label="Konto rashoda" value={null} onChange={vi.fn()} search={search} />);
    const input = screen.getByRole('combobox', { name: 'Konto rashoda' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    const listboxId = input.getAttribute('aria-controls');
    expect(listboxId).toBeTruthy();

    typeSearch('4198');
    await flushSearch();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', listboxId);
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    expect(screen.getByRole('option', { name: /4198/ })).toHaveAttribute('aria-selected', 'true');
  });
});
