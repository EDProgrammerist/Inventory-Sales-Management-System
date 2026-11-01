import {useState} from 'react'
import {Link,useSearchParams} from 'react-router'
import CommerceLayout from '@/components/common/commerce-layout'
import {useCommerce} from '@/components/context/commerce-context'
import {statusLabels,nextStatus,type FulfillmentStatus} from '@/data/customer-orders'
import {formatMoney} from '@/data/currency'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import CustomerOrderDetails from '@/components/features/orders/customer-order-details'

const actionLabels:Record<string,string>={confirmed:'Confirm order',processing:'Start processing',shipped:'Mark shipped',delivered:'Mark delivered'}
export default function AdminOrdersPage(){
 const {orders,advanceOrder,cancelOrder,refresh}=useCommerce(),[params,setParams]=useSearchParams(),[query,setQuery]=useState(''),[status,setStatus]=useState('all'),[saving,setSaving]=useState(false),[error,setError]=useState('')
 const selected=orders.find(order=>order.id===params.get('order'))
 const rows=orders.filter(order=>(status==='all'||order.status===status)&&`${order.id} ${order.customerName??''} ${order.customerEmail??''} ${order.items.map(item=>item.name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))
 const next=selected?nextStatus[selected.status]:undefined
 async function advance(){if(!selected||!next||saving)return;setSaving(true);setError('');try{await advanceOrder(selected.id,next)}catch(reason){setError(reason instanceof Error?reason.message:'Unable to update order.')}finally{setSaving(false)}}
 return <CommerceLayout title="Customer orders" query={query} onQueryChange={setQuery}>
  <div className="commerce-toolbar"><p>{rows.length} of {orders.length} customer orders · Simulated payments only.</p><div className="flex flex-wrap gap-3"><button className="inventory-button" onClick={refresh}>Refresh orders</button><Link className="dashboard-link" to="/">Open storefront</Link></div></div>
  <section className="commerce-sheet"><header className="commerce-toolbar"><h2 className="dashboard-heading">Customer orders</h2><label className="text-sm">Status <select className="ml-2 min-h-11 rounded border border-control bg-surface px-2" value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All orders</option>{Object.entries(statusLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label></header>
  <table className="commerce-table"><thead><tr><th>Customer / order</th><th>Status</th><th className="num">Demo total</th><th>Action</th></tr></thead><tbody>{rows.map(order=><tr key={order.id}><td><strong className="font-medium">{order.customerName||order.customerEmail}</strong><small className="mt-1 block text-muted">{order.customerEmail} · {order.id.slice(0,8)} · {new Date(order.createdAt).toLocaleDateString('en-PH')}</small></td><td data-label="Status">{statusLabels[order.status as FulfillmentStatus]}</td><td className="num" data-label="Total">{formatMoney(order.subtotal)}</td><td><button className="dashboard-link" onClick={()=>{setParams({order:order.id});setError('')}}>Review order</button></td></tr>)}</tbody></table>{!rows.length&&<p className="commerce-note py-6">{orders.length?'No orders match these filters.':'No customer orders yet. Demo purchases placed through the store will appear here.'}</p>}</section>
  {selected&&<DashboardDialog title={`Order ${selected.id.slice(0,8)}`} onClose={()=>setParams({})}><CustomerOrderDetails key={selected.id} order={selected} onCancel={()=>cancelOrder(selected.id)}/>{error&&<p role="alert" className="commerce-error mt-4">{error}</p>}{next&&<div className="commerce-actions mt-5"><button className="inventory-button commerce-primary" disabled={saving} onClick={advance}>{saving?'Saving…':actionLabels[next]}</button></div>}</DashboardDialog>}
 </CommerceLayout>
}
