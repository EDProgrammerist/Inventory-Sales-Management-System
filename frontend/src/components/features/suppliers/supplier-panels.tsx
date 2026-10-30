import { formatMoney } from '@/data/currency'
import { useState } from 'react'
import {
  supplierTypeLabels,
  suppliersCsv,
  type Supplier,
  type SupplierTypeFilter,
} from '@/data/suppliers-demo'
import { downloadCsv } from '@/lib/download'

export function SupplierFilters({
  type,
  onWayOnly,
  onApply,
}: {
  type: SupplierTypeFilter
  onWayOnly: boolean
  onApply: (type: SupplierTypeFilter, onWayOnly: boolean) => void
}) {
  const [draftType, setDraftType] = useState(type)
  const [draftOnWay, setDraftOnWay] = useState(onWayOnly)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onApply(draftType, draftOnWay)
      }}
      className="space-y-6"
    >
      <label className="grid gap-2 text-sm font-medium">
        Return type
        <select
          name="supplier-type-filter"
          value={draftType}
          onChange={(event) => setDraftType(event.target.value as SupplierTypeFilter)}
          className="h-11 rounded-md border border-slate-200 bg-white px-3 font-normal"
        >
          <option value="all">All types</option>
          {Object.entries(supplierTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input
          name="supplier-on-way"
          type="checkbox"
          checked={draftOnWay}
          onChange={(event) => setDraftOnWay(event.target.checked)}
          className="size-4 accent-blue-600"
        />
        Only suppliers with products on the way
      </label>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setDraftType('all')
            setDraftOnWay(false)
          }}
          className="inventory-button"
        >
          Reset
        </button>
        <button
          type="submit"
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
        >
          Apply filters
        </button>
      </div>
    </form>
  )
}

export function SupplierDetails({ supplier }: { supplier: Supplier }) {
  const fields = [
    ['Product', supplier.product],
    ['Category', supplier.category ?? 'Not recorded'],
    [
      'Buying Price',
      supplier.price === undefined
        ? 'Not recorded'
        : formatMoney(supplier.price),
    ],
    ['Contact Number', supplier.phone],
    ['Email', supplier.email],
    ['Type', supplierTypeLabels[supplier.type]],
    ['On the way', supplier.onWay === null ? 'Not recorded' : String(supplier.onWay)],
  ]
  return (
    <div>
      {supplier.image && (
        <img
          src={supplier.image}
          alt={supplier.name}
          className="mx-auto mb-6 size-24 rounded-full object-cover"
        />
      )}
      <p className="mb-5 text-xs text-slate-500">Supplier details</p>
      <dl className="grid gap-4 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="break-words text-slate-600">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() =>
            downloadCsv(suppliersCsv([supplier]), `shenban-supplier-${supplier.id}.csv`)
          }
          className="inventory-button"
        >
          Download supplier CSV
        </button>
      </div>
    </div>
  )
}
