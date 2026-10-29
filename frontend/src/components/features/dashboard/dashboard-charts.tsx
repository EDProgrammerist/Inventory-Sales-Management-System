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
  const id = useId().replaceAll(':', '')
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
      className="dashboard-card flex min-h-[360px] flex-col"
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
          className="w-full min-w-[600px] overflow-visible sm:min-w-0"
          role="group"
          aria-label={`${period} sample purchase and sales chart. Focus a month to hear its values.`}
        >
          <defs>
            <linearGradient id={`${id}-purchase`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#78d1ed" />
              <stop offset="1" stopColor="#8279f7" />
            </linearGradient>
            <linearGradient id={`${id}-sales`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#51d45d" />
              <stop offset="1" stopColor="#42a873" />
            </linearGradient>
          </defs>
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
              key={entry.month}
              tabIndex={0}
              role="img"
              aria-label={`${entry.month}: purchase ${entry.purchase.toLocaleString('en-US')} dollars, sales ${entry.sales.toLocaleString('en-US')} dollars`}
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
                      rx="5"
                      fill={`url(#${id}-${series})`}
                    />
                  ),
              )}
              <text
                x={plot.x + index * step + step / 2}
                y={plot.y + plot.height + 23}
                textAnchor="middle"
                className="chart-label"
              >
                {entry.month}
              </text>
            </g>
          ))}
        </svg>
        {selected && (
          <div className="pointer-events-none absolute top-0 right-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <strong>{selected.month}</strong>
            <br />
            Purchase: $ {selected.purchase.toLocaleString('en-US')}
            <br />
            Sales: $ {selected.sales.toLocaleString('en-US')}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs text-[#7c879d]">
        {(['purchase', 'sales'] as const).map((series) => (
          <button
            key={series}
            type="button"
            aria-pressed={visible[series]}
            onClick={() => toggle(series)}
            className={`flex min-h-8 items-center gap-2 rounded px-1 capitalize focus-visible:outline-2 focus-visible:outline-blue-500 ${visible[series] ? '' : 'opacity-40'}`}
          >
            <span
              className={`size-3.5 rounded-full ${series === 'sales' ? 'bg-[#51c669]' : 'bg-[#7caff4]'}`}
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
      className="dashboard-card flex min-h-[360px] flex-col"
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
        <title id={`${id}-title`}>Sample ordered and delivered quantities</title>
        <desc id={`${id}-description`}>
          Illustrative ordered and delivered trends from January to May, recreated from the
          reference design. Delivered quantities are generally higher than ordered quantities.
        </desc>
        <defs>
          <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#edb574" stopOpacity=".12" />
            <stop offset="1" stopColor="#edb574" stopOpacity=".02" />
          </linearGradient>
        </defs>
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
          d="M43 62 C77 65 70 173 92 159 S119 94 138 113 S166 152 184 132 S206 115 226 128 S254 141 272 164 S301 161 320 149 S342 136 359 131 L359 234 L43 234Z"
          fill={`url(#${id}-area)`}
        />
        <path
          d="M43 62 C77 65 70 173 92 159 S119 94 138 113 S166 152 184 132 S206 115 226 128 S254 141 272 164 S301 161 320 149 S342 136 359 131"
          fill="none"
          stroke="#dfa15d"
          strokeWidth="2"
        />
        <path
          d="M43 89 C65 91 79 152 96 136 S119 55 147 65 S174 72 190 73 S213 110 235 108 S267 42 285 83 S308 157 327 128 S344 92 359 82"
          fill="none"
          stroke="#adcfff"
          strokeWidth="2"
        />
        {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => (
          <text key={month} x={55 + index * 73} y="255" textAnchor="middle" className="chart-label">
            {month}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex justify-center gap-5 text-xs text-[#7c879d]">
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-full bg-[#dfa15d]" />
          Ordered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-full bg-[#b7d4fc]" />
          Delivered
        </span>
      </div>
    </section>
  )
}
