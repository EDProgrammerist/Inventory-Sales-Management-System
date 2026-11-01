import {useState} from 'react'
import type {CustomerOrder} from '@/data/customer-orders'
import {monthlyDemoSales} from '@/data/customer-orders'
import {formatMoney} from '@/data/currency'

// Charts.bars' zero baseline, round scale and fixed axis lane, adapted to React.
function ticks(maximum:number) {
  if(maximum===0)return [0]
  const raw=maximum/4,magnitude=10**Math.floor(Math.log10(raw))
  const step=[1,2,2.5,5,10].map(value=>value*magnitude).find(value=>value>=raw)??10*magnitude
  const top=(Math.floor(maximum/step)+1)*step
  return Array.from({length:Math.round(top/step)+1},(_,index)=>index*step)
}
export default function DemoSalesChart({orders}:{orders:CustomerOrder[]}) {
  const [year,setYear]=useState(new Date().getFullYear())
  const years=[...new Set([new Date().getFullYear(),...orders.map(order=>new Date(order.createdAt).getFullYear())])].sort((a,b)=>b-a)
  const rows=monthlyDemoSales(orders,year),scale=ticks(Math.max(0,...rows.map(row=>row.value))),top=scale.at(-1)||1
  const x=72,y=14,width=580,height=150,step=width/rows.length
  return <section className="commerce-sheet" aria-labelledby="demo-sales-chart-title"><header className="commerce-toolbar"><h2 id="demo-sales-chart-title" className="dashboard-heading">Demo sales</h2><label className="text-sm text-muted">Year <select className="ml-2 min-h-11 rounded border border-control bg-surface px-2" value={year} onChange={event=>setYear(Number(event.target.value))}>{years.map(value=><option key={value}>{value}</option>)}</select></label></header>
    <div className="commerce-chart-frame" role="region" tabIndex={0} aria-label="Monthly demo sales chart. Scroll horizontally to inspect the plot."><svg className="commerce-chart" viewBox="0 0 670 200" role="img" aria-label={`Monthly simulated sales in PHP for ${year}. Cancelled orders excluded.`}>
      {scale.map(value=><g key={value}><line x1={x} x2={x+width} y1={y+height*(1-value/top)} y2={y+height*(1-value/top)} stroke="var(--color-divider)"/><text x={x-10} y={y+height*(1-value/top)+4} textAnchor="end" fill="var(--color-muted)" fontSize="12">{value===0?'₱0':new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',notation:'compact',maximumFractionDigits:1}).format(value)}</text></g>)}
      {rows.map((row,index)=><g key={row.label}><rect x={x+index*step+step*.2} y={y+height*(1-row.value/top)} width={step*.6} height={height*row.value/top} fill="var(--color-chart-primary)"><title>{row.label}: {formatMoney(row.value)}</title></rect>{index%3===0&&<text x={x+index*step+step/2} y={190} textAnchor="middle" fill="var(--color-muted)" fontSize="12">{row.label}</text>}</g>)}
    </svg></div>
    <p className="commerce-note">{rows.every(row=>row.value===0)?'No simulated sales in this year. Place a demo order from the store to test this chart.':'Simulated payments only. No real revenue or payment is recorded.'}</p>
    <details className="mt-3 text-sm"><summary className="min-h-11 cursor-pointer text-muted">View monthly values</summary><dl className="grid grid-cols-2 gap-x-6 gap-y-2">{rows.map(row=><div className="flex justify-between gap-3" key={row.label}><dt>{row.label}</dt><dd className="tabular-nums">{formatMoney(row.value)}</dd></div>)}</dl></details>
  </section>
}
