import { formatHrMoney } from '@/lib/formatHr';
import { dashboardMock } from '@/lib/dashboard/mockData';

type Month = { label: string; inflow: number; outflow: number };

const WIDTH = 560;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const CHART_H = HEIGHT - PAD_TOP - PAD_BOTTOM;
const CHART_W = WIDTH - PAD_LEFT - PAD_RIGHT;

export function CashFlowChart({ months }: { months: Month[] }) {
  const max = Math.max(...months.flatMap((row) => [row.inflow, row.outflow]), 1);
  const group = CHART_W / months.length;

  return (
    <figure className="dash-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Priljevi i odljevi po mjesecima za posljednjih šest mjeseci"
      >
        {months.map((row, index) => {
          const x = PAD_LEFT + index * group;
          const inflowH = (row.inflow / max) * CHART_H;
          const outflowH = (row.outflow / max) * CHART_H;
          const barW = Math.min(22, group / 2 - 8);
          const gap = 6;
          return (
            <g key={row.label}>
              <rect
                className="dash-bar-in"
                x={x + group / 2 - barW - gap / 2}
                y={PAD_TOP + CHART_H - inflowH}
                width={barW}
                height={inflowH}
              />
              <rect
                className="dash-bar-out"
                x={x + group / 2 + gap / 2}
                y={PAD_TOP + CHART_H - outflowH}
                width={barW}
                height={outflowH}
              />
              <text className="dash-chart-label" x={x + group / 2} y={HEIGHT - 12} textAnchor="middle">
                {row.label}
              </text>
            </g>
          );
        })}
        <line
          className="dash-chart-axis"
          x1={PAD_LEFT}
          y1={PAD_TOP + CHART_H}
          x2={WIDTH - PAD_RIGHT}
          y2={PAD_TOP + CHART_H}
        />
      </svg>
      <figcaption className="dash-legend">
        <span>
          <i className="dash-swatch dash-swatch-in" /> Priljev
        </span>
        <span>
          <i className="dash-swatch dash-swatch-out" /> Odljev
        </span>
        <span>
          Zadnji mjesec priljev {formatHrMoney(months[months.length - 1]?.inflow ?? 0, dashboardMock.currency)}
        </span>
      </figcaption>
    </figure>
  );
}
