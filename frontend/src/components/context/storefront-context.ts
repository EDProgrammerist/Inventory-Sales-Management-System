import { createContext, useContext } from 'react'
import type { AddressState } from './storefront-address-state'
import type { AddressDraft } from '@/data/storefront-address'
import type { ShippingSelection } from '@/data/storefront-checkout'
import type { CatalogProduct } from '@/data/storefront-catalog'

export interface StorefrontState {
  products: CatalogProduct[]
  catalogLoading: boolean
  catalogError: string | null
  reloadCatalog: () => void
  completeOrder: (id:string,quantities:Record<string,number>) => void
  saved: string[]
  bag: Record<string, number>
  notice: string
  addressState: AddressState
  shipping: ShippingSelection
  setShipping: (selection: ShippingSelection) => void
  saveAddress: (draft: AddressDraft, id?: string) => void
  removeAddress: (id: string) => void
  selectAddress: (id: string) => void
  toggleSaved: (id: string) => void
  addToBag: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
}
export const StorefrontContext = createContext<StorefrontState | null>(null)
export function useStorefront() {
  const value = useContext(StorefrontContext)
  if (!value) throw new Error('StorefrontProvider is required')
  return value
}
