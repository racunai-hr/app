export type ReviewOption = { value: string; label: string };

export type ReviewQuestion = {
  key: string;
  type: 'vehicle_select' | 'single_choice' | 'boolean' | 'text' | string;
  label: string;
  required: boolean;
  options: ReviewOption[];
};

export type ReviewLine = {
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
};

export type ReviewAccount = {
  position: number;
  account_id: number;
  account_code: string;
  account_name: string;
  source: string;
};

export type ReviewVehicle = {
  id: number;
  name: string;
  vin: string;
  registration_plate: string;
  accounting_role: string;
};

export type ReviewForeignVat = {
  country: string;
  amount: string;
  net_amount: string;
  gross_amount: string;
  currency: string;
  treatment: string;
  fx_rate: string;
  fx_rate_source: string;
  fx_rate_date: string;
};

export type AccountingReview = {
  status: 'needs_information' | 'needs_confirmation' | 'resolved' | string;
  purchase_nature: string | null;
  posting_profile: string | null;
  profile_label: string;
  vehicle: ReviewVehicle | null;
  decision_source: string;
  reason: string;
  explanation: string;
  questions: ReviewQuestion[];
  preview: ReviewLine[] | null;
  line_accounts: ReviewAccount[];
  document_date: string;
  foreign_vat?: ReviewForeignVat | null;
};

export type ReviewAnswers = Record<string, string | number | boolean | null>;

const VEHICLE_PROFILES = new Set([
  'goods_inward_cost',
  'company_passenger_vehicle',
  'full_vat_vehicle',
  'vehicle_inventory_cost',
]);

const ACCOUNT_LOCKED_PROFILES = new Set(['company_passenger_vehicle', 'vehicle_inventory_cost']);

export function isVehiclePostingProfile(profile: string | null | undefined): boolean {
  return VEHICLE_PROFILES.has(profile || '');
}

/** Konta određuje pravilo knjiženja; ručno konto stavke se ne šalje. */
export function isAccountLockedProfile(profile: string | null | undefined): boolean {
  return ACCOUNT_LOCKED_PROFILES.has(profile || '');
}

export function applyReviewedAccounts<T>(
  current: Record<number, T | null>,
  review: AccountingReview,
  touched: ReadonlySet<number>,
  toAccount: (line: ReviewAccount) => T,
): Record<number, T | null> {
  const next: Record<number, T | null> = {};
  for (const [key, value] of Object.entries(current)) {
    const position = Number(key);
    if (touched.has(position)) next[position] = value;
  }
  const locked = review.status === 'needs_information' || isAccountLockedProfile(review.posting_profile);
  if (!locked) {
    for (const line of review.line_accounts || []) {
      if (!touched.has(line.position)) next[line.position] = toAccount(line);
    }
  }
  return next;
}

async function postReview(origin: string, token: string, path: string, answers: ReviewAnswers): Promise<AccountingReview> {
  const response = await fetch(`${origin}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    throw new Error('Pregled knjiženja nije uspio.');
  }
  return response.json();
}

export function fetchImportAccountingReview(
  origin: string,
  token: string,
  importId: number,
  answers: ReviewAnswers,
): Promise<AccountingReview> {
  return postReview(origin, token, `/api/purchasing/invoices/import/${importId}/accounting-review/`, answers);
}

export function fetchExpenseAccountingReview(
  origin: string,
  token: string,
  expenseId: number,
  answers: ReviewAnswers,
): Promise<AccountingReview> {
  return postReview(origin, token, `/api/finance/expenses/${expenseId}/accounting-review/`, answers);
}
