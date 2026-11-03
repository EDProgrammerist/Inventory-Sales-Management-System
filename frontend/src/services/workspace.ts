import type { InventoryProduct } from '@/data/inventory-demo'
import type { InventoryEvent, InventoryState } from '@/data/inventory-state'
import type { Supplier } from '@/data/suppliers-demo'
import type { Order } from '@/data/orders-demo'
import type { Store } from '@/data/stores-demo'
import { apiRequest } from './api'

export interface WorkspaceRecords {
  products: InventoryProduct
  suppliers: Supplier
  orders: Order
  stores: Store
}
export interface WorkspaceSnapshot extends InventoryState {
  suppliers: Supplier[]
  orders: Order[]
  stores: Store[]
}
export function emptyWorkspace(): WorkspaceSnapshot {
  return { products: [], events: [], suppliers: [], orders: [], stores: [] }
}
export async function loadWorkspace(signal?: AbortSignal): Promise<WorkspaceSnapshot> {
  const data = await apiRequest<WorkspaceSnapshot>('/workspace/v1', 'GET', undefined, signal)
  if (!data || !(['products', 'events', 'suppliers', 'orders', 'stores'] as const).every((key) => Array.isArray(data[key])))
    throw new Error('The data service returned an invalid response. Please try again.')
  return data
}
export async function saveWorkspaceRecord<K extends keyof WorkspaceRecords>(kind: K, record: WorkspaceRecords[K], updating = false): Promise<{ record: WorkspaceRecords[K]; events: InventoryEvent[] }> {
  return apiRequest<{record:WorkspaceRecords[K];events:InventoryEvent[]}>(`/workspace/v1/${kind}${updating ? `/${encodeURIComponent(record.id)}` : ''}`, updating ? 'PUT' : 'POST', record)
}
export async function deleteWorkspaceRecord(kind:keyof WorkspaceRecords,id:string){await apiRequest(`/workspace/v1/${kind}/${encodeURIComponent(id)}`,'DELETE')}
