import { useState } from 'react'
import { FunnelIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@phosphor-icons/react'
import WorkspaceLayout, { type WorkspaceAction } from '@/components/common/workspace-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import SupplierForm from '@/components/features/suppliers/supplier-form'
import { SupplierFilters, SupplierDetails } from '@/components/features/suppliers/supplier-panels'
import {
  supplierTypeLabels,
  supplierPageSize,
  selectSuppliers,
  suppliersCsv,
  type Supplier,
  type SupplierTypeFilter,
} from '@/data/suppliers-demo'
import { paginateRows } from '@/data/pagination'
import { downloadCsv } from '@/lib/download'
import { useInventory } from '@/components/context/inventory-context'
import { useWorkspace } from '@/components/context/workspace-context'
import InventoryPanelContent from '@/components/features/inventory/inventory-panels'
import { inventoryPanelTitles } from '@/components/features/inventory/inventory-presentation'

type SupplierPanel = WorkspaceAction | 'new-supplier' | 'supplier-filters' | 'supplier-details'
const typeStyles = {
  'taking-return': 'text-[#1aaf78]',
  'not-taking-return': 'text-[#e85050]',
  unspecified: 'text-[#98a0ae]',
}

export default function SuppliersPage() {
  const { products: inventory, addProduct } = useInventory()
  const { suppliers, setSuppliers } = useWorkspace()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<SupplierTypeFilter>('all')
  const [onWayOnly, setOnWayOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [panel, setPanel] = useState<SupplierPanel | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [notice, setNotice] = useState('')
  const [compact, setCompact] = useState(false)
  const filtered = selectSuppliers(suppliers, query, type, onWayOnly)
  const pagination = paginateRows(filtered, page, supplierPageSize)
  const filterCount = Number(type !== 'all') + Number(onWayOnly)

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }
  function clearFilters() {
    setQuery('')
    setType('all')
    setOnWayOnly(false)
    setPage(1)
  }
  function addSupplier(supplier: Omit<Supplier, 'id'>) {
    const next = [...suppliers, { ...supplier, id: crypto.randomUUID() }]
    setSuppliers(next)
    clearFilters()
    setPage(Math.ceil(next.length / supplierPageSize))
    setPanel(null)
    setNotice(
      `${supplier.name} was added to the supplier list.`,
    )
  }
  function downloadAll() {
    downloadCsv(suppliersCsv(suppliers), 'shenban-suppliers.csv')
    setNotice(`Downloaded all ${suppliers.length} supplier rows.`)
  }
  function panelTitle(value: SupplierPanel) {
    if (value === 'new-supplier') return 'New Supplier'
    if (value === 'supplier-filters') return 'Filter suppliers'
    if (value === 'supplier-details') return selectedSupplier?.name ?? 'Supplier details'
    return inventoryPanelTitles[value]
  }

  return (
    <WorkspaceLayout
      title="Suppliers"
      query={query}
      onQueryChange={updateQuery}
      searchPlaceholder="Search suppliers or products"
      searchLabel="Search suppliers, products, email, or contact number"
      onAction={setPanel}
      notificationCount={inventory.filter((row) => row.availability !== 'in-stock').length}
    >
      {notice && (
        <p
          role="status"
          className="mb-4 flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"
        >
          <CheckCircleIcon size={18} className="mt-0.5 shrink-0" />
          {notice}
        </p>
      )}
      <section
        className="min-w-0 overflow-hidden rounded-[10px] bg-white"
        aria-labelledby="suppliers-heading"
      >
        <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-5 pb-4">
          <h2 id="suppliers-heading" className="dashboard-heading">
            Suppliers
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPanel('new-supplier')}
              className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
            >
              Add Supplier
            </button>
            <button onClick={() => setPanel('supplier-filters')} className="inventory-button">
              <FunnelIcon size={18} />
              Filters
              {filterCount > 0 && (
                <span className="grid size-4 place-items-center rounded-full bg-blue-100 text-[10px] text-blue-700">
                  {filterCount}
                </span>
              )}
            </button>
            <button onClick={downloadAll} className="inventory-button">
              Download all
            </button>
          </div>
        </header>
        {(query.trim() || filterCount > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 text-xs text-slate-500">
            <p role="status">
              {filtered.length} matching supplier {filtered.length === 1 ? 'row' : 'rows'}
              {type !== 'all' ? ` · ${supplierTypeLabels[type]}` : ''}
              {onWayOnly ? ' · Products on the way' : ''}
            </p>
            <button onClick={clearFilters} className="dashboard-link">
              Clear all filters
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Supplier contact and return information.
            </caption>
            <thead>
              <tr className="border-b border-[#edf0f3] text-[#7b8495]">
                {['Supplier Name', 'Product', 'Contact Number', 'Email', 'Type', 'On the way'].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 font-medium first:pl-5 last:pr-5"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pagination.rows.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-[#edf0f3] text-[#586171] last:border-0 hover:bg-slate-50/70"
                >
                  <th scope="row" className={`px-4 pl-5 font-normal ${compact ? 'py-2' : 'py-3'}`}>
                    <button
                      onClick={() => {
                        setSelectedSupplier(supplier)
                        setPanel('supplier-details')
                      }}
                      className="rounded text-left underline-offset-4 hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      {supplier.name}
                    </button>
                  </th>
                  <td className="px-4">{supplier.product}</td>
                  <td className="px-4 tabular-nums">{supplier.phone}</td>
                  <td className="px-4">{supplier.email}</td>
                  <td className={`px-4 ${typeStyles[supplier.type]}`}>
                    {supplierTypeLabels[supplier.type]}
                  </td>
                  <td className="px-4 pr-5 tabular-nums">{supplier.onWay ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="grid min-h-64 place-content-center justify-items-center gap-3 px-6 text-center">
            <MagnifyingGlassIcon size={32} className="text-slate-300" />
            <h3 className="font-medium text-slate-600">No matching suppliers</h3>
            <p className="max-w-72 text-sm leading-6 text-slate-500">
              Try another name, product, email, or contact number, or clear the return-type filters.
            </p>
            <button onClick={clearFilters} className="dashboard-link">
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
          key={panel}
          title={panelTitle(panel)}
          variant={panel === 'new-supplier' ? 'product' : 'default'}
          onClose={() => setPanel(null)}
        >
          {panel === 'new-supplier' && (
            <SupplierForm
              suppliers={suppliers}
              onAdd={addSupplier}
              onDiscard={() => setPanel(null)}
            />
          )}
          {panel === 'supplier-filters' && (
            <SupplierFilters
              type={type}
              onWayOnly={onWayOnly}
              onApply={(nextType, nextOnWay) => {
                setType(nextType)
                setOnWayOnly(nextOnWay)
                setPage(1)
                setPanel(null)
              }}
            />
          )}
          {panel === 'supplier-details' && selectedSupplier && (
            <SupplierDetails supplier={selectedSupplier} />
          )}
          {panel !== 'new-supplier' &&
            panel !== 'supplier-filters' &&
            panel !== 'supplier-details' && (
              <InventoryPanelContent
                panel={panel}
                products={inventory}
                availability="all"
                compact={compact}
                onCompactChange={setCompact}
                onAdd={(product) => {
                  addProduct(product)
                  setPanel(null)
                }}
                onClose={() => setPanel(null)}
                onFilter={() => setPanel(null)}
                onDownload={downloadAll}
              />
            )}
        </DashboardDialog>
      )}
    </WorkspaceLayout>
  )
}
