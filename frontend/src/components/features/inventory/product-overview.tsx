import { PackageIcon } from '@phosphor-icons/react'
import { displayExpiry, type InventoryProduct } from '@/data/inventory-demo'
import { productForOverview } from '@/data/inventory-state'

export default function ProductOverview({
  product,
  compact,
  onLocation,
}: {
  product: InventoryProduct
  compact: boolean
  onLocation: (location: { name: string; quantity: number }) => void
}) {
  const overview = productForOverview(product)
  const primary = [
    ['Product name', product.name],
    ['Product ID', product.sku ?? 'Not assigned'],
    ['Product category', product.category ?? 'Not assigned'],
    ['Expiry Date', displayExpiry(overview.expiry)],
    ['Threshold Value', String(product.threshold)],
  ]
  const supplier = [
    ['Supplier name', product.details?.supplierName ?? 'Not recorded'],
    ['Contact Number', product.details?.supplierPhone ?? 'Not recorded'],
  ]
  const summary = [
    ['Opening Stock', product.details?.openingStock ?? '—'],
    ['Remaining Stock', overview.quantity],
    ['On the way', product.details?.onWay ?? '—'],
    ['Threshold value', product.threshold],
  ]

  return (
    <div className="grid gap-10 px-1 pt-7 sm:px-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(220px,.9fr)] lg:gap-12">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#535d6c]">Primary Details</h3>
        <dl className="mt-5 space-y-6">
          {primary.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] gap-4 text-sm"
            >
              <dt className="text-[#939aa7]">{label}</dt>
              <dd className="break-words text-[#657083]">{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-11 text-base font-semibold text-[#535d6c]">Supplier Details</h3>
        <dl className="mt-5 space-y-6">
          {supplier.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] gap-4 text-sm"
            >
              <dt className="text-[#939aa7]">{label}</dt>
              <dd className="break-words text-[#657083]">{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-11 text-base font-semibold text-[#535d6c]">Stock Locations</h3>
        {product.details?.locations?.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fb] text-[#667085]">
                <tr>
                  <th scope="col" className="px-2 py-3 font-medium">
                    Store Name
                  </th>
                  <th scope="col" className="px-2 py-3 text-right font-medium">
                    Stock in hand
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.details.locations.map((location) => (
                  <tr key={location.name} className="border-b border-[#eef0f3]">
                    <th
                      scope="row"
                      className={`px-2 font-normal text-[#939aa7] ${compact ? 'py-3' : 'py-5'}`}
                    >
                      {location.name}
                    </th>
                    <td className="px-2 text-right">
                      <button
                        type="button"
                        onClick={() => onLocation(location)}
                        className="dashboard-link"
                        aria-label={`${location.name}: ${location.quantity} ${product.unit ?? 'Packets'} in hand`}
                      >
                        {location.quantity}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            No stock locations are recorded for this quantity.
          </p>
        )}
      </div>
      <aside aria-label="Product image and stock summary" className="lg:pt-0">
        <div className="mx-auto grid size-44 place-items-center border border-dashed border-[#b6bbc3] p-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full max-h-[150px] w-full object-contain"
            />
          ) : (
            <div className="grid justify-items-center gap-2 text-slate-400">
              <PackageIcon size={32} weight="regular" />
              <span className="text-xs">No product image</span>
            </div>
          )}
        </div>
        <dl className="mt-12 space-y-7">
          {summary.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-[#939aa7]">{label}</dt>
              <dd className="font-medium text-[#657083] tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}
