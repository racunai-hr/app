import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./StatementImport', () => ({
  StatementImport: ({ onImported }: { onImported: () => void }) => (
    <button type="button" onClick={onImported}>
      fake-import
    </button>
  ),
}));

import { StatementImportDialog } from './StatementImportDialog';

const account = { account_name: 'Fine Star EUR — OTP', iban: 'HR6124070001100204771' };

function renderDialog(onClose = vi.fn(), onImported = vi.fn()) {
  return {
    onClose,
    onImported,
    ...render(
      <StatementImportDialog
        origin="https://x"
        token="t"
        role="owner"
        account={account}
        onClose={onClose}
        onImported={onImported}
      />,
    ),
  };
}

describe('StatementImportDialog', () => {
  it('renders the title, account context and IBAN-from-file note', () => {
    renderDialog();
    expect(screen.getByRole('dialog', { name: 'Uvezi novi XML izvadak (camt.053)' })).toBeInTheDocument();
    expect(screen.getByText(/Račun: Fine Star EUR — OTP · HR6124070001100204771/)).toBeInTheDocument();
    expect(
      screen.getByText(/Račun se pri uvozu automatski određuje prema IBAN-u navedenom u XML datoteci/),
    ).toBeInTheDocument();
  });

  it('closes on Escape, backdrop click and Zatvori', () => {
    const { onClose, rerender } = renderDialog();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <StatementImportDialog
        origin="https://x"
        token="t"
        role="owner"
        account={account}
        onClose={onClose}
        onImported={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: 'Zatvori' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('does not close when clicking inside the panel', () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByText(/Račun: Fine Star EUR/));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('forwards a successful import', () => {
    const { onImported } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'fake-import' }));
    expect(onImported).toHaveBeenCalledTimes(1);
  });
});
