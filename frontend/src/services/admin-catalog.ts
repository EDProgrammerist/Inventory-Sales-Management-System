import {apiRequest} from './api'
import {decodeAdminCatalog,type AdminProductInput} from '@/data/admin-catalog'

export async function loadAdminCatalog(signal?:AbortSignal) {
  return decodeAdminCatalog(await apiRequest('/catalog/v1/admin/products','GET',undefined,signal))
}
export async function saveAdminProduct(input:AdminProductInput,updating=false) {
  const data=await apiRequest(`/catalog/v1/admin/products${updating?`/${encodeURIComponent(input.id)}`:''}`,updating?'PUT':'POST',input)
  return decodeAdminCatalog({products:[data?.product]})[0]
}
export async function deleteAdminProduct(id:string,expectedVersion:number){await apiRequest(`/catalog/v1/admin/products/${encodeURIComponent(id)}`,'DELETE',{expectedVersion})}
