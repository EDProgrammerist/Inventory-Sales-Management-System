import { Link } from 'react-router'
import { useStorefront } from '@/components/context/storefront-context'
import { cartSummary } from '@/data/storefront-cart'
import { checkoutPrerequisite } from '@/data/storefront-checkout'

export default function CheckoutPrerequisites() {
  const store=useStorefront()
  const address=store.addressState.addresses.find(item=>item.id===store.addressState.selectedId)
  const missing=checkoutPrerequisite(cartSummary(store.bag, store.products).quantity,address)
  if (!missing) return null
  return <p className="checkout-prerequisite" role="status">{missing==='cart' ? <>Add a product to your cart before continuing. <Link to="/products">Explore products</Link></> : <>Choose an address before continuing. <Link to="/checkout/address">Select an address</Link></>}</p>
}
