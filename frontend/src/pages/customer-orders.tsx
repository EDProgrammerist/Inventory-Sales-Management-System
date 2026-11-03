import {useEffect,useReducer,useState} from 'react'
import {Link,useNavigate,useSearchParams} from 'react-router'
import CheckoutFrame from '@/components/common/checkout-frame'
import {useStorefront} from '@/components/context/storefront-context'
import {useAuth} from '@/components/context/use-auth'
import {loadOwnOrders,cancelCustomerOrder} from '@/services/customer-orders'
import {statusLabels,type CustomerOrder} from '@/data/customer-orders'
import CustomerOrderDetails from '@/components/features/orders/customer-order-details'
import {formatMoney} from '@/data/currency'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function CustomerOrdersPage(){
 const {reloadCatalog}=useStorefront()
 const {user,logout}=useAuth(),navigate=useNavigate(),[params]=useSearchParams()
 const [orders,setOrders]=useState<CustomerOrder[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,refresh]=useReducer(value=>value+1,0),[signingOut,setSigningOut]=useState(false)
 useEffect(()=>{const controller=new AbortController();loadOwnOrders(controller.signal).then(rows=>{if(!controller.signal.aborted){setOrders(rows);setLoading(false);setError('')}}).catch((reason:unknown)=>{if(!controller.signal.aborted){setError(reason instanceof Error?reason.message:'Unable to load your orders.');setLoading(false)}});return()=>controller.abort()},[revision,user?.id])
 return <CheckoutFrame title="My orders"><section aria-labelledby="customer-orders-title"><header className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><h1 id="customer-orders-title" className="text-2xl font-semibold">My orders</h1><p className="mt-3 text-sm leading-7 text-muted">Your saved demo purchases. Payments are simulated; no real money is charged.</p></div><div className="flex flex-wrap gap-3"><button className="shop-button" disabled={loading} onClick={()=>{setLoading(true);setError('');refresh()}}>{loading?'Refreshing orders…':'Refresh orders'}</button><button className="shop-button" disabled={signingOut} onClick={async()=>{setSigningOut(true);try{await logout();navigate('/',{replace:true})}catch(reason){setError(reason instanceof Error?reason.message:'Unable to sign out.');setSigningOut(false)}}}>{signingOut?'Signing out…':'Sign out'}</button></div></header>
 {loading&&<p className="flex items-center gap-3" role="status"><LoadingSpinner/>Loading your orders…</p>}
 {error&&<p role="alert" className="checkout-prerequisite">{error}</p>}
 {!loading&&!error&&!orders.length&&<p className="checkout-prerequisite">No demo orders yet. <Link to="/products">Explore products</Link> to start shopping.</p>}
 <div className="grid gap-6">{orders.map(order=><article className="rounded-lg border border-divider p-5" key={order.id} aria-labelledby={`order-${order.id}`}><header className="mb-4 flex flex-wrap justify-between gap-3"><div><h2 id={`order-${order.id}`} className="font-semibold">Order {order.id.slice(0,8)}</h2><p className="mt-2 text-sm text-muted">{new Date(order.createdAt).toLocaleString('en-PH')} · {statusLabels[order.status]}</p></div><strong className="tabular-nums">{formatMoney(order.subtotal)}</strong></header>{params.get('order')===order.id&&<p className="mb-4 text-sm" role="status">Your demo order is saved. No real payment was taken.</p>}<details open={params.get('order')===order.id}><summary className="mb-4 min-h-11 cursor-pointer text-sm">View order details</summary><CustomerOrderDetails order={order} onCancel={async()=>{const updated=await cancelCustomerOrder(order.id);setOrders(current=>current.map(row=>row.id===updated.id?updated:row));reloadCatalog()}}/></details></article>)}</div>
 </section></CheckoutFrame>
}
