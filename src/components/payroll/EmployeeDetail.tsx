'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { ApiError } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { contractSalaryIsHrk, formatHrInputDate } from '@/lib/formatHr';
import { PayrollMoney } from '@/components/payroll/PayrollMoney';
import {
  canWritePayroll,
  contractTypeLabel,
  createContract,
  employeesHref,
  fetchEmployee,
  updateContract,
  updateEmployee,
  type Contract,
  type Employee,
} from '@/lib/payroll';

type Props = { slug: string; employeeId: number };

export function EmployeeDetail({ slug, employeeId }: Props) {
  const router = useRouter();
  const { session, loading, error: sessionError } = useBankingSession(slug);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [showNewContract, setShowNewContract] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const data = await fetchEmployee(session.origin, session.token, employeeId);
      setEmployee(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        router.replace('/');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace(employeesHref(slug));
        return;
      }
      setError(err instanceof Error ? err.message : 'Zaposlenik se nije učitao.');
    }
  }, [session, employeeId, router, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (sessionError && !session) return <div className="error">{sessionError}</div>;
  if (loading || !session || !employee) return <div className="loading">Učitavanje…</div>;

  const writable = canWritePayroll(session.role);

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>{employee.full_name}</h1>
          <p>OIB {employee.oib}</p>
        </div>
        <a className="btn btn-secondary" href={employeesHref(slug)}>
          ← Zaposlenici
        </a>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <form
        className="partner-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!writable) return;
          const fd = new FormData(event.currentTarget);
          setSaving(true);
          setError('');
          try {
            const updated = await updateEmployee(session.origin, session.token, employeeId, {
              street: String(fd.get('street') || ''),
              city: String(fd.get('city') || ''),
              municipality_code: String(fd.get('municipality_code') || ''),
              work_location: String(fd.get('work_location') || ''),
              iban: String(fd.get('iban') || ''),
              bank_name: String(fd.get('bank_name') || ''),
              mio_pillar: (fd.get('mio_pillar') as 'both' | 'first_only') || 'both',
              is_active: fd.get('is_active') === 'on',
              notes: String(fd.get('notes') || ''),
              sex: String(fd.get('sex') || ''),
              citizenship: String(fd.get('citizenship') || ''),
              occupation: String(fd.get('occupation') || ''),
              qualification: String(fd.get('qualification') || ''),
              employment_status: String(fd.get('employment_status') || ''),
              work_permit_number: String(fd.get('work_permit_number') || ''),
              residence_street: String(fd.get('residence_street') || ''),
              residence_city: String(fd.get('residence_city') || ''),
              residence_municipality_code: String(fd.get('residence_municipality_code') || ''),
            });
            setEmployee({ ...updated, contracts: employee.contracts });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Spremanje nije uspjelo.');
          } finally {
            setSaving(false);
          }
        }}
      >
        <label>
          Ulica i kućni broj
          <input name="street" defaultValue={employee.street} disabled={!writable} />
        </label>
        <label>
          Mjesto prebivališta
          <input name="city" defaultValue={employee.city} disabled={!writable} />
        </label>
        <label>
          Šifra JLS prebivališta
          <input
            name="municipality_code"
            defaultValue={employee.municipality_code}
            pattern="\d{5}"
            disabled={!writable}
          />
        </label>
        <label>
          Mjesto rada
          <input name="work_location" defaultValue={employee.work_location} disabled={!writable} />
        </label>
        <label>
          IBAN
          <input name="iban" defaultValue={employee.iban} disabled={!writable} />
        </label>
        <label>
          Banka
          <input name="bank_name" defaultValue={employee.bank_name} disabled={!writable} />
        </label>
        <label>
          Mirovinski stup
          <select name="mio_pillar" defaultValue={employee.mio_pillar} disabled={!writable}>
            <option value="both">I. i II. stup</option>
            <option value="first_only">Samo I. stup (generacijska solidarnost)</option>
          </select>
        </label>
        <label>
          <input name="is_active" type="checkbox" defaultChecked={employee.is_active} disabled={!writable} />
          Aktivan
        </label>
        <label>
          Spol
          <input name="sex" defaultValue={employee.sex || ''} disabled={!writable} />
        </label>
        <label>
          Državljanstvo
          <input name="citizenship" defaultValue={employee.citizenship || ''} disabled={!writable} />
        </label>
        <label>
          Status
          <input name="employment_status" defaultValue={employee.employment_status || ''} disabled={!writable} />
        </label>
        <label>
          Zanimanje
          <input name="occupation" defaultValue={employee.occupation || ''} disabled={!writable} />
        </label>
        <label>
          Stručna sprema
          <input name="qualification" defaultValue={employee.qualification || ''} disabled={!writable} />
        </label>
        <label>
          Uobičajeno boravište — ulica
          <input name="residence_street" defaultValue={employee.residence_street || ''} disabled={!writable} />
        </label>
        <label>
          Uobičajeno boravište — mjesto
          <input name="residence_city" defaultValue={employee.residence_city || ''} disabled={!writable} />
        </label>
        <label>
          Šifra JLS boravišta
          <input
            name="residence_municipality_code"
            defaultValue={employee.residence_municipality_code || ''}
            pattern="\d{5}"
            disabled={!writable}
          />
        </label>
        <label>
          Dozvola za rad
          <input name="work_permit_number" defaultValue={employee.work_permit_number || ''} disabled={!writable} />
        </label>
        {employee.legal_evidence_gaps?.length ? (
          <p className="error">Nedostaje: {employee.legal_evidence_gaps.join(', ')}</p>
        ) : null}
        <label>
          Napomene
          <input name="notes" defaultValue={employee.notes} disabled={!writable} />
        </label>
        {writable ? (
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Spremanje…' : 'Spremi'}
          </button>
        ) : null}
      </form>

      <h2>Ugovori o radu</h2>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Od</th>
              <th>Do</th>
              <th>Vrsta</th>
              <th className="cell-amount">Bruto plaća</th>
              <th className="cell-amount">Radno vrijeme</th>
              <th>Aktivan</th>
            </tr>
          </thead>
          <tbody>
            {employee.contracts && employee.contracts.length ? (
              employee.contracts.map((contract) => (
                <ContractRow
                  key={contract.id}
                  contract={contract}
                  writable={writable}
                  onSave={async (data) => {
                    const updated = await updateContract(
                      session.origin,
                      session.token,
                      employeeId,
                      contract.id,
                      data,
                    );
                    setEmployee((prev) =>
                      prev
                        ? {
                            ...prev,
                            contracts: prev.contracts?.map((c) => (c.id === updated.id ? updated : c)),
                          }
                        : prev,
                    );
                  }}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6}>Nema ugovora o radu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {writable && !showNewContract ? (
        <button type="button" className="btn btn-secondary" onClick={() => setShowNewContract(true)}>
          Novi ugovor o radu
        </button>
      ) : null}

      {writable && showNewContract ? (
        <form
          className="partner-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            setSavingContract(true);
            setError('');
            try {
              await createContract(session.origin, session.token, employeeId, {
                start_date: String(fd.get('start_date') || ''),
                end_date: String(fd.get('end_date') || '') || null,
                base_gross_salary: String(fd.get('base_gross_salary') || ''),
                work_time_percentage: String(fd.get('work_time_percentage') || '100.00'),
                recipient_code: String(fd.get('recipient_code') || '0001'),
                income_type_code: String(fd.get('income_type_code') || '0001'),
                job_title: String(fd.get('job_title') || ''),
                signed_at: String(fd.get('signed_at') || '') || null,
                probation_months: fd.get('probation_months')
                  ? Number(fd.get('probation_months'))
                  : null,
                notice_rule: String(fd.get('notice_rule') || ''),
                collective_agreement_ref: String(fd.get('collective_agreement_ref') || ''),
              });
              setShowNewContract(false);
              await load();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Ugovor se nije mogao spremiti.');
            } finally {
              setSavingContract(false);
            }
          }}
        >
          <label>
            Datum početka
            <input name="start_date" type="date" required />
          </label>
          <label>
            Datum prestanka
            <input name="end_date" type="date" />
          </label>
          <label>
            Ugovorena bruto plaća
            <input name="base_gross_salary" type="number" step="0.01" min="0" required />
          </label>
          <label>
            Radno vrijeme (%)
            <input name="work_time_percentage" type="number" step="0.01" defaultValue={100} />
          </label>
          <label>
            Oznaka stjecatelja (JOPPD)
            <input name="recipient_code" defaultValue="0001" />
          </label>
          <label>
            Oznaka primitka (JOPPD)
            <input name="income_type_code" defaultValue="0001" />
          </label>
          <label>
            Radno mjesto
            <input name="job_title" />
          </label>
          <label>
            Datum potpisa
            <input name="signed_at" type="date" />
          </label>
          <label>
            Probni rok (mjeseci)
            <input name="probation_months" type="number" min="0" />
          </label>
          <label>
            Otkazni rok
            <input name="notice_rule" />
          </label>
          <label>
            Kolektivni ugovor
            <input name="collective_agreement_ref" />
          </label>
          <button type="submit" className="btn" disabled={savingContract}>
            {savingContract ? 'Spremanje…' : 'Spremi ugovor'}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function ContractRow({
  contract,
  writable,
  onSave,
}: {
  contract: Contract;
  writable: boolean;
  onSave: (data: { end_date: string | null; is_active: boolean }) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <tr>
      <td>{formatHrInputDate(contract.start_date)}</td>
      <td>{formatHrInputDate(contract.end_date)}</td>
      <td>{contractTypeLabel(contract.contract_type)}</td>
      <td className="cell-amount">
        <PayrollMoney
          amount={contract.base_gross_salary}
          hrk={contractSalaryIsHrk(contract.start_date)}
        />
      </td>
      <td className="cell-amount">{contract.work_time_percentage}%</td>
      <td>
        {contract.is_active ? 'Da' : 'Ne'}
        {writable && contract.is_active ? (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() =>
              void (async () => {
                setBusy(true);
                try {
                  await onSave({ end_date: new Date().toISOString().slice(0, 10), is_active: false });
                } finally {
                  setBusy(false);
                }
              })()
            }
          >
            Okončaj
          </button>
        ) : null}
      </td>
    </tr>
  );
}
