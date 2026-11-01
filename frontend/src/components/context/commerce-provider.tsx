import {useEffect,useReducer,useState,type ReactNode} from 'react'
import {CommerceContext} from './commerce-context'
import {loadAdminCatalog,saveAdminProduct} from '@/services/admin-catalog'
import type {AdminCatalogProduct} from '@/data/admin-catalog'
import WorkspaceLoading from '@/components/common/workspace-loading'
import {loadCustomerOrders,advanceOrder,cancelCustomerOrder} from '@/services/customer-orders'
import type {CustomerOrder} from '@/data/customer-orders'
import {useStorefront} from './storefront-context'

export default function CommerceProvider({children}:{children:ReactNode}) {
  const {reloadCatalog}=useStorefront()
  const [products,setProducts]=useState<AdminCatalogProduct[]>([])
  const [orders,setOrders]=useState<CustomerOrder[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [revision,refresh]=useReducer(value=>value+1,0)
  useEffect(()=>{
    const controller=new AbortController()
    Promise.all([loadAdminCatalog(controller.signal),loadCustomerOrders(controller.signal)]).then(([rows,customerOrders])=>{if(!controller.signal.aborted){setProducts(rows);setOrders(customerOrders);setError('');setLoading(false)}}).catch((reason:unknown)=>{if(!controller.signal.aborted){setError(reason instanceof Error?reason.message:'Unable to load store management.');setLoading(false)}})
    return()=>controller.abort()
  },[revision])
  if(loading)return <WorkspaceLoading/>
  if(error)return <main className="grid min-h-dvh place-items-center bg-workspace p-6"><div className="grid max-w-md gap-4"><p role="alert">{error}</p><button className="inventory-button" onClick={()=>{setError('');setLoading(true);refresh()}}>Try again</button></div></main>
  return <CommerceContext value={{products,orders,refresh,advanceOrder:async(id,status)=>{const order=await advanceOrder(id,status);setOrders(current=>current.map(row=>row.id===id?{...row,...order}:row))},cancelOrder:async id=>{const order=await cancelCustomerOrder(id);setOrders(current=>current.map(row=>row.id===id?{...row,...order}:row));reloadCatalog();refresh()},saveProduct:async(input,updating)=>{
    const row=await saveAdminProduct(input,updating)
    setProducts(current=>updating?current.map(product=>product.id===row.id?row:product):[...current,row])
    reloadCatalog()
  }}}>{children}</CommerceContext>
}
