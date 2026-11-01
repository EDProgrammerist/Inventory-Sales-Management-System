import {useState} from 'react'
import CommerceLayout from '@/components/common/commerce-layout'
import {useCommerce} from '@/components/context/commerce-context'
import {commerceMetrics} from '@/data/customer-orders'
import {electronicsCategories} from '@/data/admin-catalog'
import {formatMoney} from '@/data/currency'
import DemoSalesChart from '@/components/features/orders/demo-sales-chart'
import {downloadCsv} from '@/lib/download'
import {toCsv} from '@/data/csv'

export default function AdminReportsPage(){
 const {orders,products}=useCommerce(),[query,setQuery]=useState('')
 const metrics=commerceMetrics(products,orders)
 const rows=electronicsCategories.map(category=>{const ids=products.filter(product=>product.category===category.id).map(product=>product.id);const lines=orders.filter(order=>order.paymentState==='demo_paid'&&order.status!=='cancelled').flatMap(order=>order.items).filter(item=>item.category?item.category===category.id:ids.includes(item.productId));return {...category,units:lines.reduce((sum,line)=>sum+line.quantity,0),total:lines.reduce((sum,line)=>sum+Math.round(line.total*100),0)/100}}).filter(row=>row.name.toLowerCase().includes(query.toLowerCase().trim()))
 return <CommerceLayout title="Reports" query={query} onQueryChange={setQuery}><div className="commerce-toolbar"><p>Demo order totals from the database. Cancelled orders are excluded; profit and real revenue are not recorded.</p><button className="inventory-button" onClick={()=>downloadCsv(toCsv([['Category','Demo units','Demo sales (PHP)'],...rows.map(row=>[row.name,row.units,row.total])]),'shenban-demo-sales.csv')}>Export demo sales</button></div><dl className="commerce-summary"><div><dt>Demo sales</dt><dd>{formatMoney(metrics.demoSales)}</dd></div><div><dt>Active demo orders</dt><dd>{metrics.demoOrders}</dd></div><div><dt>Cancelled orders</dt><dd>{metrics.cancelled}</dd></div><div><dt>Real payments</dt><dd>Not collected</dd></div></dl><div className="commerce-overview-grid"><DemoSalesChart orders={orders}/><section className="commerce-sheet"><h2 className="dashboard-heading mb-4">By product family</h2><table className="commerce-table"><thead><tr><th>Family</th><th className="num">Units</th><th className="num">Demo sales</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.name}</td><td data-label="Units" className="num">{row.units}</td><td data-label="Demo sales" className="num">{formatMoney(row.total)}</td></tr>)}</tbody></table>{!rows.length&&<p className="commerce-note">No family matches your search.</p>}</section></div></CommerceLayout>
}
