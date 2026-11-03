import {apiRequest} from './api'
import {decodeOrders,type FulfillmentStatus,buildDemoCheckout} from '@/data/customer-orders'

export async function placeDemoOrder(input:ReturnType<typeof buildDemoCheckout>){const data=await apiRequest('/orders/v1','POST',input);return decodeOrders({orders:[data?.order]})[0]}
export async function loadOwnOrders(signal?:AbortSignal){return decodeOrders(await apiRequest('/orders/v1/mine','GET',undefined,signal))}
export async function loadCustomerOrders(signal?:AbortSignal){return decodeOrders(await apiRequest('/orders/v1/admin','GET',undefined,signal))}
export async function advanceOrder(id:string,status:FulfillmentStatus){const data=await apiRequest(`/orders/v1/admin/${encodeURIComponent(id)}`,'PUT',{status});return decodeOrders({orders:[data?.order]})[0]}
export async function cancelCustomerOrder(id:string){const data=await apiRequest(`/orders/v1/${encodeURIComponent(id)}/cancel`,'POST');return decodeOrders({orders:[data?.order]})[0]}
export async function deleteCustomerOrder(id:string){await apiRequest(`/orders/v1/admin/${encodeURIComponent(id)}`,'DELETE')}
