import {useEffect,useReducer,useRef,useState,type ReactNode} from 'react'
import {CommerceContext} from './commerce-context'
import {loadAdminCatalog,saveAdminProduct,deleteAdminProduct} from '@/services/admin-catalog'
import type {AdminCatalogProduct,AdminProductInput} from '@/data/admin-catalog'
import WorkspaceLoading from '@/components/common/workspace-loading'
import {loadCustomerOrders,advanceOrder,cancelCustomerOrder,deleteCustomerOrder} from '@/services/customer-orders'
import type {CustomerOrder,FulfillmentStatus} from '@/data/customer-orders'
import {useStorefront} from './storefront-context'

export default function CommerceProvider({children}:{children:ReactNode}) {
  const {reloadCatalog}=useStorefront()
  const [products,setProducts]=useState<AdminCatalogProduct[]>([])
  const [orders,setOrders]=useState<CustomerOrder[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const loaded=useRef(false),pending=useRef(false)
  const [refreshing,setRefreshing]=useState(false)
  const [refreshMessage,setRefreshMessage]=useState('')
  const [refreshError,setRefreshError]=useState('')
  const [revision,requestRefresh]=useReducer(value=>value+1,0)
  function beginRefresh(){
    pending.current=true
    setRefreshing(true)
    setRefreshMessage('Refreshing store data…')
    setRefreshError('')
    requestRefresh()
  }
  function refresh(){if(!pending.current)beginRefresh()}

  useEffect(()=>{
    const controller=new AbortController()
    Promise.all([loadAdminCatalog(controller.signal),loadCustomerOrders(controller.signal)])
      .then(([rows,customerOrders])=>{
        if(controller.signal.aborted)return
        loaded.current=true
        setProducts(rows)
        setOrders(customerOrders)
        setError('')
        setLoading(false)
        pending.current=false
        setRefreshing(false)
        if(revision>0)setRefreshMessage('Store data is up to date.')
      })
      .catch((reason:unknown)=>{
        if(controller.signal.aborted)return
        const message=reason instanceof Error?reason.message:'Unable to load store management.'
        if(!loaded.current)setError(message)
        else {setRefreshError(message);setRefreshMessage('')}
        setLoading(false)
        pending.current=false
        setRefreshing(false)
      })
    return()=>controller.abort()
  },[revision])

  async function saveProduct(input:AdminProductInput,updating?:boolean){
    const row=await saveAdminProduct(input,updating)
    setProducts(current=>updating?current.map(product=>product.id===row.id?row:product):[...current,row])
    reloadCatalog()
    beginRefresh()
  }
  async function deleteProduct(id:string,version:number){
    await deleteAdminProduct(id,version)
    setProducts(current=>current.filter(row=>row.id!==id))
    reloadCatalog()
    beginRefresh()
  }
  async function deleteOrder(id:string){
    await deleteCustomerOrder(id)
    setOrders(current=>current.filter(row=>row.id!==id))
    beginRefresh()
  }
  async function updateOrder(id:string,status:FulfillmentStatus){
    const order=await advanceOrder(id,status)
    setOrders(current=>current.map(row=>row.id===id?{...row,...order}:row))
    beginRefresh()
  }
  async function cancelOrder(id:string){
    const order=await cancelCustomerOrder(id)
    setOrders(current=>current.map(row=>row.id===id?{...row,...order}:row))
    reloadCatalog()
    beginRefresh()
  }

  if(loading)return <WorkspaceLoading/>
  if(error)return <main className="grid min-h-dvh place-items-center bg-workspace p-6"><div className="grid max-w-md gap-4"><p role="alert">{error}</p><button className="inventory-button" onClick={()=>{setError('');setLoading(true);refresh()}}>Try again</button></div></main>
  return <CommerceContext value={{products,orders,refresh,refreshing,refreshMessage,refreshError,deleteProduct,deleteOrder,advanceOrder:updateOrder,cancelOrder,saveProduct}}>{children}</CommerceContext>
}
