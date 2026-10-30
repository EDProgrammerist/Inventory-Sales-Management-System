import { formatMoney } from '@/data/currency'
import { useState } from 'react'
import { FunnelIcon } from '@phosphor-icons/react'
import WorkspaceLayout, { type WorkspaceAction } from '@/components/common/workspace-layout'
import WorkspaceUtilityDialog from '@/components/common/workspace-utility-dialog'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import OrderForm from '@/components/features/orders/order-form'
import OrderOverview from '@/components/features/orders/order-overview'
import {
  orderStatuses,
  selectOrders,
  displayOrderDate,
  createNewOrder,
  ordersCsv,
} from '@/data/orders-demo'
import { useWorkspace } from '@/components/context/workspace-context'
import { paginateRows } from '@/data/pagination'
import { downloadCsv } from '@/lib/download'

const statusColors = {
  Delayed: 'text-[#ed9600]',
  Confirmed: 'text-[#1872ef]',
  Returned: 'text-[#7b8495]',
  'Out for delivery': 'text-[#1aaf78]',
}
export default function OrdersPage() {
  const { orders, setOrders } = useWorkspace()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [draftStatus, setDraftStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [panel, setPanel] = useState<'add' | 'filters' | 'history' | null>(null)
  const [utility, setUtility] = useState<WorkspaceAction | null>(null)
  const [compact, setCompact] = useState(false)
  const [notice, setNotice] = useState('')
  const result = paginateRows(selectOrders(orders, query, status), page, 9)
  function clear() {
    setQuery('')
    setStatus('all')
    setPage(1)
  }
  return (
    <WorkspaceLayout
      title="Orders"
      query={query}
      onQueryChange={(value) => {
        setQuery(value)
        setPage(1)
      }}
      onAction={setUtility}
      searchPlaceholder="Search product or order"
      searchLabel="Search order products, order IDs, product IDs, categories, or statuses"
    >
      <div className="space-y-6">
        <OrderOverview />
        {notice && (
          <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </p>
        )}
        <section
          aria-labelledby="orders-heading"
          className="overflow-hidden rounded-[10px] bg-white"
        >
          <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-5 pb-4">
            <h2 id="orders-heading" className="dashboard-heading">
              Orders
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
                onClick={() => setPanel('add')}
              >
                Add Order
              </button>
              <button
                className="inventory-button"
                onClick={() => {
                  setDraftStatus(status)
                  setPanel('filters')
                }}
              >
                <FunnelIcon size={18} />
                Filters{status !== 'all' && <span className="text-blue-600">1</span>}
              </button>
              <button className="inventory-button" onClick={() => setPanel('history')}>
                Order History
              </button>
            </div>
          </header>
          {(query || status !== 'all') && (
            <div className="flex justify-between gap-3 px-5 pb-4 text-xs">
              <p role="status">{selectOrders(orders, query, status).length} matching orders</p>
              <button onClick={clear} className="dashboard-link">
                Clear search and filters
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <caption className="sr-only">
                Order records
              </caption>
              <thead>
                <tr className="border-b border-[#edf0f3] text-[#7b8495]">
                  {[
                    'Products',
                    'Order Value',
                    'Quantity',
                    'Order ID',
                    'Expected Delivery',
                    'Status',
                  ].map((label) => (
                    <th scope="col" key={label} className="px-4 py-3 font-medium first:pl-5">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#edf0f3] text-[#586171] last:border-0 hover:bg-slate-50/70"
                  >
                    <th
                      scope="row"
                      className={`px-4 pl-5 font-normal ${compact ? 'py-2' : 'py-4'}`}
                    >
                      {row.product}
                    </th>
                    <td className="px-4 tabular-nums">{formatMoney(row.value)}</td>
                    <td className="px-4 tabular-nums">
                      {row.quantity} {row.unit}
                    </td>
                    <td className="px-4 tabular-nums">{row.id}</td>
                    <td className="px-4 tabular-nums">{displayOrderDate(row.expected)}</td>
                    <td className={`px-4 ${statusColors[row.status]}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.rows.length && (
            <div className="py-16 text-center">
              <h3 className="font-medium">No matching orders</h3>
              <button onClick={clear} className="dashboard-link mt-3">
                Clear search and filters
              </button>
            </div>
          )}
          <footer className="flex items-center justify-between gap-3 p-5">
            <button
              className="inventory-button"
              disabled={result.page === 1}
              onClick={() => setPage(result.page - 1)}
            >
              Previous
            </button>
            <p aria-live="polite" className="text-sm text-slate-400">
              Page {result.page} of {result.totalPages}
            </p>
            <button
              className="inventory-button"
              disabled={result.page === result.totalPages}
              onClick={() => setPage(result.page + 1)}
            >
              Next
            </button>
          </footer>
        </section>
      </div>
      {panel && (
        <DashboardDialog
          key={panel}
          variant={panel === 'add' ? 'product' : 'default'}
          title={
            panel === 'add' ? 'New Order' : panel === 'filters' ? 'Filter orders' : 'Order History'
          }
          onClose={() => setPanel(null)}
        >
          {panel === 'add' && (
            <OrderForm
              onDiscard={() => setPanel(null)}
              onAdd={(input) => {
                const next = createNewOrder(input, crypto.randomUUID())
                setOrders([...orders, next])
                clear()
                setPage(Math.ceil((orders.length + 1) / 9))
                setPanel(null)
                setNotice(
                  `Order ${next.id} was added to the order list.`,
                )
              }}
            />
          )}
          {panel === 'filters' && (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                setStatus(draftStatus)
                setPage(1)
                setPanel(null)
              }}
            >
              <label className="grid gap-2 text-sm">
                Order status
                <select
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value)}
                  className="h-11 rounded-md border border-slate-300 px-3"
                >
                  <option value="all">All statuses</option>
                  {orderStatuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="inventory-button"
                  onClick={() => setDraftStatus('all')}
                >
                  Reset
                </button>
                <button className="inventory-button bg-[#1765d5] text-white">Apply filters</button>
              </div>
            </form>
          )}
          {panel === 'history' && (
            <div className="space-y-5 text-sm leading-6">
              <p>
                No earlier status changes are recorded.
              </p>
              <h3 className="font-semibold">Created during this visit</h3>
              {orders.length ? (
                <ul className="divide-y divide-slate-100">
                  {orders.map((row) => (
                    <li key={row.id} className="py-3">
                      <p>
                        Order {row.id} · {row.product} · Confirmed
                      </p>
                      <p className="text-xs text-slate-500">
                        Product ID {row.productId} · {row.category} · {row.quantity} {row.unit} ·
                        Buying price {row.buyingPrice === undefined ? 'Not recorded' : formatMoney(row.buyingPrice)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Delivery {displayOrderDate(row.expected)} · Notification preference:{' '}
                        {row.notifyOnDelivery ? 'Requested (not scheduled)' : 'Off'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No orders added during this visit.</p>
              )}
              <button
                className="inventory-button"
                onClick={() => downloadCsv(ordersCsv(orders), 'shenban-orders.csv')}
              >
                Download all orders CSV
              </button>
            </div>
          )}
        </DashboardDialog>
      )}
      {utility && (
        <WorkspaceUtilityDialog
          panel={utility}
          onClose={() => setUtility(null)}
          compact={compact}
          onCompactChange={setCompact}
        />
      )}
    </WorkspaceLayout>
  )
}
