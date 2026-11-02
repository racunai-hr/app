'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { getAccessToken } from '@/lib/auth';
import {
  applyExpensePrepayments,
  closeDraftFromBank,
  fetchCloseDraftPreview,
  fetchPrepaymentCandidates,
  postSupplierPrepayment,
  type CloseDraftLine,
  type CloseDraftPayment,
  type CloseDraftPreview,
  type PrepaymentCandidateList,
} from '@/lib/expenseClose';
import { fetchChartOfAccounts } from '@/lib/expensePosting';
import { formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import { AccountingReviewPanel } from '@/components/documents/AccountingReviewPanel';
import {
  applyReviewedAccounts,
  fetchExpenseAccountingReview,
  isAccountLockedProfile,
  isVehiclePostingProfile,
  type AccountingReview,
  type ReviewAnswers,
} from '@/lib/accountingReview';

type AccountPick = { id: number; code: string; name: string };

type Props = {
  expenseId: number;
  title: string;
  origin: string;
  onClose: () => void;
  onClosed: () => void;
};

export function CloseDraftDialog({ expenseId, title, origin, onClose, onClosed }: Props) {
  const titleId = useId();
  const idempotencyKey = useRef(crypto.randomUUID());
  const [preview, setPreview] = useState<CloseDraftPreview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Record<number, AccountPick | null>>({});
  const touchedAccounts = useRef(new Set<number>());
  const [remember, setRemember] = useState(false);
  const [search, setSearch] = useState('');
  const [hits, setHits] = useState<AccountPick[]>([]);
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [prepayments, setPrepayments] = useState<PrepaymentCandidateList | null>(null);
  const [mode, setMode] = useState<'payment' | 'prepayment'>('payment');
  const [prepaymentId, setPrepaymentId] = useState<number | 'new' | null>(null);
  const [purchaseNature, setPurchaseNature] = useState('service');
  const [vatTreatment, setVatTreatment] = useState('no_vat');
  const [accountingReview, setAccountingReview] = useState<AccountingReview | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<ReviewAnswers>({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError('Prijava je istekla.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchCloseDraftPreview(origin, token, expenseId),
      fetchPrepaymentCandidates(origin, token, expenseId),
    ])
      .then(([data, candidates]) => {
        if (cancelled) return;
        setPreview(data);
        setPrepayments(candidates);
        setPaymentId(data.payments[0]?.id ?? null);
        const showPrepayment =
          Number(candidates.ubl_prepaid_amount || 0) > 0 || candidates.prepayments.length > 0;
        if (showPrepayment && data.payments.length === 0 && candidates.prepayments.length > 0) {
          setMode('prepayment');
        }
        setPrepaymentId(candidates.prepayments[0]?.id ?? (data.payments.length > 0 ? 'new' : null));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Uplate se nisu učitale.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expenseId, origin]);

  useEffect(() => {
    touchedAccounts.current = new Set();
    setAccounts({});
  }, [expenseId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    fetchExpenseAccountingReview(origin, token, expenseId, reviewAnswers)
      .then((next) => {
        if (cancelled) return;
        setAccountingReview(next);
        setAccounts((current) =>
          applyReviewedAccounts(current, next, touchedAccounts.current, (line) => ({
            id: line.account_id,
            code: line.account_code,
            name: line.account_name,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setAccountingReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [expenseId, origin, reviewAnswers]);

  useEffect(() => {
    const term = search.trim();
    if (!term || preview?.remembered) {
      setHits([]);
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchChartOfAccounts(origin, token, term, controller.signal)
        .then((data) => {
          setHits(data.results.map((row) => ({ id: row.id, code: row.code, name: row.name })));
        })
        .catch(() => {
          if (!controller.signal.aborted) setHits([]);
        });
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [origin, preview?.remembered, search]);

  const showPrepayment =
    Number(prepayments?.ubl_prepaid_amount || 0) > 0 || (prepayments?.prepayments.length ?? 0) > 0;

  function chosenLines() {
    if (!preview) return null;
    const lines = preview.lines.map((line) => {
      const picked = accounts[line.position];
      return picked ? { position: line.position, account_id: picked.id } : null;
    });
    const profile = accountingReview?.posting_profile;
    const useRule =
      isAccountLockedProfile(profile) ||
      preview.remembered ||
      (isVehiclePostingProfile(profile) && touchedAccounts.current.size === 0);
    if (!useRule && lines.some((line) => line == null)) {
      setError('Odaberi konto za svaku stavku.');
      return null;
    }
    return useRule ? undefined : (lines as Array<{ position: number; account_id: number }>);
  }

  async function confirmPrepayment() {
    if (!preview || !prepayments || prepayments.supplier_id == null || prepaymentId == null) return;
    const token = getAccessToken();
    if (!token) {
      setError('Prijava je istekla.');
      return;
    }
    const lines = chosenLines();
    if (lines === null) return;
    setBusy(true);
    setError('');
    try {
      let application = prepayments.prepayments.find((row) => row.id === prepaymentId);
      if (prepaymentId === 'new') {
        if (paymentId == null) {
          setError('Odaberi terećenje koje se knjiži kao predujam.');
          setBusy(false);
          return;
        }
        const created = await postSupplierPrepayment(
          origin,
          token,
          paymentId,
          `${idempotencyKey.current}-prepayment`,
          {
            partner_id: prepayments.supplier_id,
            purchase_nature: purchaseNature,
            vat_treatment: purchaseNature === 'service' ? vatTreatment : '',
          },
        );
        application = {
          id: created.id,
          posting_date: '',
          original_amount: created.original_amount,
          available_amount: created.original_amount,
          currency: prepayments.currency,
          purchase_nature: purchaseNature,
          vat_treatment: vatTreatment,
          account_code: '',
        };
      }
      if (!application) {
        setError('Odaberi predujam.');
        setBusy(false);
        return;
      }
      await applyExpensePrepayments(origin, token, expenseId, `${idempotencyKey.current}-apply`, {
        applications: [{ prepayment_id: application.id, amount: application.available_amount }],
        remember: preview.remembered ? false : remember,
        lines,
        answers: reviewAnswers,
      });
      onClosed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Knjiženje predujma nije uspjelo.');
      setBusy(false);
    }
  }

  async function confirm() {
    if (mode === 'prepayment') {
      await confirmPrepayment();
      return;
    }
    if (!preview || paymentId == null) return;
    const token = getAccessToken();
    if (!token) {
      setError('Prijava je istekla.');
      return;
    }
    const lines = preview.lines.map((line) => {
      const picked = accounts[line.position];
      return picked ? { position: line.position, account_id: picked.id } : null;
    });
    const profile = accountingReview?.posting_profile;
    const useRule =
      isAccountLockedProfile(profile) ||
      preview.remembered ||
      (isVehiclePostingProfile(profile) && touchedAccounts.current.size === 0);
    if (!useRule && lines.some((line) => line == null)) {
      setError('Odaberi konto za svaku stavku.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await closeDraftFromBank(origin, token, expenseId, idempotencyKey.current, {
        bank_transaction_id: paymentId,
        remember: preview.remembered ? false : remember,
        lines: useRule ? undefined : (lines as Array<{ position: number; account_id: number }>),
        answers: reviewAnswers,
      });
      onClosed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Knjiženje nije uspjelo.');
      setBusy(false);
    }
  }

  return (
    <div className="incoming-reject-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="incoming-reject-panel close-draft-panel">
        <h2 id={titleId}>Knjiži i zatvori</h2>
        <p>{title}</p>
        {loading && <p>Tražim uplatu istog iznosa…</p>}
        {error && <div className="error">{error}</div>}
        {preview && preview.payments.length === 0 && !showPrepayment && (
          <p>Nema uplate istog iznosa. Nacrt ostaje.</p>
        )}
        {showPrepayment && prepayments && (
          <fieldset className="close-draft-payments">
            <legend>Predujam</legend>
            <label className="close-draft-payment">
              <input
                type="radio"
                name="close-draft-mode"
                checked={mode === 'prepayment'}
                onChange={() => setMode('prepayment')}
              />
              <span>Zatvori predujmom</span>
            </label>
            <label className="close-draft-payment">
              <input
                type="radio"
                name="close-draft-mode"
                checked={mode === 'payment'}
                onChange={() => setMode('payment')}
              />
              <span>Zatvori uplatom obveze</span>
            </label>
            {mode === 'prepayment' &&
              prepayments.prepayments.map((row) => (
                <label className="close-draft-payment" key={row.id}>
                  <input
                    type="radio"
                    name="close-draft-prepayment"
                    checked={prepaymentId === row.id}
                    onChange={() => setPrepaymentId(row.id)}
                  />
                  <span>
                    {formatHrInputDate(row.posting_date)} · {formatHrMoney(row.available_amount, row.currency)} ·{' '}
                    {row.account_code}
                  </span>
                </label>
              ))}
            {mode === 'prepayment' && preview && preview.payments.length > 0 && (
              <label className="close-draft-payment">
                <input
                  type="radio"
                  name="close-draft-prepayment"
                  checked={prepaymentId === 'new'}
                  onChange={() => setPrepaymentId('new')}
                />
                <span>Knjiži odabrano terećenje kao predujam</span>
              </label>
            )}
            {mode === 'prepayment' && prepaymentId === 'new' && (
              <div className="close-draft-accounts">
                <label>
                  Vrsta nabave
                  <select value={purchaseNature} onChange={(event) => setPurchaseNature(event.target.value)}>
                    {prepayments.purchase_natures.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </label>
                {purchaseNature === 'service' && (
                  <label>
                    PDV tretman
                    <select value={vatTreatment} onChange={(event) => setVatTreatment(event.target.value)}>
                      {prepayments.vat_treatments.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
          </fieldset>
        )}
        {preview && preview.payments.length > 0 && (mode === 'payment' || prepaymentId === 'new') && (
          <fieldset className="close-draft-payments">
            <legend>Uplata</legend>
            {preview.payments.map((payment) => (
              <PaymentChoice
                key={payment.id}
                payment={payment}
                checked={paymentId === payment.id}
                onChange={() => setPaymentId(payment.id)}
              />
            ))}
          </fieldset>
        )}
        {preview &&
          !isAccountLockedProfile(accountingReview?.posting_profile) &&
          !preview.remembered &&
          (preview.payments.length > 0 || mode === 'prepayment') && (
          <div className="close-draft-accounts">
            {preview.lines.map((line) => (
              <LineAccount
                key={line.position}
                line={line}
                picked={accounts[line.position]}
                active={activePosition === line.position}
                hits={activePosition === line.position ? hits : []}
                onSearch={(value) => {
                  setActivePosition(line.position);
                  setSearch(value);
                }}
                onPick={(account) => {
                  touchedAccounts.current.add(line.position);
                  setAccounts((current) => ({ ...current, [line.position]: account }));
                  setSearch('');
                  setHits([]);
                }}
              />
            ))}
            <label className="close-draft-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Zapamti za ovog dobavljača i ove stavke
            </label>
          </div>
        )}
        {preview?.remembered && (preview.payments.length > 0 || mode === 'prepayment') && (
          <p>Konta su zapamćena za ovog dobavljača i ove stavke.</p>
        )}
        <AccountingReviewPanel
          review={accountingReview}
          answers={reviewAnswers}
          currency={preview?.payments[0]?.currency || 'EUR'}
          busy={busy}
          onAnswers={setReviewAnswers}
        />
        <div className="incoming-detail-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Odustani
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              busy ||
              loading ||
              !preview ||
              (mode === 'payment'
                ? paymentId == null || preview.payments.length === 0
                : prepaymentId == null || (prepaymentId === 'new' && paymentId == null))
            }
            onClick={confirm}
          >
            {busy ? 'Knjižim…' : mode === 'prepayment' ? 'Knjiži i zatvori predujmom' : 'Knjiži i zatvori'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentChoice({
  payment,
  checked,
  onChange,
}: {
  payment: CloseDraftPayment;
  checked: boolean;
  onChange: () => void;
}) {
  const label = [
    formatHrInputDate(payment.transaction_date),
    formatHrMoney(payment.amount, payment.currency),
    payment.counterparty_name,
    payment.description,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <label className="close-draft-payment">
      <input type="radio" name="close-draft-payment" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function LineAccount({
  line,
  picked,
  active,
  hits,
  onSearch,
  onPick,
}: {
  line: CloseDraftLine;
  picked: AccountPick | null | undefined;
  active: boolean;
  hits: AccountPick[];
  onSearch: (value: string) => void;
  onPick: (account: AccountPick) => void;
}) {
  const label = line.description.trim() || 'Račun';
  return (
    <div className="close-draft-line">
      <span>{label}</span>
      <strong>{picked ? `${picked.code} · ${picked.name}` : 'Konto nije odabran'}</strong>
      <input
        aria-label={`Konto za ${label}`}
        placeholder="Traži šifru ili naziv"
        onChange={(event) => onSearch(event.target.value)}
      />
      {active && hits.length > 0 && (
        <ul className="close-draft-hits">
          {hits.slice(0, 8).map((hit) => (
            <li key={hit.id}>
              <button type="button" onClick={() => onPick(hit)}>
                {hit.code} · {hit.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
