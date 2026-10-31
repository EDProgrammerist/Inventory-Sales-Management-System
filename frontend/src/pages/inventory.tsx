import { formatMoney } from '@/data/currency'
import { useState } from 'react'
import { Link } from 'react-router'
import { useInventory } from '@/components/context/inventory-context'
import { FunnelIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@phosphor-icons/react'
import WorkspaceLayout from '@/components/common/workspace-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import InventoryOverview from '@/components/features/inventory/inventory-overview'
import InventoryPanelContent from '@/components/features/inventory/inventory-panels'
import {
  inventoryPanelTitles,
  availabilityStyles,
  type InventoryPanel,
} from '@/components/features/inventory/inventory-presentation'
import {
  availabilityLabels,
  selectProducts,
  paginateProducts,
  displayExpiry,
  inventoryCsv,
  type InventoryProduct,
  type AvailabilityFilter,
} from '@/data/inventory-demo'
import { downloadCsv } from '@/lib/download'

export default function InventoryPage() {
  const { products, addProduct: storeProduct } = useInventory()
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [page, setPage] = useState(1)
  const [panel, setPanel] = useState<InventoryPanel | null>(null)
  const [notice, setNotice] = useState('')
  const [compact, setCompact] = useState(false)
  const filtered = selectProducts(products, query, availability)
  const pagination = paginateProducts(filtered, page)
  const alerts = products.filter((product) => product.availability !== 'in-stock')

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }
  function applyFilter(value: AvailabilityFilter) {
    setAvailability(value)
    setPage(1)
    setPanel(null)
  }
  function clearFilters() {
    setQuery('')
    setAvailability('all')
    setPage(1)
  }
  async function addProduct(product: Omit<InventoryProduct, 'id'>) {
    await storeProduct(product)
    setQuery('')
    setAvailability('all')
    setPage(Math.ceil((products.length + 1) / 9))
    setPanel(null)
    setNotice(
      `${product.name} was added to inventory.`,
    )
  }
  function downloadAll() {
    downloadCsv(inventoryCsv(products), 'shenban-inventory.csv')
    setNotice(`Downloaded ${products.length} products as CSV.`)
  }

  return (
    <WorkspaceLayout
      title="Inventory"
      query={query}
      onQueryChange={updateQuery}
      onAction={setPanel}
      notificationCount={alerts.length}
    >
      <InventoryOverview />
      {notice && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"
        >
          <CheckCircleIcon size={18} className="mt-0.5 shrink-0" />
          {notice}
        </p>
      )}
      <section
        className="mt-6 overflow-hidden rounded-[10px] bg-white"
        aria-labelledby="products-heading"
      >
        <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-5 pb-4">
          <h2 id="products-heading" className="dashboard-heading">
            Products
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPanel('add')}
              className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
            >
              Add Product
            </button>
            <button onClick={() => setPanel('filters')} className="inventory-button">
              <FunnelIcon size={18} />
              Filters
              {availability !== 'all' && (
                <span className="grid size-4 place-items-center rounded-full bg-blue-100 text-[10px] text-blue-700">
                  1
                </span>
              )}
            </button>
            <button onClick={downloadAll} className="inventory-button">
              Download all
            </button>
          </div>
        </header>
        {(query.trim() || availability !== 'all') && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-4 text-xs text-slate-500">
            <p role="status">
              {filtered.length} matching {filtered.length === 1 ? 'product' : 'products'}
              {availability !== 'all' ? ` · ${availabilityLabels[availability]}` : ''}
            </p>
            <button onClick={clearFilters} className="dashboard-link">
              Clear all filters
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Inventory products and stock levels.
            </caption>
            <thead>
              <tr className="border-b border-[#e9ecf0] text-[#7b8495]">
                {[
                  'Products',
                  'Buying Price',
                  'Quantity',
                  'Threshold Value',
                  'Expiry Date',
                  'Availability',
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 font-medium first:w-[19%] first:pl-5 last:pr-5"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagination.rows.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#e9ecf0] text-[#586171] hover:bg-slate-50/70 last:border-0"
                >
                  <th
                    scope="row"
                    className={`px-4 pl-5 font-normal ${compact ? 'py-2.5' : 'py-3.5'}`}
                  >
                    <Link
                      to={`/inventory/${product.id}`}
                      className="rounded underline-offset-4 hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      {product.name}
                    </Link>
                  </th>
                  <td className="px-4 tabular-nums">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-4 tabular-nums">
                    {product.quantity} {product.unit ?? 'Packets'}
                  </td>
                  <td className="px-4 tabular-nums">
                    {product.threshold} {product.unit ?? 'Packets'}
                  </td>
                  <td className="px-4 tabular-nums">
                    <time dateTime={product.expiry}>{displayExpiry(product.expiry)}</time>
                  </td>
                  <td
                    className={`px-4 pr-5 font-medium ${availabilityStyles[product.availability]}`}
                  >
                    {availabilityLabels[product.availability]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="grid min-h-64 place-content-center justify-items-center gap-3 px-6 text-center">
            <MagnifyingGlassIcon size={32} className="text-slate-400" />
            <h3 className="text-base font-medium text-slate-600">No matching products</h3>
            <p className="max-w-72 text-sm leading-6 text-slate-500">
              Try a different product name or clear the availability filter.
            </p>
            <button className="dashboard-link" onClick={clearFilters}>
              Clear search and filters
            </button>
          </div>
        )}
        <footer className="flex items-center justify-between gap-3 px-5 py-3">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPage(pagination.page - 1)}
            className="inventory-button"
          >
            Previous
          </button>
          <p aria-live="polite" className="text-xs text-[#667085] sm:text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
            className="inventory-button"
          >
            Next
          </button>
        </footer>
      </section>
      {panel && (
        <DashboardDialog
          title={panel === 'add' ? 'New Product' : inventoryPanelTitles[panel]}
          variant={panel === 'add' ? 'product' : 'default'}
          onClose={() => setPanel(null)}
        >
          <InventoryPanelContent
            panel={panel}
            products={products}
            availability={availability}
            compact={compact}
            onCompactChange={setCompact}
            onAdd={addProduct}
            onClose={() => setPanel(null)}
            onFilter={applyFilter}
            onDownload={downloadAll}
          />
        </DashboardDialog>
      )}
    </WorkspaceLayout>
  )
}
