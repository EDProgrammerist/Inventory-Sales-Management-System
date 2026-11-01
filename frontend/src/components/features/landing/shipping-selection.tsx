import { Link } from 'react-router'
import { useStorefront } from '@/components/context/storefront-context'
import CheckoutPrerequisites from './checkout-prerequisites'
import { cartSummary } from '@/data/storefront-cart'
import { checkoutPrerequisite, shippingMethods, todayDateKey, validateShipping } from '@/data/storefront-checkout'

export default function ShippingSelection() {
  const store=useStorefront()
  const address=store.addressState.addresses.find(item=>item.id===store.addressState.selectedId)
  const missing=checkoutPrerequisite(cartSummary(store.bag, store.products).quantity,address)
  const error=validateShipping(store.shipping)
  return <section className="checkout-section shipping-section" aria-labelledby="shipping-title">
    <h1 id="shipping-title">Shipment Method</h1>
    <p className="checkout-description">Preview a shipping preference. Rates and delivery dates are not confirmed.</p>
    <CheckoutPrerequisites />
    <fieldset className="shipping-options"><legend className="sr-only">Choose a shipment method</legend>{shippingMethods.map(method=><div className={`shipping-option ${store.shipping.method===method.id?'is-selected':''}`} key={method.id}>
      <label><input type="radio" name="shipping-method" value={method.id} checked={store.shipping.method===method.id} onChange={()=>store.setShipping({...store.shipping,method:method.id})} /><strong>{method.name}</strong><span>{method.description}</span></label>
      <div className="shipping-option-detail">{method.id==='scheduled' ? <><label htmlFor="shipping-date">Preferred date</label><input id="shipping-date" type="date" min={todayDateKey()} value={store.shipping.date} disabled={store.shipping.method!=='scheduled'} onChange={event=>store.setShipping({...store.shipping,date:event.target.value})} aria-invalid={store.shipping.method==='scheduled'&&Boolean(error)} aria-describedby="shipping-date-note" /></> : <><span>Not quoted</span><small>Delivery date not estimated</small></>}</div>
    </div>)}</fieldset>
    <p id="shipping-date-note" className={error?'shipping-date-error':'checkout-description'} role={error?'alert':undefined}>{error ?? 'A preferred date is a request, not a delivery booking.'}</p>
    <div className="address-navigation"><Link className="shop-button" to="/checkout/address">Back</Link>{!missing&&!error ? <Link className="shop-button shop-button-solid shipping-next" to="/checkout/payment">Next</Link> : <button className="shop-button shop-button-solid shipping-next" disabled>Next</button>}</div>
    <p className="address-next-note">Preview only. No shipment is booked or charged.</p>
  </section>
}
