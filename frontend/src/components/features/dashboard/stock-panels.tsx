import { formatMoney } from '@/data/currency'
import { Link } from 'react-router'
import { filterStock, lowStock, topStock, type StockItem } from '@/data/dashboard-demo'

export function StockTable({ items, compact = false }: { items: StockItem[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Stock quantities and prices in Philippine pesos.
        </caption>
        <thead className="text-[13px] font-normal text-[#6b768c]">
          <tr className="border-y border-[#f0f1f4]">
            {['Name', 'Sold Quantity', 'Remaining Quantity', 'Price'].map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 text-right font-medium first:pl-5 first:text-left last:pr-5"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.name}
              className="border-b border-[#f0f1f4] text-[#656a73] last:border-0 hover:bg-slate-50/70"
            >
              <th
                scope="row"
                className={`px-4 font-normal first:pl-5 ${compact ? 'py-3' : 'py-5'}`}
              >
                {item.name}
              </th>
              <td className="px-4 text-right tabular-nums">{item.sold ?? '—'}</td>
              <td className="px-4 text-right tabular-nums">{item.remaining}</td>
              <td className="px-4 text-right tabular-nums last:pr-5">
                {item.price === undefined ? '—' : formatMoney(item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyStock({ query }: { query: string }) {
  return (
    <div className="grid justify-items-start gap-2 px-5 py-5 text-left">
      <p className="text-sm font-medium text-ink">{query.trim() ? 'No matching stock' : 'No stock activity yet'}</p>
      <p className="max-w-72 text-sm leading-5 text-muted">
        {query.trim() ? `No products match “${query.trim()}”. Try another product name.` : 'Stock activity will appear here when available.'}
      </p>
      {!query.trim() && <Link to="/inventory" className="dashboard-link">Open inventory</Link>}
    </div>
  )
}

export function TopStockPanel({
  query,
  compact,
  onSeeAll,
}: {
  query: string
  compact: boolean
  onSeeAll: () => void
}) {
  const items = filterStock(topStock, query)
  return (
    <section
      className="overflow-hidden rounded-[10px] bg-white"
      aria-labelledby="top-stock-heading"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <h2 id="top-stock-heading" className="dashboard-heading">
          Top Selling Stock
        </h2>
        <button onClick={onSeeAll} className="dashboard-link">
          See All<span className="sr-only"> stock</span>
        </button>
      </header>
      {items.length ? <StockTable items={items} compact={compact} /> : <EmptyStock query={query} />}
    </section>
  )
}

export function LowStockPanel({ query, onSeeAll }: { query: string; onSeeAll: () => void }) {
  const items = filterStock(lowStock, query)
  return (
    <section className="dashboard-card" aria-labelledby="low-stock-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="low-stock-heading" className="dashboard-heading">
          Low Quantity Stock
        </h2>
        <button onClick={onSeeAll} className="dashboard-link">
          See All<span className="sr-only"> low quantity stock</span>
        </button>
      </header>
      {items.length ? (
        <ul className="mt-4 space-y-5">
          {items.map((item) => (
            <li key={item.name} className="flex items-center gap-4">
              <img src={item.image} alt="" className="h-[64px] w-[64px] shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#454e60]">{item.name}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#7b869d]">
                  Remaining Quantity : {item.remaining} Packet
                </p>
              </div>
              <span className="rounded-full bg-[#fff0f0] px-2 py-1 text-[11px] font-medium text-[#d64646]">
                Low
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyStock query={query} />
      )}
    </section>
  )
}
