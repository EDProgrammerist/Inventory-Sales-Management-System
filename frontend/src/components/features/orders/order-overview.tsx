const metrics = [
  { label: 'Total Orders', color: 'text-[#1872ef]', count: '37', caption: 'Last 7 days' },
  {
    label: 'Total Received',
    color: 'text-[#dc9b38]',
    count: '32',
    caption: 'Last 7 days',
    amount: '$25000',
    amountCaption: 'Revenue',
  },
  {
    label: 'Total Returned',
    color: 'text-[#9562c6]',
    count: '5',
    caption: 'Last 7 days',
    amount: '$2500',
    amountCaption: 'Cost',
  },
  {
    label: 'On the way',
    color: 'text-[#ef6868]',
    count: '12',
    caption: 'Ordered',
    amount: '$ 2356',
    amountCaption: 'Cost',
  },
]
export default function OrderOverview() {
  return (
    <section aria-labelledby="order-overview" className="rounded-[10px] bg-white p-5">
      <h2 id="order-overview" className="dashboard-heading">
        Overall Orders
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[0.8fr_1.2fr_1.2fr_1.2fr]">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border-b border-[#f0f1f3] pb-4 sm:border-b-0 sm:pr-5 xl:border-r xl:last:border-r-0"
          >
            <h3 className={`text-base font-semibold ${metric.color}`}>{metric.label}</h3>
            <div className="mt-4 flex justify-between gap-5 text-sm font-semibold tabular-nums">
              <span>{metric.count}</span>
              {metric.amount && <span>{metric.amount}</span>}
            </div>
            <div className="mt-3 flex justify-between gap-5 text-xs text-[#929aa8]">
              <span>{metric.caption}</span>
              {metric.amountCaption && <span>{metric.amountCaption}</span>}
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">
        Historical summary from the supplied reference; independent of the sample table and local
        additions.
      </p>
    </section>
  )
}
