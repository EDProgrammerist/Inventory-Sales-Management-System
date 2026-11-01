import { normalizeAddress, validateAddress, type StoreAddress } from '@/data/storefront-address'

export interface AddressState { addresses: StoreAddress[]; selectedId: string | null }
export const emptyAddressState: AddressState = { addresses:[], selectedId:null }
type AddressAction = { type:'save'; address:StoreAddress } | { type:'select' | 'remove'; id:string } | {type:'reset'}

export function addressReducer(state: AddressState, action: AddressAction): AddressState {
  if(action.type==='reset')return emptyAddressState
  if (action.type === 'save') {
    if (!action.address.id || Object.keys(validateAddress(action.address)).length) return state
    const address = { ...normalizeAddress(action.address), id:action.address.id }
    const exists = state.addresses.some(item => item.id === address.id)
    return { addresses:exists ? state.addresses.map(item => item.id === address.id ? address : item) : [...state.addresses,address], selectedId:address.id }
  }
  if (!state.addresses.some(item => item.id === action.id)) return state
  if (action.type === 'select') return { ...state, selectedId:action.id }
  const addresses = state.addresses.filter(item => item.id !== action.id)
  return { addresses, selectedId:state.selectedId === action.id ? addresses[0]?.id ?? null : state.selectedId }
}
