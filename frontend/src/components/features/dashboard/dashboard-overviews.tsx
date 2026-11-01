import { formatMoney } from '@/data/currency'
import {
  ChartBarIcon, ChartLineUpIcon, CoinsIcon, WalletIcon, PackageIcon,
  MapPinLineIcon, ShoppingBagIcon, ReceiptXIcon, UserCircleIcon, ListChecksIcon,
  DeviceMobileIcon, DesktopTowerIcon, GameControllerIcon, BuildingsIcon,
  type Icon,
} from '@phosphor-icons/react'

// The colorful reference icons are an explicit user preference.
const metricIcons: Record<string, { icon: Icon; tone: string }> = {
  Sales: { icon: CoinsIcon, tone: 'bg-blue-50 text-blue-600' },
  Revenue: { icon: ChartLineUpIcon, tone: 'bg-violet-50 text-violet-600' }, // taste-skill-ignore: user-requested original reference icon colors.
  Profit: { icon: ChartBarIcon, tone: 'bg-orange-50 text-orange-600' },
  Cost: { icon: WalletIcon, tone: 'bg-green-50 text-green-600' },
  Purchase: { icon: ShoppingBagIcon, tone: 'bg-sky-50 text-sky-600' },
  Cancel: { icon: ReceiptXIcon, tone: 'bg-violet-50 text-violet-600' }, // taste-skill-ignore: user-requested original reference icon colors.
  Return: { icon: ChartLineUpIcon, tone: 'bg-orange-50 text-orange-600' },
  'Quantity in Hand': { icon: PackageIcon, tone: 'bg-orange-50 text-orange-600' },
  'To be received': { icon: MapPinLineIcon, tone: 'bg-violet-50 text-violet-600' }, // taste-skill-ignore: user-requested original reference icon colors.
  'Number of Suppliers': { icon: UserCircleIcon, tone: 'bg-sky-50 text-sky-600' },
  'Number of Categories': { icon: ListChecksIcon, tone: 'bg-violet-50 text-violet-600' }, // taste-skill-ignore: user-requested original reference icon colors.
  Phones: { icon: DeviceMobileIcon, tone: 'bg-blue-50 text-blue-600' },
  Computers: { icon: DesktopTowerIcon, tone: 'bg-violet-50 text-violet-600' }, // taste-skill-ignore: user-requested original reference icon colors.
  Consoles: { icon: GameControllerIcon, tone: 'bg-green-50 text-green-600' },
  Stores: { icon: BuildingsIcon, tone: 'bg-sky-50 text-sky-600' },
}

export function DashboardMetricIcon({kind,compact=false}:{kind:string;compact?:boolean}) {
  const {icon:MetricIcon,tone}=metricIcons[kind]??metricIcons['Quantity in Hand']
  return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-lg ${compact?'size-8':'mb-3 size-10'} ${tone}`}><MetricIcon size={compact?18:24} weight="regular"/></span>
}

export type Metric = { label: string; value: string; icon?:string }
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
      {items.map(({ label, value, icon }) => {
        return (
          <div key={label} className="min-w-0">
            <dt className="text-sm leading-5 text-muted">
              <DashboardMetricIcon kind={icon??label}/>
              {label}
            </dt>
            <dd className="mt-2 text-[22px] leading-7 font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export function OverviewCard({ title, kind, items, note }: { title: string; kind: 'sales' | 'purchase'; items?:Metric[];note?:string }) {
  return <section className="dashboard-card" aria-label={title}>
    <h2 className="dashboard-heading">{title}</h2>
    <Metrics items={items??(kind === 'sales' ? sales : purchases)} />
    {note&&<p className="mt-4 text-[13px] leading-6 text-muted">{note}</p>}
  </section>
}

export function SummaryCard({ kind, items:provided, note }: { kind: 'inventory' | 'product'; items?:Metric[];note?:string }) {
  const inventory = kind === 'inventory'
  const title = inventory ? 'Inventory Summary' : 'Product Summary'
  const items = inventory
    ? [{ label: 'Quantity in Hand', value: '0' }, { label: 'To be received', value: '0' }]
    : [{ label: 'Number of Suppliers', value: '0' }, { label: 'Number of Categories', value: '0' }]
  return <section className="dashboard-card" aria-label={title}>
    <h2 className="dashboard-heading">{title}</h2>
    <Metrics items={provided??items} />
    {note&&<p className="mt-4 text-[13px] leading-6 text-muted">{note}</p>}
  </section>
}
