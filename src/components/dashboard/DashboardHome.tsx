import { formatHrMoney } from '@/lib/formatHr';
import {
  MOCK_DATA_NOTICE,
  agingTotal,
  cashFlowNet,
  dashboardMock,
  overdueShare,
} from '@/lib/dashboard/mockData';

import { CashFlowChart } from './CashFlowChart';

type Props = {
  companyName: string;
  onMockAction: () => void;
};

const money = (value: number) => formatHrMoney(value, dashboardMock.currency);

export function DashboardHome({ companyName, onMockAction }: Props) {
  const { financial, books, cashFlow, tasks, aging, taxCalendar, recentDocuments, quickActions } =
    dashboardMock;
  const totalOpen = agingTotal(aging);
  const overduePct = overdueShare(aging);
  const net = cashFlowNet(cashFlow.months);

  return (
    <div className="dash">
      <header className="dash-intro">
        <h1>Pregled</h1>
        <p>
          {companyName} · {dashboardMock.periodLabel} · {MOCK_DATA_NOTICE}
        </p>
      </header>

      <section className="dash-section" aria-labelledby="fin-heading">
        <h2 id="fin-heading">Financijski sažetak</h2>
        <div className="dash-kpis">
          <Kpi label="Stanje poslovnih računa" value={money(financial.bankBalance)} />
          <Kpi label="Otvorena potraživanja" value={money(financial.openReceivables)} />
          <Kpi label="Dospjela potraživanja" value={money(financial.overdueReceivables)} tone="warn" />
          <Kpi label="Otvorene obveze" value={money(financial.openPayables)} />
          <Kpi label="Procijenjena obveza PDV-a" value={money(financial.estimatedVat)} />
        </div>
      </section>

      <div className="dash-split">
        <section className="dash-section" aria-labelledby="books-heading">
          <h2 id="books-heading">Kontrola poslovnih knjiga</h2>
          <p className="dash-score">
            <strong>{books.score}</strong>
            <span>/100 · {books.scoreLabel}</span>
          </p>
          <dl className="dash-facts">
            <div>
              <dt>Stanje knjiženja</dt>
              <dd>
                {books.postingPosted} proknjiženo, {books.postingDraft} u nacrtu
              </dd>
            </div>
            <div>
              <dt>Stavke koje traže pozornost</dt>
              <dd>{books.attentionCount}</dd>
            </div>
            <div>
              <dt>Usklađenje banke</dt>
              <dd>{books.bankUnmatched} neusuglašene transakcije</dd>
            </div>
          </dl>
          <ul className="dash-warnings">
            {books.closeWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>

        <section className="dash-section" aria-labelledby="cash-heading">
          <h2 id="cash-heading">Novčani tok</h2>
          <p className="dash-lead">
            Neto {money(net)} u posljednjih šest mjeseci.
          </p>
          <CashFlowChart months={[...cashFlow.months]} />
        </section>
      </div>

      <div className="dash-split">
        <section className="dash-section" aria-labelledby="tasks-heading">
          <h2 id="tasks-heading">Zadaci koji traže pozornost</h2>
          <ul className="dash-tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <button type="button" className="dash-task" onClick={onMockAction}>
                  <strong>{task.title}</strong>
                  <span>{task.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="dash-section" aria-labelledby="aging-heading">
          <h2 id="aging-heading">Starosna struktura potraživanja</h2>
          <ul className="dash-aging">
            <AgingRow label="Nedospjelo" value={aging.notDue} total={totalOpen} />
            <AgingRow label="1–30 dana" value={aging.days1to30} total={totalOpen} />
            <AgingRow label="31–60 dana" value={aging.days31to60} total={totalOpen} />
            <AgingRow label="Više od 60 dana" value={aging.daysOver60} total={totalOpen} />
          </ul>
          <p className="dash-aging-total">
            Ukupno otvoreno {money(totalOpen)} · dospjelog {overduePct.toFixed(1).replace('.', ',')} %
          </p>
        </section>
      </div>

      <section className="dash-section" aria-labelledby="tax-heading">
        <h2 id="tax-heading">Porezni kalendar</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Obrazac</th>
                <th>Rok</th>
                <th>Stanje pripreme</th>
                <th>Procijenjena obveza</th>
              </tr>
            </thead>
            <tbody>
              {taxCalendar.map((row) => (
                <tr key={row.form}>
                  <td>{row.form}</td>
                  <td>{row.due}</td>
                  <td>{row.status}</td>
                  <td>{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section" aria-labelledby="docs-heading">
        <h2 id="docs-heading">Nedavni dokumenti</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Broj</th>
                <th>Partner</th>
                <th>Datum</th>
                <th>Iznos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDocuments.map((row) => (
                <tr key={row.number}>
                  <td>{row.number}</td>
                  <td>{row.partner}</td>
                  <td>{row.date}</td>
                  <td>{money(row.amount)}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section" aria-labelledby="actions-heading">
        <h2 id="actions-heading">Brze radnje</h2>
        <div className="dash-actions">
          {quickActions.map((action) => (
            <button key={action.id} type="button" className="dash-action" onClick={onMockAction}>
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className={tone === 'warn' ? 'dash-kpi is-warn' : 'dash-kpi'}>
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

function AgingRow({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total ? Math.max(4, (value / total) * 100) : 0;
  return (
    <li>
      <div className="dash-aging-meta">
        <span>{label}</span>
        <span>{formatHrMoney(value, dashboardMock.currency)}</span>
      </div>
      <div className="dash-bar" aria-hidden="true">
        <span style={{ width: `${width}%` }} />
      </div>
    </li>
  );
}
