import { useEffect, useReducer, useState, useRef, type ReactNode } from 'react'
import { StorefrontContext } from './storefront-context'
import type { CatalogProduct } from '@/data/storefront-catalog'
import { loadCatalog } from '@/services/catalog'
import { normalizeCartQuantity } from '@/data/storefront-cart'
import { addressReducer, emptyAddressState } from './storefront-address-state'
import { initialShipping } from '@/data/storefront-checkout'
import {useAuth} from './use-auth'

export default function StorefrontProvider({ children }: { children: ReactNode }) {
  const [catalog,setCatalog] = useState<{products:CatalogProduct[];loading:boolean;error:string|null}>({products:[],loading:true,error:null})
  const [revision,reload] = useReducer(value=>value+1,0)
  useEffect(() => {
    const controller = new AbortController()
    loadCatalog(controller.signal).then(products => {
      if (!controller.signal.aborted) setCatalog({products,loading:false,error:null})
    }).catch((error:unknown) => {
      if (!controller.signal.aborted) setCatalog({products:[],loading:false,error:error instanceof Error?error.message:'Unable to load products. Please try again.'})
    })
    return () => controller.abort()
  }, [revision])
  function reloadCatalog() {
    setCatalog(current=>({...current,loading:true,error:null}))
    reload()
  }
  const [saved, setSaved] = useState<string[]>([])
  const [bag, setBag] = useState<Record<string, number>>({})
  const [notice, setNotice] = useState('')
  const [addressState, dispatchAddress] = useReducer(addressReducer, emptyAddressState)
  const [shipping, setShipping] = useState(initialShipping)
  const completedOrders=useRef(new Set<string>())
  const {user}=useAuth()
  const [owner,setOwner]=useState(user?.id??null)
  if(owner!==(user?.id??null)){
    setOwner(user?.id??null)
    if(owner!==null){setSaved([]);setBag({});dispatchAddress({type:'reset'});setShipping(initialShipping)}
  }
  function toggleSaved(id: string) {
    setSaved(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }
  function addToBag(id: string) {
    if (!catalog.products.some(product => product.id === id)) return
    setBag(current => ({ ...current, [id]: Math.min(9, (current[id] ?? 0) + 1) }))
    setNotice('Product added to your display cart.')
  }
  return <StorefrontContext value={{
    products:catalog.products,catalogLoading:catalog.loading,catalogError:catalog.error,reloadCatalog,
    completeOrder:(orderId,quantities)=>{if(completedOrders.current.has(orderId))return;completedOrders.current.add(orderId);setBag(current=>Object.fromEntries(Object.entries(current).map(([id,quantity])=>[id,Math.max(0,quantity-(quantities[id]??0))]).filter(([,quantity])=>Number(quantity)>0)))},
    saved, bag, notice, toggleSaved, addToBag, addressState, shipping, setShipping,
    saveAddress: (draft, id) => dispatchAddress({ type:'save', address:{ ...draft,id:id ?? crypto.randomUUID() } }),
    removeAddress: id => dispatchAddress({ type:'remove', id }),
    selectAddress: id => dispatchAddress({ type:'select', id }),
    setQuantity: (id, quantity) => {
      const next = normalizeCartQuantity(quantity)
      if (next === null || !catalog.products.some(product => product.id === id)) return
      setBag(current => ({ ...current, [id]: next }))
    },
  }}>{children}</StorefrontContext>
}
