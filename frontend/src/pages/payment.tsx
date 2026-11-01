import CheckoutFrame from '@/components/common/checkout-frame'
import CheckoutPrerequisites from '@/components/features/landing/checkout-prerequisites'
import PaymentSummary from '@/components/features/landing/payment-summary'
import PaymentOptions from '@/components/features/landing/payment-options'
import { useStorefront } from '@/components/context/storefront-context'
import { validateShipping } from '@/data/storefront-checkout'
import { Link } from 'react-router'

export default function PaymentPage() {
  const store=useStorefront()
  const error=validateShipping(store.shipping)
  return <CheckoutFrame step="payment" title="Payment"><div className="checkout-section"><CheckoutPrerequisites />{error&&<p className="checkout-prerequisite">{error} <Link to="/checkout/shipping">Review shipping</Link></p>}<div className="payment-layout"><h1 id="payment-title" className="payment-page-title">Payment</h1><PaymentSummary /><PaymentOptions /></div></div></CheckoutFrame>
}
