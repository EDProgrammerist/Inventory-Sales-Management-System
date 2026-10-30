import { formatMoney } from '@/data/currency'
import {
  ChartBarIcon, ChartLineUpIcon, CoinsIcon, WalletIcon, PackageIcon,
  MapPinLineIcon, ShoppingBagIcon, ReceiptXIcon, UserCircleIcon, ListChecksIcon,
  type Icon,
} from '@phosphor-icons/react'

// The colorful reference icons are an explicit user preference.
const metricIcons: Record<string, { icon: Icon; tone: string }> = {
  Sales: { icon: CoinsIcon, tone: 'bg-blue-50 text-blue-600' },
  Revenue: { icon: ChartLineUpIcon, tone: 'bg-violet-50 text-violet-600' },
  Profit: { icon: ChartBarIcon, tone: 'bg-orange-50 text-orange-600' },
  Cost: { icon: WalletIcon, tone: 'bg-green-50 text-green-600' },
  Purchase: { icon: ShoppingBagIcon, tone: 'bg-sky-50 text-sky-600' },
  Cancel: { icon: ReceiptXIcon, tone: 'bg-violet-50 text-violet-600' },
  Return: { icon: ChartLineUpIcon, tone: 'bg-orange-50 text-orange-600' },
  'Quantity in Hand': { icon: PackageIcon, tone: 'bg-orange-50 text-orange-600' },
  'To be received': { icon: MapPinLineIcon, tone: 'bg-violet-50 text-violet-600' },
  'Number of Suppliers': { icon: UserCircleIcon, tone: 'bg-sky-50 text-sky-600' },
  'Number of Categories': { icon: ListChecksIcon, tone: 'bg-violet-50 text-violet-600' },
}

type Metric = { label: string; value: string }
const sales: Metric[] = [
  { label: 'Sales', value: formatMoney(0) },
  { label: 'Revenue', value: formatMoney(0) },
  { label: 'Profit', value: formatMoney(0) },
  { label: 'Cost', value: formatMoney(0) },
]
const purchases: Metric[] = [
  { label: 'Purchase', value: '0' },
  { label: 'Cost', value: formatMoney(0) },
  { label: 'Cancel', value: '0' },
  { label: 'Return', value: formatMoney(0) },
]

function Metrics({ items }: { items: Metric[] }) {
  return (
    <dl className={`mt-5 grid grid-cols-2 gap-x-5 gap-y-5 ${items.length === 4 ? 'sm:grid-cols-4' : ''}`}>
      {items.map(({ label, value }) => {
        const { icon: MetricIcon, tone } = metricIcons[label]
        return (
          <div key={label} className="min-w-0">
            <dt className="text-sm leading-5 text-muted">
              <span aria-hidden="true" className={`mb-3 grid size-10 place-items-center rounded-lg ${tone}`}>
                <MetricIcon size={24} weight="regular" />
              </span>
              {label}
            </dt>
            <dd className="mt-2 text-[22px] leading-7 font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export function OverviewCard({ title, kind }: { title: string; kind: 'sales' | 'purchase' }) {
  return <section className="dashboard-card" aria-label={title}>
    <h2 className="dashboard-heading">{title}</h2>
    <Metrics items={kind === 'sales' ? sales : purchases} />
  </section>
}

export function SummaryCard({ kind }: { kind: 'inventory' | 'product' }) {
  const inventory = kind === 'inventory'
  const title = inventory ? 'Inventory Summary' : 'Product Summary'
  const items = inventory
    ? [{ label: 'Quantity in Hand', value: '0' }, { label: 'To be received', value: '0' }]
    : [{ label: 'Number of Suppliers', value: '0' }, { label: 'Number of Categories', value: '0' }]
  return <section className="dashboard-card" aria-label={title}>
    <h2 className="dashboard-heading">{title}</h2>
    <Metrics items={items} />
  </section>
}
