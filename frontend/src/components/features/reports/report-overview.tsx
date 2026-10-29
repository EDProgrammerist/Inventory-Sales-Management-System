import { reportOverview, reportMoney } from '@/data/reports-demo'

export default function ReportOverview() {
  const primary = [
    { label: 'Total Profit', value: reportOverview.totalProfit, tone: 'text-[#62656a]' },
    { label: 'Revenue', value: reportOverview.revenue, tone: 'text-[#e7a25e]' },
    { label: 'Sales', value: reportOverview.sales, tone: 'text-[#9470d5]' },
  ]
  const secondary = [
    { label: 'Net purchase value', value: reportOverview.netPurchase },
    { label: 'Net sales value', value: reportOverview.netSales },
    { label: 'MoM Profit', value: reportOverview.momProfit },
    { label: 'YoY Profit', value: reportOverview.yoyProfit },
  ]
  return (
    <section className="min-w-0 rounded-[10px] bg-white" aria-labelledby="report-overview-heading">
      <h2 id="report-overview-heading" className="dashboard-heading px-5 pt-5">
        Overview
      </h2>
      <dl className="mt-5 grid grid-cols-3 gap-4 border-b border-[#edf0f3] px-5 pb-5">
        {primary.map((item) => (
          <div key={item.label}>
            <dd className="text-base font-semibold text-[#657087] tabular-nums">
              {reportMoney(item.value)}
            </dd>
            <dt className={`mt-3 text-[13px] ${item.tone}`}>{item.label}</dt>
          </div>
        ))}
      </dl>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 pt-6 pb-6 sm:grid-cols-4">
        {secondary.map((item) => (
          <div key={item.label}>
            <dd className="text-base font-semibold text-[#657087] tabular-nums">
              {reportMoney(item.value)}
            </dd>
            <dt className="mt-3 text-xs leading-5 text-[#7d879c] xl:text-[13px]">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
