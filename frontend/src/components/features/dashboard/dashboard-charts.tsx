import { formatMoney } from '@/data/currency'
import { useId, useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { activityForPeriod, type ChartPeriod } from '@/data/dashboard-demo'

export function ActivityChart({
  period,
  onPeriodChange,
}: {
  period: ChartPeriod
  onPeriodChange: (value: ChartPeriod) => void
}) {
  const data = activityForPeriod(period)
  const [visible, setVisible] = useState({ purchase: true, sales: true })
  const [focused, setFocused] = useState<number | null>(null)
  const maximum = period === 'monthly' ? 60000 : 180000
  const plot = { x: 67, y: 18, width: 610, height: 218 }
  const step = plot.width / data.length
  const barWidth = Math.min(12, step / 4)
  const selected = focused === null ? null : data[focused]

  function toggle(series: 'purchase' | 'sales') {
    const other = series === 'purchase' ? 'sales' : 'purchase'
    setVisible((current) =>
      !current[other] && current[series] ? current : { ...current, [series]: !current[series] },
    )
  }

  return (
    <section
      className="dashboard-card flex min-h-[280px] flex-col"
      aria-labelledby="activity-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="activity-heading" className="dashboard-heading">
          Sales &amp; Purchase
        </h2>
        <label className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5df] px-2.5 text-xs text-[#667189] shadow-xs">
          <CalendarBlankIcon size={17} aria-hidden="true" />
          <span className="sr-only">Chart period</span>
          <select
            name="chart-period"
            value={period}
            onChange={(event) => {
              onPeriodChange(event.target.value as ChartPeriod)
              setFocused(null)
            }}
            className="max-w-[110px] cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>
      </div>
      <div className="relative mt-5 flex flex-1 items-end overflow-x-auto pb-1">
        <svg
          viewBox="0 0 700 265"
          className="w-full overflow-visible"
          role="group"
          aria-label={`${period} purchase and sales chart. Focus a month to hear its values.`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
            const y = plot.y + plot.height - (tick * plot.height) / 6
            return (
              <g key={tick}>
                <line x1={plot.x} x2={plot.x + plot.width} y1={y} y2={y} stroke="#d7dce4" />
                <text x={plot.x - 12} y={y + 4} textAnchor="end" className="chart-label">
                  {((tick * maximum) / 6).toLocaleString('en-US')}
                </text>
              </g>
            )
          })}
          {data.map((entry, index) => (
            <g
              key={data.length <= 5 || index % 2 === 0 || index === data.length - 1 ? entry.month : ''}
              tabIndex={0}
              role="img"
              aria-label={`${data.length <= 5 || index % 2 === 0 || index === data.length - 1 ? entry.month : ''}: purchase ${entry.purchase.toLocaleString('en-US')} pesos, sales ${entry.sales.toLocaleString('en-US')} pesos`}
              onMouseEnter={() => setFocused(index)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(index)}
              onBlur={() => setFocused(null)}
              className="outline-none focus-visible:[&>rect:first-of-type]:stroke-blue-600"
            >
              <rect
                x={plot.x + index * step}
                y={plot.y}
                width={step}
                height={plot.height}
                fill="transparent"
              />
              {(['purchase', 'sales'] as const).map(
                (series, column) =>
                  visible[series] && (
                    <rect
                      key={series}
                      x={plot.x + index * step + step / 2 + (column - 1) * (barWidth + 5)}
                      y={plot.y + plot.height * (1 - entry[series] / maximum)}
                      width={barWidth}
                      height={(plot.height * entry[series]) / maximum}
                      rx="2"
                      fill={series === 'sales' ? 'var(--color-chart-primary)' : 'var(--color-chart-secondary)'}
                    />
                  ),
              )}
              <text
                x={plot.x + index * step + step / 2}
                y={plot.y + plot.height + 23}
                textAnchor="middle"
                className="chart-label"
              >
                {data.length <= 5 || index % 2 === 0 || index === data.length - 1 ? entry.month : ''}
              </text>
            </g>
          ))}
        </svg>
        {selected && (
          <div className="pointer-events-none absolute top-0 right-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <strong>{selected.month}</strong>
            <br />
            Purchase: {formatMoney(selected.purchase)}
            <br />
            Sales: {formatMoney(selected.sales)}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs text-muted">
        {(['purchase', 'sales'] as const).map((series) => (
          <button
            key={series}
            type="button"
            aria-pressed={visible[series]}
            onClick={() => toggle(series)}
            className={`flex min-h-11 items-center gap-2 rounded px-1 capitalize focus-visible:outline-2 focus-visible:outline-blue-500 ${visible[series] ? '' : 'opacity-70'}`}
          >
            <span
              className={`size-3.5 rounded-full ${series === 'sales' ? 'bg-chart-primary' : 'bg-chart-secondary'}`}
            />
            {series}
          </button>
        ))}
      </div>
    </section>
  )
}

export function OrderChart() {
  const id = useId().replaceAll(':', '')
  return (
    <section
      className="dashboard-card flex min-h-[280px] flex-col"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="dashboard-heading">
        Order Summary
      </h2>
      <svg
        viewBox="0 0 370 280"
        className="mt-6 w-full flex-1"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>Ordered and delivered quantities</title>
        <desc id={`${id}-description`}>
          No ordered or delivered quantities have been entered.
        </desc>
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              x1="43"
              x2="359"
              y1={234 - tick * 46}
              y2={234 - tick * 46}
              stroke="#d8dce3"
              strokeDasharray={tick === 0 ? '3 3' : undefined}
            />
            <text x="34" y={238 - tick * 46} textAnchor="end" className="chart-label">
              {tick * 1000}
            </text>
          </g>
        ))}
        <path
          d="M43 234 L359 234"
          fill="none"
          stroke="var(--color-chart-secondary)"
          strokeWidth="2"
        />
        <path
          d="M43 234 L359 234"
          fill="none"
          stroke="var(--color-chart-primary)"
          strokeWidth="2"
        />
        {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => (
          <text key={month} x={55 + index * 73} y="255" textAnchor="middle" className="chart-label">
            {month}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex justify-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-full bg-chart-secondary" />
          Ordered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-full bg-chart-primary" />
          Delivered
        </span>
      </div>
    </section>
  )
}
