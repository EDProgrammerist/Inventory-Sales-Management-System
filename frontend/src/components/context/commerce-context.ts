import {createContext,useContext} from 'react'
import type {AdminCatalogProduct,AdminProductInput} from '@/data/admin-catalog'
import type {CustomerOrder,FulfillmentStatus} from '@/data/customer-orders'

export interface CommerceState {
  products:AdminCatalogProduct[]
  orders:CustomerOrder[]
  advanceOrder:(id:string,status:FulfillmentStatus)=>Promise<void>
  cancelOrder:(id:string)=>Promise<void>
  saveProduct:(input:AdminProductInput,updating?:boolean)=>Promise<void>
  refresh:()=>void
  refreshing:boolean
  refreshMessage:string
  refreshError:string
  deleteProduct:(id:string,expectedVersion:number)=>Promise<void>
  deleteOrder:(id:string)=>Promise<void>
}
export const CommerceContext=createContext<CommerceState|null>(null)
export function useCommerce(){const context=useContext(CommerceContext);if(!context)throw new Error('CommerceProvider is required');return context}
