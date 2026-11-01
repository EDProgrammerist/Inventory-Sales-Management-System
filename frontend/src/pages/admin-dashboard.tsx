import {useState} from 'react'
import {Link} from 'react-router'
import CommerceLayout from '@/components/common/commerce-layout'
import {useCommerce} from '@/components/context/commerce-context'
import {useWorkspace} from '@/components/context/workspace-context'
import {commerceMetrics,statusLabels} from '@/data/customer-orders'
import {formatMoney} from '@/data/currency'
import {electronicsCategories} from '@/data/admin-catalog'
import DemoSalesChart from '@/components/features/orders/demo-sales-chart'

export default function AdminDashboardPage(){
 const {products,orders,refresh}=useCommerce(),{suppliers,stores}=useWorkspace(),[query,setQuery]=useState('')
 const metrics=commerceMetrics(products,orders),pending=orders.filter(order=>order.status==='pending'),visible=orders.filter(order=>`${order.id} ${order.customerName??''} ${order.customerEmail??''} ${order.items.map(item=>item.name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,4)
 const unknown=products.filter(product=>product.stockQuantity===null).length
 return <CommerceLayout title="Dashboard" query={query} onQueryChange={setQuery}>
  <div className="commerce-toolbar"><p>{pending.length?`${pending.length} customer orders need confirmation.`:'No customer orders are waiting for confirmation.'} All payment totals are simulated.</p><div className="flex flex-wrap gap-3"><button className="inventory-button" onClick={refresh}>Refresh data</button><Link className="inventory-button commerce-primary" to="/inventory">Manage products</Link></div></div>
  <dl className="commerce-summary"><div><dt>Awaiting confirmation</dt><dd>{metrics.pending}</dd></div><div><dt>Demo sales (PHP)</dt><dd>{formatMoney(metrics.demoSales)}</dd></div><div><dt>Catalog products</dt><dd>{metrics.products}</dd></div><div><dt>Active demo orders</dt><dd>{metrics.demoOrders}</dd></div></dl>
  <div className="commerce-overview-grid"><DemoSalesChart orders={orders}/><section className="commerce-sheet"><div className="commerce-toolbar"><h2 className="dashboard-heading">Store readiness</h2><Link className="dashboard-link" to="/inventory">View products</Link></div><dl className="grid gap-4 text-sm">{electronicsCategories.map(category=><div className="flex justify-between gap-3" key={category.id}><dt>{category.name}</dt><dd className="tabular-nums">{products.filter(product=>product.category===category.id).length}</dd></div>)}<div className="flex justify-between gap-3 border-t border-divider pt-4"><dt>Stock not set</dt><dd className="tabular-nums">{unknown}</dd></div><div className="flex justify-between gap-3"><dt>Suppliers</dt><dd>{suppliers.length}</dd></div><div className="flex justify-between gap-3"><dt>Store branches</dt><dd>{stores.length}</dd></div></dl><p className="commerce-note mt-4">Unknown stock stays unknown. Demo orders do not confirm real availability or delivery.</p></section></div>
  <section className="commerce-sheet mt-5"><header className="commerce-toolbar"><h2 className="dashboard-heading">Recent customer orders</h2><Link className="dashboard-link" to="/orders">View all {orders.length} orders</Link></header><table className="commerce-table"><thead><tr><th>Order / customer</th><th>Fulfillment</th><th className="num">Demo total</th><th>Action</th></tr></thead><tbody>{visible.map(order=><tr key={order.id}><td><strong className="font-medium">{order.id.slice(0,8)}</strong><small className="mt-1 block text-muted">{order.customerName||order.customerEmail}</small></td><td data-label="Status">{statusLabels[order.status]}</td><td data-label="Total" className="num">{formatMoney(order.subtotal)}</td><td><Link className="dashboard-link" to={`/orders?order=${order.id}`}>Review order</Link></td></tr>)}</tbody></table>{!visible.length&&<p className="commerce-note py-4">{orders.length?'No orders match your search.':'Customer demo orders will appear here after checkout.'}</p>}</section>
 </CommerceLayout>
}
