import {useId,useState} from 'react'
import type {CustomerOrder} from '@/data/customer-orders'
import {orderTrend} from '@/data/admin-dashboard'

export default function CustomerOrderChart({orders}:{orders:CustomerOrder[]}){
 const id=useId(),[year,setYear]=useState(new Date().getFullYear())
 const years=[...new Set([new Date().getFullYear(),...orders.map(order=>new Date(order.createdAt).getFullYear())])].sort((a,b)=>b-a)
 const rows=orderTrend(orders,year),max=Math.max(1,...rows.map(row=>row.ordered)),step=Math.max(1,Math.ceil(max/4)),top=step*4
 const path=(key:'ordered'|'delivered')=>rows.map((row,index)=>`${index?'L':'M'}${48+index*27} ${215-row[key]/top*170}`).join(' ')
 return <section className="dashboard-card" aria-labelledby={`${id}-title`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 id={`${id}-title`} className="dashboard-heading">Order Summary</h2><label className="text-[13px] text-muted">Year <select className="ml-2 min-h-11 rounded border border-control bg-surface px-2" value={year} onChange={event=>setYear(Number(event.target.value))}>{years.map(value=><option key={value}>{value}</option>)}</select></label></div>
  <div className="mt-5 overflow-x-auto" role="region" tabIndex={0} aria-label="Order summary chart. Scroll horizontally to inspect."><svg viewBox="0 0 370 255" className="block min-w-[370px] w-full" role="img" aria-label={`Ordered and currently delivered units by order placement month in ${year}. Cancelled orders excluded.`}>
   {[0,1,2,3,4].map(tick=><g key={tick}><line x1="48" x2="350" y1={215-tick*42.5} y2={215-tick*42.5} stroke="var(--color-divider)"/><text x="38" y={220-tick*42.5} textAnchor="end" fontSize="14" fill="var(--color-muted)">{tick*step}</text></g>)}
   <path d={path('ordered')} fill="none" stroke="var(--color-chart-secondary)" strokeWidth="2"/><path d={path('delivered')} fill="none" stroke="var(--color-chart-primary)" strokeWidth="2"/>
   {rows.map((row,index)=>index%3===0&&<text key={row.month} x={48+index*27} y="242" textAnchor="middle" fontSize="14" fill="var(--color-muted)">{row.month}</text>)}
  </svg></div><div className="mt-3 flex flex-wrap justify-center gap-5 text-[13px] text-muted"><span className="flex items-center gap-2"><span className="size-3 rounded-full bg-chart-secondary"/>Ordered units</span><span className="flex items-center gap-2"><span className="size-3 rounded-full bg-chart-primary"/>Delivered units</span></div><p className="mt-4 text-[13px] leading-6 text-muted">Grouped by placement month, using current delivery status. Demo orders only.</p><details className="mt-3 text-sm"><summary className="min-h-11 cursor-pointer text-muted">View monthly units</summary><table className="commerce-table"><thead><tr><th>Month</th><th>Ordered</th><th>Delivered</th></tr></thead><tbody>{rows.map(row=><tr key={row.month}><th scope="row" className="text-left font-normal">{row.month}</th><td data-label="Ordered">{row.ordered}</td><td data-label="Delivered">{row.delivered}</td></tr>)}</tbody></table></details>
 </section>
}
