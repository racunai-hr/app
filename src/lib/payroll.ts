import { ApiError, parseError as parseApiError } from './api';
import { tenantApiOrigin, triggerBlobDownload } from './documents';
import type { components } from './openapi/generated';
import { tenantFetch } from './tenantRequest';

export { tenantApiOrigin };

export type Contract = components['schemas']['Contract'];
export type Employee = components['schemas']['Employee'];

export type ComplianceFlag = { code: string; gross?: string; minimum?: string };

export type PayslipSummary = Omit<components['schemas']['PayslipSummary'], 'compliance_flags'> & {
  compliance_flags?: ComplianceFlag[];
};

export type PayrollPeriod = Omit<components['schemas']['PayrollPeriod'], 'payslips'> & {
  payslips?: PayslipSummary[];
};

export type PayslipDetail = Omit<
  components['schemas']['PayslipDetail'],
  'period' | 'compliance_flags'
> & {
  period: { year: number; month: number };
  compliance_flags?: ComplianceFlag[];
};

const PERIOD_STATUS_LABELS: Record<string, string> = {
  draft: 'Nacrt',
  calculated: 'Obračunato',
  posted: 'Knjiženo',
};

export function payrollPeriodStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PERIOD_STATUS_LABELS[status] || status;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  definite: 'Na određeno vrijeme',
  indefinite: 'Na neodređeno vrijeme',
};

export function contractTypeLabel(type: string | null | undefined): string {
  if (!type) return '—';
  return CONTRACT_TYPE_LABELS[type] || type;
}

export function canWritePayroll(role: string): boolean {
  return role === 'owner' || role === 'accountant';
}

export function payrollPeriodLabel(year: number, month: number): string {
  return `${String(month).padStart(2, '0')}/${year}`;
}

export function employeesHref(slug: string): string {
  return `/t/${slug}/place/zaposlenici`;
}

export function employeeHref(slug: string, id: number): string {
  return `/t/${slug}/place/zaposlenici/${id}`;
}

export function periodsHref(slug: string): string {
  return `/t/${slug}/place`;
}

export function periodHref(slug: string, id: number): string {
  return `/t/${slug}/place/periodi/${id}`;
}

export function worktimeHref(slug: string): string {
  return `/t/${slug}/place/evidencija`;
}

export function payslipHref(slug: string, id: number): string {
  return `/t/${slug}/place/obracunske-liste/${id}`;
}

async function authorized(
  origin: string,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  return tenantFetch(`${origin}${path}`, { ...init, headers });
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  return response.json();
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// --- Employees ---------------------------------------------------------

export async function fetchEmployees(origin: string, token: string): Promise<{ results: Employee[] }> {
  return readJson(await authorized(origin, '/api/hr/employees/', token));
}

export async function fetchEmployee(origin: string, token: string, id: number): Promise<Employee> {
  return readJson(await authorized(origin, `/api/hr/employees/${id}/`, token));
}

export type EmployeeInput = Partial<
  Pick<
    Employee,
    | 'code'
    | 'first_name'
    | 'last_name'
    | 'oib'
    | 'date_of_birth'
    | 'street'
    | 'city'
    | 'municipality_code'
    | 'work_location'
    | 'iban'
    | 'bank_name'
    | 'mio_pillar'
    | 'personal_allowance_coefficient'
    | 'is_active'
    | 'notes'
    | 'sex'
    | 'citizenship'
    | 'occupation'
    | 'qualification'
    | 'licence_note'
    | 'employment_status'
    | 'work_permit_number'
    | 'residence_street'
    | 'residence_city'
    | 'residence_municipality_code'
  >
>;

export async function createEmployee(
  origin: string,
  token: string,
  data: EmployeeInput,
): Promise<Employee> {
  return readJson(await authorized(origin, '/api/hr/employees/', token, jsonInit('POST', data)));
}

export async function updateEmployee(
  origin: string,
  token: string,
  id: number,
  data: EmployeeInput,
): Promise<Employee> {
  return readJson(
    await authorized(origin, `/api/hr/employees/${id}/`, token, jsonInit('PATCH', data)),
  );
}

export type ContractInput = {
  start_date: string;
  end_date?: string | null;
  contract_type?: string;
  base_gross_salary: string;
  work_time_percentage?: string;
  recipient_code?: string;
  income_type_code?: string;
  is_active?: boolean;
  signed_at?: string | null;
  job_title?: string;
  probation_months?: number | null;
  notice_rule?: string;
  annual_leave_rule?: string;
  collective_agreement_ref?: string;
  termination_reason?: string;
};

export async function createContract(
  origin: string,
  token: string,
  employeeId: number,
  data: ContractInput,
): Promise<Contract> {
  return readJson(
    await authorized(
      origin,
      `/api/hr/employees/${employeeId}/contracts/`,
      token,
      jsonInit('POST', data),
    ),
  );
}

export async function updateContract(
  origin: string,
  token: string,
  employeeId: number,
  contractId: number,
  data: Partial<ContractInput>,
): Promise<Contract> {
  return readJson(
    await authorized(
      origin,
      `/api/hr/employees/${employeeId}/contracts/${contractId}/`,
      token,
      jsonInit('PATCH', data),
    ),
  );
}

// --- Payroll periods -----------------------------------------------------

export async function fetchPeriods(
  origin: string,
  token: string,
): Promise<{ results: PayrollPeriod[] }> {
  return readJson(await authorized(origin, '/api/hr/payroll-periods/', token));
}

export async function fetchPeriod(origin: string, token: string, id: number): Promise<PayrollPeriod> {
  return readJson(await authorized(origin, `/api/hr/payroll-periods/${id}/`, token));
}

export async function createPeriod(
  origin: string,
  token: string,
  data: { year: number; month: number; calculation_date: string; payment_date: string },
): Promise<PayrollPeriod> {
  return readJson(
    await authorized(origin, '/api/hr/payroll-periods/', token, jsonInit('POST', data)),
  );
}

export async function generatePeriod(
  origin: string,
  token: string,
  id: number,
): Promise<PayrollPeriod> {
  return readJson(
    await authorized(origin, `/api/hr/payroll-periods/${id}/generate/`, token, { method: 'POST' }),
  );
}

export async function calculatePeriod(
  origin: string,
  token: string,
  id: number,
): Promise<PayrollPeriod> {
  return readJson(
    await authorized(origin, `/api/hr/payroll-periods/${id}/calculate/`, token, { method: 'POST' }),
  );
}

export async function postPeriod(origin: string, token: string, id: number): Promise<PayrollPeriod> {
  return readJson(
    await authorized(origin, `/api/hr/payroll-periods/${id}/post/`, token, { method: 'POST' }),
  );
}

async function downloadPdf(origin: string, path: string, token: string, fallback: string): Promise<void> {
  const response = await authorized(origin, path, token, { headers: { Accept: 'application/pdf' } });
  if (!response.ok) throw new ApiError(await parseApiError(response), response.status);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  triggerBlobDownload(await response.blob(), match?.[1] || fallback);
}

export async function downloadJournalPdf(origin: string, token: string, id: number): Promise<void> {
  await downloadPdf(origin, `/api/hr/payroll-periods/${id}/journal-pdf/`, token, `Knjizenje_place_${id}.pdf`);
}

export async function downloadPaymentRecapPdf(origin: string, token: string, id: number): Promise<void> {
  await downloadPdf(
    origin,
    `/api/hr/payroll-periods/${id}/payment-recap-pdf/`,
    token,
    `Rekapitulacija_isplata_${id}.pdf`,
  );
}

export async function downloadCalculationRecapPdf(
  origin: string,
  token: string,
  id: number,
): Promise<void> {
  await downloadPdf(
    origin,
    `/api/hr/payroll-periods/${id}/calculation-recap-pdf/`,
    token,
    `Rekapitulacija_obracuna_${id}.pdf`,
  );
}

// --- Payslips --------------------------------------------------------------

export async function fetchPayslip(origin: string, token: string, id: number): Promise<PayslipDetail> {
  return readJson(await authorized(origin, `/api/hr/payslips/${id}/`, token));
}

export async function downloadPayslipPdf(origin: string, token: string, id: number): Promise<void> {
  await downloadPdf(origin, `/api/hr/payslips/${id}/pdf/`, token, `Obracunska_lista_${id}.pdf`);
}

export type WorkTimeMonthView = {
  status: string;
  entries: Array<{ id: number; date: string; type_code: string; type_name: string; hours: string }>;
};

export async function fetchWorkTime(
  origin: string,
  token: string,
  employeeId: number,
  year: number,
  month: number,
): Promise<WorkTimeMonthView> {
  const params = new URLSearchParams({ employee: String(employeeId), year: String(year), month: String(month) });
  return readJson(await authorized(origin, `/api/hr/worktime/?${params}`, token));
}

export async function saveWorkTimeEntry(
  origin: string,
  token: string,
  body: { employee_id: number; date: string; type_code: string; hours: string },
): Promise<void> {
  await readJson(await authorized(origin, '/api/hr/worktime/', token, jsonInit('POST', body)));
}

export async function addPayslipEarning(
  origin: string,
  token: string,
  payslipId: number,
  body: { name: string; hours: string; gross_amount: string; type_code?: string },
): Promise<void> {
  await readJson(
    await authorized(origin, `/api/hr/payslips/${payslipId}/earnings/`, token, jsonInit('POST', body)),
  );
}

export async function addPayslipAdjustment(
  origin: string,
  token: string,
  payslipId: number,
  body: { name: string; amount: string; kind: string },
): Promise<void> {
  await readJson(
    await authorized(origin, `/api/hr/payslips/${payslipId}/adjustments/`, token, jsonInit('POST', body)),
  );
}

export async function lockWorkTime(
  origin: string,
  token: string,
  employeeId: number,
  year: number,
  month: number,
): Promise<WorkTimeMonthView> {
  return readJson(
    await authorized(
      origin,
      '/api/hr/worktime/lock/',
      token,
      jsonInit('POST', { employee_id: employeeId, year, month }),
    ),
  );
}
