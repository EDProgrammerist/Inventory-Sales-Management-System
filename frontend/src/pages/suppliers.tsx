import { useState } from 'react'
import {useCommerce} from '@/components/context/commerce-context'
import { FunnelIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@phosphor-icons/react'
import CommerceLayout from '@/components/common/commerce-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import DeleteRecordDialog from '@/components/ui/delete-record-dialog'
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
import { useWorkspace } from '@/components/context/workspace-context'

type SupplierPanel = 'new-supplier' | 'edit-supplier' | 'supplier-filters' | 'supplier-details'
const typeStyles = {
  'taking-return': 'text-emerald-700',
  'not-taking-return': 'text-red-700',
  unspecified: 'text-muted',
}

export default function SuppliersPage() {
  const commerce=useCommerce()
  const { suppliers, saveSupplier, deleteSupplier } = useWorkspace()
  const [deleting,setDeleting]=useState<Supplier|null>(null)
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
  async function addSupplier(supplier: Omit<Supplier, 'id'>) {
    const editing=panel==='edit-supplier'?selectedSupplier:null
    await saveSupplier({ ...supplier, id: editing?.id??crypto.randomUUID() },Boolean(editing))
    clearFilters()
    setPage(editing?1:Math.ceil((suppliers.length + 1) / supplierPageSize))
    setPanel(null)
    setNotice(
      `${supplier.name} was ${editing?'updated':'added'} in the supplier list.`,
    )
  }
  function downloadAll() {
    downloadCsv(suppliersCsv(suppliers), 'shenban-suppliers.csv')
    setNotice(`Downloaded all ${suppliers.length} supplier rows.`)
  }
  function panelTitle(value: SupplierPanel) {
    if (value === 'new-supplier') return 'New Supplier'
    if (value === 'edit-supplier') return 'Edit Supplier'
    if (value === 'supplier-filters') return 'Filter suppliers'
    return selectedSupplier?.name ?? 'Supplier details'
  }

  return (
    <CommerceLayout
      title="Suppliers"
      query={query}
      onQueryChange={updateQuery}
      searchPlaceholder="Search suppliers or products"
      searchLabel="Search suppliers, products, email, or contact number"
      compact={compact}
      onCompactChange={setCompact}
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
              <tr className="border-b border-divider text-muted">
                {['Supplier Name', 'Product', 'Contact Number', 'Email', 'Type', 'On the way', 'Actions'].map(
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
                  <td className="px-4"><div className="flex gap-3"><button className="dashboard-link" aria-label={`Edit ${supplier.name}`} onClick={()=>{setSelectedSupplier(supplier);setPanel('edit-supplier')}}>Edit</button><button className="dashboard-link text-red-700" aria-label={`Delete ${supplier.name}`} onClick={()=>setDeleting(supplier)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="grid min-h-64 place-content-center justify-items-center gap-3 px-6 text-center">
            <MagnifyingGlassIcon size={32} className="text-slate-300" />
            <h3 className="font-medium text-ink">{suppliers.length?'No matching suppliers':'No suppliers yet'}</h3>
            <p className="max-w-72 text-sm leading-6 text-slate-500">
              {suppliers.length?'Try another name, product, email, or contact number, or clear the return-type filters.':'Add your first supplier to save their electronics products and contact information.'}
            </p>
            <button onClick={suppliers.length?clearFilters:()=>setPanel('new-supplier')} className="dashboard-link">
              {suppliers.length?'Clear search and filters':'Add supplier'}
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
          variant={panel === 'new-supplier'||panel==='edit-supplier' ? 'product' : 'default'}
          onClose={() => setPanel(null)}
        >
          {(panel === 'new-supplier'||panel==='edit-supplier') && (
            <SupplierForm
              catalog={commerce.products}
              suppliers={suppliers}
              supplier={panel==='edit-supplier'?selectedSupplier??undefined:undefined}
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
        </DashboardDialog>
      )}
      {deleting&&<DeleteRecordDialog name={deleting.name} description="This permanently removes this supplier contact from your list. Products and saved orders are unchanged." onClose={()=>setDeleting(null)} onDelete={async()=>{await deleteSupplier(deleting.id);setNotice(`${deleting.name} was deleted.`)}}/>}
    </CommerceLayout>
  )
}
