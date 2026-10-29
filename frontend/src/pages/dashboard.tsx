import { useState } from 'react'
import { DownloadSimpleIcon, BuildingsIcon, PackageIcon } from '@phosphor-icons/react'
import type { DashboardAction } from '@/components/features/dashboard/dashboard-sidebar'
import WorkspaceLayout from '@/components/common/workspace-layout'
import DashboardDialog from '@/components/features/dashboard/dashboard-dialog'
import { OverviewCard, SummaryCard } from '@/components/features/dashboard/dashboard-overviews'
import { ActivityChart, OrderChart } from '@/components/features/dashboard/dashboard-charts'
import {
  TopStockPanel,
  LowStockPanel,
  StockTable,
} from '@/components/features/dashboard/stock-panels'
import {
  activityForPeriod,
  filterStock,
  lowStock,
  topStock,
  type ChartPeriod,
} from '@/data/dashboard-demo'
import { downloadActivityReport } from '@/lib/dashboard-report'

type Panel = DashboardAction | 'lowstock' | 'notifications' | 'profile'
const panelTitles: Record<Panel, string> = {
  inventory: 'Inventory · sample stock',
  reports: 'Sales & purchase report',
  suppliers: 'Suppliers',
  orders: 'Order summary',
  store: 'Manage Store',
  settings: 'Dashboard preferences',
  lowstock: 'Low quantity stock',
  notifications: 'Stock notifications',
  profile: 'Your workspace',
}

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<ChartPeriod>('monthly')
  const [compact, setCompact] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const allStock = [...topStock, ...lowStock]
  const matches = filterStock(allStock, query)

  function openPanel(value: Panel) {
    setPanel(value)
  }

  return (
    <WorkspaceLayout title="Dashboard" query={query} onQueryChange={setQuery} onAction={openPanel}>
      {query.trim() && (
        <p role="status" className="mb-4 text-sm text-slate-600">
          {matches.length} {matches.length === 1 ? 'product matches' : 'products match'} “
          {query.trim()}”
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] xl:gap-6">
        <OverviewCard title="Sales Overview" kind="sales" />
        <SummaryCard kind="inventory" />
        <OverviewCard title="Purchase Overview" kind="purchase" />
        <SummaryCard kind="product" />
        <ActivityChart period={period} onPeriodChange={setPeriod} />
        <OrderChart />
        <TopStockPanel query={query} compact={compact} onSeeAll={() => openPanel('inventory')} />
        <LowStockPanel query={query} onSeeAll={() => openPanel('lowstock')} />
      </div>
      {panel && (
        <DashboardDialog title={panelTitles[panel]} onClose={() => setPanel(null)}>
          {(panel === 'inventory' || panel === 'lowstock') && (
            <>
              <p className="mb-5 text-sm leading-6 text-slate-500">
                {panel === 'inventory'
                  ? 'All six products included in the dashboard reference.'
                  : 'These sample products are marked low in the dashboard reference.'}
              </p>
              <StockTable items={panel === 'inventory' ? allStock : lowStock} compact={compact} />
            </>
          )}
          {panel === 'reports' && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Sample {period} activity, in USD.</p>
                <button
                  onClick={() => downloadActivityReport(period)}
                  className="flex items-center gap-2 rounded-md bg-[#1872ef] px-3 py-2 text-sm text-white hover:bg-blue-700 active:scale-[.98]"
                >
                  <DownloadSimpleIcon size={17} />
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Period', 'Purchase', 'Sales'].map((label) => (
                        <th key={label} className="px-3 py-3 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activityForPeriod(period).map((item) => (
                      <tr key={item.month} className="border-b border-slate-100">
                        <th scope="row" className="px-3 py-3 font-normal">
                          {item.month}
                        </th>
                        <td className="px-3 py-3 tabular-nums">
                          $ {item.purchase.toLocaleString('en-US')}
                        </td>
                        <td className="px-3 py-3 tabular-nums">
                          $ {item.sales.toLocaleString('en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {panel === 'orders' && <OrderChart />}
          {panel === 'notifications' && (
            <ul className="divide-y divide-slate-100">
              {lowStock.map((item) => (
                <li key={item.name} className="flex items-center gap-4 py-4 first:pt-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-400">
                    <PackageIcon size={24} />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{item.name} is running low</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.remaining} packets remaining · sample notification
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {panel === 'settings' && (
            <div className="space-y-6">
              <label className="grid gap-2 text-sm font-medium">
                Chart grouping
                <select
                  name="preferred-chart-period"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value as ChartPeriod)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 font-normal"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  name="compact-stock-rows"
                  type="checkbox"
                  checked={compact}
                  onChange={(event) => setCompact(event.target.checked)}
                  className="size-4 accent-blue-600"
                />
                Use compact stock rows
              </label>
              <p className="text-xs leading-5 text-slate-500">
                Preferences apply to this preview while the page is open.
              </p>
            </div>
          )}
          {panel === 'profile' && (
            <div className="flex items-start gap-4">
              <img
                src="/dashboard/profile.png"
                alt=""
                className="size-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">Kanban preview</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You are viewing a sample workspace. No account is signed in.
                </p>
              </div>
            </div>
          )}
          {(panel === 'suppliers' || panel === 'store') && (
            <div className="grid justify-items-center gap-3 py-8 text-center">
              <BuildingsIcon size={36} className="text-slate-400" />
              <p className="text-sm font-medium">
                {panel === 'suppliers' ? 'Supplier management' : 'Store management'} is currently
                unavailable.
              </p>
              <button onClick={() => setPanel(null)} className="dashboard-link mt-2">
                Back to dashboard
              </button>
            </div>
          )}
        </DashboardDialog>
      )}
    </WorkspaceLayout>
  )
}
