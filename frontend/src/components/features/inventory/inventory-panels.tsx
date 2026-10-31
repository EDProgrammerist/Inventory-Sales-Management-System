import { useState } from 'react'
import WorkspaceProfile from '@/components/common/workspace-profile'
import { Link } from 'react-router'
import {
  availabilityStyles,
  inventoryPanelTitles,
  type InventoryPanel,
} from './inventory-presentation'
import ProductForm from './product-form'
import {
  availabilityLabels,
  type InventoryProduct,
  type AvailabilityFilter,
} from '@/data/inventory-demo'

function FiltersForm({
  availability,
  onApply,
}: {
  availability: AvailabilityFilter
  onApply: (value: AvailabilityFilter) => void
}) {
  const [draft, setDraft] = useState(availability)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onApply(draft)
      }}
      className="space-y-6"
    >
      <label className="grid gap-2 text-sm font-medium">
        Availability
        <select
          name="availability-filter"
          value={draft}
          onChange={(event) => setDraft(event.target.value as AvailabilityFilter)}
          className="h-11 rounded-md border border-slate-200 bg-white px-3 font-normal"
        >
          <option value="all">All availability</option>
          {Object.entries(availabilityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className="inventory-button" onClick={() => setDraft('all')}>
          Reset
        </button>
        <button
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
          type="submit"
        >
          Apply filters
        </button>
      </div>
    </form>
  )
}

export default function InventoryPanelContent({
  panel,
  products,
  availability,
  compact,
  onCompactChange,
  onAdd,
  onClose,
  onFilter,
  onDownload,
}: {
  panel: InventoryPanel
  products: InventoryProduct[]
  availability: AvailabilityFilter
  compact: boolean
  onCompactChange: (value: boolean) => void
  onAdd: (product: Omit<InventoryProduct, 'id'>) => void | Promise<void>
  onClose: () => void
  onFilter: (value: AvailabilityFilter) => void
  onDownload: () => void
}) {
  if (panel === 'add') return <ProductForm products={products} onAdd={onAdd} onCancel={onClose} />
  if (panel === 'filters') return <FiltersForm availability={availability} onApply={onFilter} />
  if (panel === 'reports')
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-500">
          Export all {products.length} products, including buying prices, quantities,
          thresholds, expiry dates, and availability.
        </p>
        <button onClick={onDownload} className="inventory-button">
          Download inventory CSV
        </button>
      </div>
    )
  if (panel === 'notifications')
    return (
      <ul className="divide-y divide-slate-100">
        {!products.some((product) => product.availability !== 'in-stock') && (
          <li className="py-3 text-sm text-muted">No stock alerts. Products needing attention will appear here.</li>
        )}
        {products
          .filter((product) => product.availability !== 'in-stock')
          .map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>{product.name}</span>
              <span className={availabilityStyles[product.availability]}>
                {availabilityLabels[product.availability]}
              </span>
            </li>
          ))}
      </ul>
    )
  if (panel === 'settings')
    return (
      <label className="flex items-center gap-3 text-sm">
        <input
          name="compact-inventory"
          type="checkbox"
          checked={compact}
          onChange={(event) => onCompactChange(event.target.checked)}
          className="size-4 accent-blue-600"
        />
        Use compact product rows
      </label>
    )
  if (panel === 'profile') return <WorkspaceProfile />
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {inventoryPanelTitles[panel]} is currently unavailable.
      </p>
      <Link to="/dashboard" className="dashboard-link">
        Back to dashboard
      </Link>
    </div>
  )
}
