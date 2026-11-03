import CommerceRefresh from '@/components/common/commerce-refresh'
import {useState} from 'react'
import {Link} from 'react-router'
import {PackageIcon} from '@phosphor-icons/react'
import CommerceLayout from '@/components/common/commerce-layout'
import {useCommerce} from '@/components/context/commerce-context'
import {useWorkspace} from '@/components/context/workspace-context'
import {commerceMetrics,statusLabels} from '@/data/customer-orders'
import {dashboardStock} from '@/data/admin-dashboard'
import {formatMoney} from '@/data/currency'
import {OverviewCard,SummaryCard} from '@/components/features/dashboard/dashboard-overviews'
import DemoSalesChart from '@/components/features/orders/demo-sales-chart'
import CustomerOrderChart from '@/components/features/dashboard/customer-order-chart'

export default function AdminDashboardPage(){
 const {products,orders}=useCommerce(),{suppliers}=useWorkspace(),[query,setQuery]=useState('')
 const metrics=commerceMetrics(products,orders),stock=dashboardStock(products,orders)
 const matches=(name:string)=>name.toLowerCase().includes(query.trim().toLowerCase())
 const top=stock.top.filter(item=>matches(`${item.name} ${item.variant}`)).slice(0,4),low=stock.low.filter(item=>matches(`${item.name} ${item.variant}`)).slice(0,4)
 const recent=orders.filter(order=>matches(`${order.id} ${order.customerName??''} ${order.customerEmail??''} ${order.items.map(item=>item.name).join(' ')}`)).slice(0,4)
 const count=(status:string)=>orders.filter(order=>order.status===status).length
 return <CommerceLayout title="Dashboard" query={query} onQueryChange={setQuery}>
  <div className="commerce-toolbar"><p>Store activity from saved customer orders. Payments are simulated.</p><div className="flex flex-wrap gap-3"><CommerceRefresh label="Refresh data"/><Link className="inventory-button commerce-primary" to="/inventory">Manage products</Link></div></div>
  <div className="reference-dashboard-grid">
   <OverviewCard title="Sales Overview" kind="sales" items={[{label:'Sales (demo)',value:formatMoney(metrics.demoSales),icon:'Sales'},{label:'Orders',value:String(metrics.demoOrders),icon:'Revenue'},{label:'Delivered',value:String(count('delivered')),icon:'Return'},{label:'Cancelled',value:String(metrics.cancelled),icon:'Cancel'}]} note="Simulated sales exclude cancelled orders; real payments, costs and profit are not recorded."/>
   <SummaryCard kind="inventory" items={[{label:'Quantity in Hand',value:stock.knownProducts?stock.knownUnits.toLocaleString('en-PH'):'Not set'},{label:'Stock not set',value:String(stock.unknown),icon:'To be received'}]} note="Quantity in hand includes known stock only. Unknown quantities stay unknown."/>
   <OverviewCard title="Order Overview" kind="purchase" items={[{label:'Pending',value:String(count('pending')),icon:'Purchase'},{label:'Confirmed',value:String(count('confirmed')),icon:'Cost'},{label:'Processing',value:String(count('processing')),icon:'Cancel'},{label:'Shipped',value:String(count('shipped')),icon:'Return'}]} note="Customer fulfillment status, connected to the store checkout."/>
   <SummaryCard kind="product" items={[{label:'Number of Suppliers',value:String(suppliers.length)},{label:'Number of Categories',value:String(new Set(products.map(product=>product.category)).size)}]} note={`${products.length} catalog products. Manage suppliers and products from the sidebar.`}/>
   <DemoSalesChart orders={orders}/>
   <CustomerOrderChart orders={orders}/>
   <section className="dashboard-card" aria-labelledby="top-selling-title"><header className="commerce-toolbar"><h2 id="top-selling-title" className="dashboard-heading">Top Selling Stock</h2><Link className="dashboard-link" to="/reports">See all</Link></header><table className="commerce-table"><thead><tr><th>Name</th><th className="num">Sold quantity</th><th className="num">Remaining quantity</th><th className="num">Price</th></tr></thead><tbody>{top.map(item=><tr key={item.id}><td><Link className="dashboard-link" to={`/inventory/${item.id}`}>{item.name}</Link><small className="mt-1 block text-muted">{item.variant}</small></td><td data-label="Sold" className="num">{item.sold}</td><td data-label="Remaining" className="num">{item.stockQuantity??'Not set'}</td><td data-label="Price" className="num">{formatMoney(item.price)}</td></tr>)}</tbody></table>{!top.length&&<p className="commerce-note py-6">{query?'No selling products match your search.':'Products appear here when a saved demo order includes them.'}</p>}</section>
   <section className="dashboard-card" aria-labelledby="low-stock-title"><header className="commerce-toolbar"><h2 id="low-stock-title" className="dashboard-heading">Low Quantity Stock</h2><Link className="dashboard-link" to="/inventory">See all</Link></header><ul className="divide-y divide-divider">{low.map(product=><li className="flex items-center gap-4 py-4" key={product.id}><img src={product.image} alt="" width="44" height="56" className="h-14 w-11 shrink-0 object-contain"/><div className="min-w-0 flex-1"><Link className="dashboard-link" to={`/inventory/${product.id}`}>{product.name}</Link><p className="mt-2 text-[13px] leading-6 text-muted">Remaining quantity: {product.stockQuantity} units</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-[13px] text-red-700">Low</span></li>)}</ul>{!low.length&&<div className="grid justify-items-center gap-3 py-6 text-center"><PackageIcon aria-hidden="true" size={30} className="text-muted"/><p className="commerce-note">{query?'No low-stock products match.':'No products with recorded stock need attention.'}</p></div>}<p className="commerce-note mt-3">{stock.unknown} products have stock not set and are excluded from alerts.</p></section>
  </div>
  <section className="commerce-sheet mt-5"><header className="commerce-toolbar"><h2 className="dashboard-heading">Recent customer orders</h2><Link className="dashboard-link" to="/orders">View all {orders.length} orders</Link></header><table className="commerce-table"><thead><tr><th>Order / customer</th><th>Fulfillment</th><th className="num">Demo total</th><th>Action</th></tr></thead><tbody>{recent.map(order=><tr key={order.id}><td><strong className="font-medium">{order.id.slice(0,8)}</strong><small className="mt-1 block text-muted">{order.customerName||order.customerEmail}</small></td><td data-label="Status">{statusLabels[order.status]}</td><td data-label="Total" className="num">{formatMoney(order.subtotal)}</td><td><Link className="dashboard-link" to={`/orders?order=${order.id}`}>Review order</Link></td></tr>)}</tbody></table>{!recent.length&&<p className="commerce-note py-4">{orders.length?'No orders match your search.':'Customer demo orders will appear here after checkout.'}</p>}</section>
 </CommerceLayout>
}
