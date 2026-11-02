'use client';

import { useState } from 'react';

import { formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import type { AccountingReview, ReviewAnswers, ReviewQuestion } from '@/lib/accountingReview';

const PROFILE_OPTIONS = [
  { value: 'opex', label: 'Operativni trošak' },
  { value: 'goods_inward_cost', label: 'Zavisni trošak nabave robe' },
  { value: 'vehicle_inventory_cost', label: 'Nabavna vrijednost vozila na zalihi' },
  { value: 'company_passenger_vehicle', label: 'Gorivo službenog osobnog vozila' },
  { value: 'full_vat_vehicle', label: 'Vozilo s punim odbitkom pretporeza' },
  { value: 'asset_purchase', label: 'Nabava dugotrajne imovine' },
];

type Props = {
  review: AccountingReview | null;
  answers: ReviewAnswers;
  currency: string;
  busy?: boolean;
  onAnswers: (next: ReviewAnswers) => void;
  onConfirm?: () => void;
};

export function AccountingReviewPanel({ review, answers, currency, busy, onAnswers, onConfirm }: Props) {
  const [changing, setChanging] = useState(false);
  if (!review) return null;
  const vehicle = review.vehicle;
  const vehicleLabel = vehicle
    ? [vehicle.name, vehicle.registration_plate || vehicle.vin].filter(Boolean).join(' · ')
    : '—';

  function setAnswer(key: string, value: string | boolean) {
    onAnswers({ ...answers, [key]: value });
  }

  return (
    <section className="ocr-card" aria-label="Pregled knjiženja">
      <h2>Pregled knjiženja</h2>
      <p>
        <strong>Prepoznato: </strong>
        {review.purchase_nature || '—'}
      </p>
      <p>
        <strong>Za: </strong>
        {vehicleLabel}
        {vehicle?.accounting_role ? ` (${vehicle.accounting_role})` : ''}
      </p>
      <p>
        <strong>Datum: </strong>
        {formatHrInputDate(review.document_date)}
      </p>
      <p>
        <strong>Predloženi tretman: </strong>
        {review.profile_label || '—'}
      </p>
      {review.foreign_vat ? (
        <p>
          <strong>Strani PDV: </strong>
          {formatHrMoney(review.foreign_vat.amount, review.foreign_vat.currency)}
          {review.foreign_vat.country ? ` (${review.foreign_vat.country})` : ''}
        </p>
      ) : null}
      <p>
        <strong>Razlog: </strong>
        {review.explanation || review.reason || '—'}
      </p>
      {review.questions.map((question) => (
        <QuestionField
          key={question.key}
          question={question}
          value={answers[question.key]}
          onChange={(value) => setAnswer(question.key, value)}
        />
      ))}
      {review.preview?.length ? (
        <table className="docs-table">
          <thead>
            <tr>
              <th>Konto</th>
              <th>Naziv</th>
              <th>Duguje</th>
              <th>Potražuje</th>
            </tr>
          </thead>
          <tbody>
            {review.preview.map((line, index) => (
              <tr key={`${line.account_code}-${index}`}>
                <td>{line.account_code}</td>
                <td>{line.account_name}</td>
                <td>{Number(line.debit) ? formatHrMoney(line.debit, currency) : '—'}</td>
                <td>{Number(line.credit) ? formatHrMoney(line.credit, currency) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <div className="ocr-actions">
        {onConfirm ? (
          <button type="button" className="btn btn-primary" disabled={busy || review.status === 'needs_information'} onClick={onConfirm}>
            Potvrdi
          </button>
        ) : null}
        <button type="button" className="btn btn-secondary" onClick={() => setChanging((open) => !open)}>
          Promijeni
        </button>
      </div>
      {changing ? (
        <label>
          Tretman
          <select
            aria-label="Tretman"
            value={String(answers.posting_profile || review.posting_profile || '')}
            onChange={(event) => setAnswer('posting_profile', event.target.value)}
          >
            <option value="">Odaberi</option>
            {PROFILE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </section>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ReviewQuestion;
  value: ReviewAnswers[string];
  onChange: (value: string | boolean) => void;
}) {
  if (question.type === 'boolean') {
    return (
      <label>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        {question.label}
      </label>
    );
  }
  if (question.type === 'text') {
    return (
      <label>
        {question.label}
        <input
          aria-label={question.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }
  const options = question.options || [];
  return (
    <label>
      {question.label}
      <select
        aria-label={question.label}
        value={value == null ? '' : String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Odaberi</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
