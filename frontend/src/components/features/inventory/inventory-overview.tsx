import { formatMoney } from '@/data/currency'
const summaries = [
  { title: 'Categories', color: 'text-[#1872ef]', values: [{ value: '0', label: 'Last 7 days' }] },
  {
    title: 'Total Products',
    color: 'text-[#df922e]',
    values: [
      { value: '0', label: 'Last 7 days' },
      { value: formatMoney(0), label: 'Revenue' },
    ],
  },
  {
    title: 'Top Selling',
    color: 'text-[#9471c8]',
    values: [
      { value: '0', label: 'Last 7 days' },
      { value: formatMoney(0), label: 'Cost' },
    ],
  },
  {
    title: 'Low Stocks',
    color: 'text-[#ee6d6d]',
    values: [
      { value: '0', label: 'Ordered' },
      { value: '0', label: 'Not in stock' },
    ],
  },
]

export default function InventoryOverview() {
  return (
    <section className="dashboard-card" aria-labelledby="overall-inventory-heading">
      <h2 id="overall-inventory-heading" className="dashboard-heading">
        Overall Inventory
      </h2>
      <p className="sr-only">
        Inventory summary.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-y-5 sm:grid-cols-2 xl:grid-cols-[.65fr_1.2fr_1.25fr_1.15fr] xl:divide-x xl:divide-[#f0f1f4]">
        {summaries.map((summary) => (
          <section key={summary.title} className="sm:px-5 first:pl-0 last:pr-0">
            <h3 className={`text-[15px] font-semibold ${summary.color}`}>{summary.title}</h3>
            <dl className="mt-4 flex justify-between gap-4">
              {summary.values.map((metric) => (
                <div
                  key={metric.label}
                  className={
                    summary.values.length === 1 ? 'text-left' : 'last:text-right first:text-left'
                  }
                >
                  <dd className="text-base font-semibold text-[#667085] tabular-nums">
                    {metric.value}
                  </dd>
                  <dt className="mt-3 text-[13px] text-[#99a0ad]">{metric.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  )
}
