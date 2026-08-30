'use client';

import { useEffect } from 'react';

import { formatIban } from '@/lib/banking';

import { StatementImport } from './StatementImport';

type Props = {
  origin: string;
  token: string;
  role: string;
  account: { account_name: string; iban: string };
  onClose: () => void;
  onImported: () => void;
};

export function StatementImportDialog({
  origin,
  token,
  role,
  account,
  onClose,
  onImported,
}: Props) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="banking-import-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="banking-import-title"
      onClick={onClose}
    >
      <div
        className="banking-import-panel"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h2 id="banking-import-title">Uvezi novi XML izvadak (camt.053)</h2>
        <p className="banking-import-account">
          <strong>
            Račun: {account.account_name} · {formatIban(account.iban)}
          </strong>
        </p>
        <p>
          Odaberite CAMT.053 XML izvadak za ovaj račun. Račun se pri uvozu automatski određuje
          prema IBAN-u navedenom u XML datoteci.
        </p>
        <StatementImport origin={origin} token={token} role={role} onImported={onImported} />
        <div className="banking-import-dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
