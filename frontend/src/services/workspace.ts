import type { InventoryProduct } from '@/data/inventory-demo'
import type { InventoryEvent, InventoryState } from '@/data/inventory-state'
import type { Supplier } from '@/data/suppliers-demo'
import type { Order } from '@/data/orders-demo'
import type { Store } from '@/data/stores-demo'
import { getCsrfToken, getSession } from './auth'

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
const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

async function request(path: string, method: string, body?: unknown, signal?: AbortSignal, retry = true) {
  if (!base) throw new Error('The data service is unavailable. Please check the API configuration.')
  const headers: Record<string, string> = {}
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json'
    headers['x-csrf-token'] = await getCsrfToken()
  }
  let response: Response
  try {
    response = await fetch(`${base}/workspace/v1${path}`, {
      method, headers, credentials: 'include',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Unable to reach the data service. Your changes have not been confirmed saved. Please try again.', { cause: error })
  }
  if (response.status === 401 && retry) {
    if (await getSession()) return request(path, method, body, signal, false)
  }
  const result = await response.json()
  if (!response.ok) throw new Error(response.status === 401 ? 'Your session has expired. Please sign in again.' : result.message ?? 'Unable to save your changes. Please try again.')
  return result.data
}
export async function loadWorkspace(signal?: AbortSignal): Promise<WorkspaceSnapshot> {
  const data = await request('', 'GET', undefined, signal)
  if (!data || !['products', 'events', 'suppliers', 'orders', 'stores'].every((key) => Array.isArray(data[key])))
    throw new Error('The data service returned an invalid response. Please try again.')
  return data
}
export async function saveWorkspaceRecord<K extends keyof WorkspaceRecords>(kind: K, record: WorkspaceRecords[K], updating = false): Promise<{ record: WorkspaceRecords[K]; events: InventoryEvent[] }> {
  return request(`/${kind}${updating ? `/${encodeURIComponent(record.id)}` : ''}`, updating ? 'PUT' : 'POST', record)
}
