import { useId, useState } from 'react'
import { CalendarBlankIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import {
  reportTrendForPeriod,
  reportTrendCsv,
  reportMoney,
  type ReportPeriod,
} from '@/data/reports-demo'
import { smoothLinePath } from '@/lib/chart-path'
import { downloadCsv } from '@/lib/download'

const colors = { revenue: '#478efc', profit: '#efd5b3' }

export default function ProfitRevenueChart({
  period,
  onPeriodChange,
}: {
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
}) {
  const id = useId()
  const data = reportTrendForPeriod(period)
  const [active, setActive] = useState<number | null>(3)
  const [visible, setVisible] = useState({ revenue: true, profit: true })
  const min = period === 'monthly' ? 20000 : 0
  const max =
    period === 'monthly'
      ? 80000
      : Math.ceil(Math.max(...data.flatMap((row) => [row.revenue, row.profit])) / 50000) * 50000
  const plot = { x: 85, y: 35, width: 1050, height: 230 }
  const x = (index: number) => plot.x + (index * plot.width) / (data.length - 1)
  const y = (value: number) => plot.y + plot.height * (1 - (value - min) / (max - min))
  const series = visible.revenue ? 'revenue' : 'profit'
  const selected = active === null ? undefined : data[active]

  function toggle(key: 'revenue' | 'profit') {
    const other = key === 'revenue' ? 'profit' : 'revenue'
    setVisible((current) =>
      current[key] && !current[other] ? current : { ...current, [key]: !current[key] },
    )
  }

  return (
    <section className="dashboard-card" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${id}-heading`} className="dashboard-heading">
          Profit &amp; Revenue
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Download profit and revenue CSV"
            onClick={() =>
              downloadCsv(reportTrendCsv(period), `kanban-sample-${period}-profit-revenue.csv`)
            }
            className="grid size-9 place-items-center rounded-md border border-[#d0d5dd] text-[#78849a] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <DownloadSimpleIcon size={17} />
          </button>
          <label className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] px-2.5 text-xs text-[#667189] shadow-xs">
            <CalendarBlankIcon size={17} aria-hidden="true" />
            <span className="sr-only">Profit and revenue period</span>
            <select
              name="report-period"
              value={period}
              onChange={(event) => {
                onPeriodChange(event.target.value as ReportPeriod)
                setActive(null)
              }}
              className="cursor-pointer bg-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox="0 0 1160 310"
          className="w-full min-w-[650px] overflow-visible sm:min-w-0"
          role="group"
          aria-label={`${period} sample profit and revenue. Focus a period to inspect its values.`}
        >
          <title>Profit and Revenue trend</title>
          <desc>
            Approximate sample curve values recreated from the report reference. Tooltips and
            downloads use the same figures.
          </desc>
          {[0, 1, 2, 3].map((tick) => {
            const value = min + ((max - min) * tick) / 3
            const position = y(value)
            return (
              <g key={tick}>
                <line
                  x1={plot.x}
                  x2={plot.x + plot.width}
                  y1={position}
                  y2={position}
                  stroke="#eef0f3"
                />
                <text x={plot.x - 18} y={position + 5} textAnchor="end" className="chart-label">
                  {Math.round(value).toLocaleString('en-US')}
                </text>
              </g>
            )
          })}
          {(['profit', 'revenue'] as const).map(
            (key) =>
              visible[key] && (
                <path
                  key={key}
                  d={smoothLinePath(data.map((row, index) => ({ x: x(index), y: y(row[key]) })))}
                  fill="none"
                  stroke={colors[key]}
                  strokeWidth="2"
                />
              ),
          )}
          {data.map((row, index) => (
            <g
              key={row.period}
              tabIndex={0}
              role="img"
              aria-label={`${row.period}: revenue ${reportMoney(row.revenue)}, profit ${reportMoney(row.profit)}`}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              onMouseEnter={() => setActive(index)}
              className="outline-none focus-visible:[&>rect]:stroke-blue-500"
            >
              <rect
                x={x(index) - (index === 0 ? 0 : plot.width / (data.length - 1) / 2)}
                y={plot.y}
                width={
                  (plot.width / (data.length - 1)) *
                  (index === 0 || index === data.length - 1 ? 0.5 : 1)
                }
                height={plot.height}
                fill="transparent"
              />
              <text
                x={x(index)}
                y={plot.y + plot.height + 28}
                textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
                className="chart-label"
              >
                {row.period}
              </text>
            </g>
          ))}
          {selected && active !== null && (
            <g pointerEvents="none">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={y(selected[series])}
                y2={plot.y + plot.height}
                stroke="#9e9bff"
                strokeDasharray="4 5"
              />
              <circle
                cx={x(active)}
                cy={y(selected[series])}
                r="8"
                fill={colors[series]}
                stroke="white"
                strokeWidth="4"
              />
              <g
                transform={`translate(${Math.max(plot.x, Math.min(x(active) - 85, plot.x + plot.width - 190))},${Math.max(5, y(selected[series]) - 92)})`}
              >
                <rect
                  width="190"
                  height="78"
                  rx="14"
                  fill="white"
                  stroke="#f2f4f7"
                  style={{ filter: 'drop-shadow(0 5px 5px rgb(30 45 65 / 9%))' }}
                />
                <text x="12" y="19" fill="#aab2c0" fontSize="10">
                  {period === 'monthly' ? 'This Month' : 'This Quarter'}
                </text>
                <text x="12" y="42" fill="#224b80" fontSize="18" fontWeight="600">
                  {reportMoney(selected[series])}
                </text>
                <text x="12" y="62" fill="#99a3b4" fontSize="10">
                  {selected.period} · {series === 'revenue' ? 'Revenue' : 'Profit'}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
      <div className="mt-1 flex justify-center gap-6 text-xs text-[#7c879d]">
        {(['revenue', 'profit'] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={visible[key]}
            onClick={() => toggle(key)}
            className={`flex min-h-8 items-center gap-2 rounded px-1 capitalize focus-visible:outline-2 focus-visible:outline-blue-500 ${visible[key] ? '' : 'opacity-40'}`}
          >
            <span className="size-3.5 rounded-full" style={{ backgroundColor: colors[key] }} />
            {key}
          </button>
        ))}
      </div>
    </section>
  )
}
