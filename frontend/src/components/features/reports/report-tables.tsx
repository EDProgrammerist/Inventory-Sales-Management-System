import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { reportMoney, type ReportCategory, type ReportProduct } from '@/data/reports-demo'

export function ReportEmpty({ description }: { description: string }) {
  return (
    <div className="grid min-h-44 place-content-center justify-items-center gap-3 px-5 text-center">
      <MagnifyingGlassIcon size={27} className="text-slate-300" />
      <p className="text-sm font-medium text-slate-600">No matching records</p>
      <p className="max-w-72 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}

export function ReportCategoryTable({
  rows,
  selected,
  onSelect,
}: {
  rows: ReportCategory[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[380px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Sample best-selling categories. Select a category to filter products.
        </caption>
        <thead>
          <tr className="border-b border-[#edf0f3] text-[#748097]">
            {['Category', 'Turn Over', 'Increase By'].map((title) => (
              <th
                key={title}
                scope="col"
                className="px-4 py-3 text-[13px] font-medium first:pl-5 last:pr-5"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-[#edf0f3] last:border-0 ${selected === row.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}`}
            >
              <th scope="row" className="px-4 py-3 pl-5 font-normal text-[#616c7e]">
                <button
                  type="button"
                  aria-pressed={selected === row.id}
                  onClick={() => onSelect(row.id)}
                  className="rounded text-left underline-offset-4 hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                  {row.name}
                </button>
              </th>
              <td className="px-4 py-3 text-[#616c7e] tabular-nums">{reportMoney(row.turnover)}</td>
              <td className="px-4 py-3 pr-5 text-[#1bbd7b] tabular-nums">{row.increase}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ReportProductsTable({
  rows,
  compact,
  onSelect,
}: {
  rows: ReportProduct[]
  compact: boolean
  onSelect: (product: ReportProduct) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Sample best-selling products from the Reports reference; these are a separate snapshot
          from current sample inventory.
        </caption>
        <thead>
          <tr className="border-b border-[#edf0f3] text-[#748097]">
            {[
              'Product',
              'Product ID',
              'Category',
              'Remaining Quantity',
              'Turn Over',
              'Increase By',
            ].map((title) => (
              <th
                key={title}
                scope="col"
                className="px-4 py-4 text-[13px] font-medium first:pl-5 last:pr-5"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[#edf0f3] text-[#596476] last:border-0 hover:bg-slate-50/70"
            >
              <th scope="row" className={`px-4 pl-5 font-normal ${compact ? 'py-2.5' : 'py-4'}`}>
                <button
                  type="button"
                  onClick={() => onSelect(row)}
                  className="rounded text-left underline-offset-4 hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                  {row.name}
                </button>
              </th>
              <td className="px-4 tabular-nums">{row.productId}</td>
              <td className="px-4">{row.category}</td>
              <td className="px-4 tabular-nums">
                {row.remaining} {row.unit}
              </td>
              <td className="px-4 tabular-nums">{reportMoney(row.turnover)}</td>
              <td className="px-4 pr-5 text-[#1bbd7b] tabular-nums">{row.increase}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
