import type { StoreAddress } from './storefront-address'

export type CheckoutStep = 'address' | 'shipping' | 'payment'
export type ShippingMethod = 'standard' | 'express' | 'scheduled'
export interface ShippingSelection { method: ShippingMethod; date: string }
export const initialShipping: ShippingSelection = { method:'standard', date:'' }
export const shippingMethods = [
  { id:'standard', name:'Standard', description:'Regular shipment preference' },
  { id:'express', name:'Express', description:'Priority shipment preference' },
  { id:'scheduled', name:'Schedule', description:'Choose a preferred delivery date' },
] as const

export function todayDateKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
}

export function validateShipping(selection: ShippingSelection, today=todayDateKey()): string | null {
  if (!shippingMethods.some(item=>item.id===selection.method)) return 'Choose a shipment method.'
  if (selection.method !== 'scheduled') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(selection.date)) return 'Choose a preferred delivery date.'
  const date = new Date(`${selection.date}T12:00:00`)
  if (!Number.isFinite(date.getTime()) || date.getFullYear()!==Number(selection.date.slice(0,4)) || date.getMonth()+1!==Number(selection.date.slice(5,7)) || date.getDate()!==Number(selection.date.slice(8,10))) return 'Choose a valid calendar date.'
  return selection.date < today ? 'Choose today or a future date.' : null
}

export function checkoutPrerequisite(quantity: number, address: Pick<StoreAddress,'id'> | null | undefined): 'cart' | 'address' | null {
  return quantity <= 0 ? 'cart' : !address ? 'address' : null
}

export function shippingDescription(selection: ShippingSelection) {
  const name = shippingMethods.find(item=>item.id===selection.method)?.name ?? 'Not selected'
  return selection.method === 'scheduled' && selection.date ? `${name} · ${selection.date} (preferred)` : name
}
