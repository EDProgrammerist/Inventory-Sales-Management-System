import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { PencilSimpleIcon, PlusIcon, XIcon, MapPinIcon } from '@phosphor-icons/react'
import AddressForm from './address-form'
import { useStorefront } from '@/components/context/storefront-context'
import type { AddressDraft, StoreAddress } from '@/data/storefront-address'
import { cartSummary } from '@/data/storefront-cart'

export default function AddressSelection() {
  const store = useStorefront()
  const { addresses, selectedId } = store.addressState
  const [editing, setEditing] = useState<StoreAddress | null | undefined>(undefined)
  const [notice, setNotice] = useState('')
  const returnFocus = useRef<HTMLElement | null>(null)
  function open(address: StoreAddress | null, trigger: HTMLElement) {
    returnFocus.current = trigger
    setEditing(address)
    requestAnimationFrame(() => { const field = document.getElementById('address-field-name'); field?.focus({ preventScroll:true }); field?.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'center' }) })
  }
  function close() { setEditing(undefined); requestAnimationFrame(() => { const target = returnFocus.current?.isConnected ? returnFocus.current : document.getElementById('address-add'); target?.focus({ preventScroll:true }) }) }
  function save(draft: AddressDraft) {
    store.saveAddress(draft, editing?.id)
    setEditing(undefined)
    setNotice(editing ? 'Address updated.' : 'Address added and selected.')
    requestAnimationFrame(() => document.getElementById('address-title')?.focus({ preventScroll:true }))
  }
  function remove(id: string) {
    store.removeAddress(id)
    if (editing?.id === id) setEditing(undefined)
    setNotice('Address removed.')
    requestAnimationFrame(() => document.getElementById('address-title')?.focus({ preventScroll:true }))
  }
  return <section className="address-selection" aria-labelledby="address-title">
    <h1 id="address-title" tabIndex={-1}>Select Address</h1>
    <p className="address-session-note">Add your own address. Details stay in this browsing session and reset on reload.</p>
    <p className="sr-only" role="status" aria-live="polite">{notice}</p>
    {addresses.length ? <fieldset className="address-options"><legend className="sr-only">Choose your address</legend>{addresses.map(address => <div className="address-card" key={address.id} data-reveal>
      <label><input type="radio" name="delivery-address" value={address.id} checked={selectedId === address.id} onChange={() => store.selectAddress(address.id)} /><div className="address-card-content"><div className="address-card-title"><span>{address.name}</span><strong>{address.type}</strong></div><p>{address.address}</p><p>{address.phone}</p></div></label>
      <div className="address-card-actions"><button className="shop-icon" aria-label={`Edit ${address.name}`} onClick={event => open(address,event.currentTarget)}><PencilSimpleIcon size={23} /></button><button className="shop-icon" aria-label={`Remove ${address.name}`} onClick={() => remove(address.id)}><XIcon size={23} /></button></div>
    </div>)}</fieldset> : <div className="address-empty"><MapPinIcon size={36} weight="light" /><h2>No addresses yet</h2><p>Add a home, office, or another address to try this step.</p></div>}
    {editing === undefined ? <div className="address-add-divider"><button id="address-add" onClick={event => open(null,event.currentTarget)}><span><PlusIcon size={17} weight="bold" /></span>Add New Address</button></div> : <AddressForm key={editing?.id ?? 'new'} initial={editing ?? undefined} onSave={save} onCancel={close} />}
    <div className="address-navigation"><Link className="shop-button" to="/cart">Back</Link>{selectedId&&cartSummary(store.bag, store.products).quantity>0&&editing===undefined ? <Link className="shop-button shop-button-solid address-next" to="/checkout/shipping">Next</Link> : <button className="shop-button shop-button-solid address-next" disabled aria-describedby="address-next-note">Next</button>}</div>
    <p id="address-next-note" className="address-next-note">{!selectedId?'Select an address to continue. ':''}{cartSummary(store.bag, store.products).quantity===0?'Add a product to your cart to continue. ':''}Preview only. No order is placed at this step.</p>
  </section>
}
