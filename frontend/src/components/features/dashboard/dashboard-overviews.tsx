import {
  ChartBarIcon,
  ChartLineUpIcon,
  CoinsIcon,
  CurrencyDollarIcon,
  PackageIcon,
  MapPinLineIcon,
  ShoppingBagIcon,
  ReceiptXIcon,
  UserCircleIcon,
  ListChecksIcon,
  type Icon,
} from '@phosphor-icons/react'

interface Metric {
  label: string
  value: string
  icon: Icon
  tone: string
}

const sales: Metric[] = [
  { label: 'Sales', value: '$ 832', icon: CoinsIcon, tone: 'bg-blue-50 text-blue-500' },
  {
    label: 'Revenue',
    value: '$ 18,300',
    icon: ChartLineUpIcon,
    tone: 'bg-indigo-50 text-indigo-400',
  },
  { label: 'Profit', value: '$ 868', icon: ChartBarIcon, tone: 'bg-orange-50 text-orange-400' },
  {
    label: 'Cost',
    value: '$ 17,432',
    icon: CurrencyDollarIcon,
    tone: 'bg-green-50 text-green-500',
  },
]

const purchases: Metric[] = [
  { label: 'Purchase', value: '82', icon: ShoppingBagIcon, tone: 'bg-sky-50 text-sky-500' },
  {
    label: 'Cost',
    value: '$ 13,573',
    icon: CurrencyDollarIcon,
    tone: 'bg-green-50 text-green-500',
  },
  { label: 'Cancel', value: '5', icon: ReceiptXIcon, tone: 'bg-indigo-50 text-indigo-400' },
  {
    label: 'Return',
    value: '$ 17,432',
    icon: ChartLineUpIcon,
    tone: 'bg-orange-50 text-orange-400',
  },
]

export function OverviewCard({ title, kind }: { title: string; kind: 'sales' | 'purchase' }) {
  return (
    <section className="dashboard-card min-h-[164px]" aria-label={title}>
      <h2 className="dashboard-heading">{title}</h2>
      <dl className="mt-6 grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-[#f0f1f4]">
        {(kind === 'sales' ? sales : purchases).map(({ label, value, icon: MetricIcon, tone }) => (
          <div key={label} className="px-2 first:pl-0 last:pr-0">
            <span className={`mx-auto mb-3 grid size-8 place-items-center rounded-md ${tone}`}>
              <MetricIcon size={25} weight="regular" />
            </span>
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[13px] xl:text-sm">
              <dd className="font-semibold text-[#5d687e] tabular-nums">{value}</dd>
              <dt className="text-[#727d93]">{label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function SummaryCard({ kind }: { kind: 'inventory' | 'product' }) {
  const inventory = kind === 'inventory'
  const metrics: Metric[] = inventory
    ? [
        {
          label: 'Quantity in Hand',
          value: '868',
          icon: PackageIcon,
          tone: 'bg-orange-50 text-orange-400',
        },
        {
          label: 'To be received',
          value: '200',
          icon: MapPinLineIcon,
          tone: 'bg-indigo-50 text-indigo-400',
        },
      ]
    : [
        {
          label: 'Number of Suppliers',
          value: '31',
          icon: UserCircleIcon,
          tone: 'bg-sky-50 text-sky-400',
        },
        {
          label: 'Number of Categories',
          value: '21',
          icon: ListChecksIcon,
          tone: 'bg-indigo-50 text-indigo-400',
        },
      ]
  const title = inventory ? 'Inventory Summary' : 'Product Summary'
  return (
    <section className="dashboard-card min-h-[164px]" aria-label={title}>
      <h2 className="dashboard-heading">{title}</h2>
      <dl className="mt-5 grid grid-cols-2 divide-x divide-[#f0f1f4] text-center">
        {metrics.map(({ label, value, icon: MetricIcon, tone }) => (
          <div key={label} className="px-1">
            <span className={`mx-auto mb-2 grid size-8 place-items-center rounded-md ${tone}`}>
              <MetricIcon size={25} weight="regular" />
            </span>
            <dd className="text-base font-semibold text-[#657086] tabular-nums">{value}</dd>
            <dt className="mt-1 text-xs text-[#50545c] sm:text-sm">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
