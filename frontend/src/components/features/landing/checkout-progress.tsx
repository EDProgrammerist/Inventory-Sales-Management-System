import { MapPinIcon, TruckIcon, CreditCardIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { CheckoutStep } from '@/data/storefront-checkout'

export default function CheckoutProgress({ step='address' }: { step?: CheckoutStep }) {
  const current = ['address','shipping','payment'].indexOf(step)
  return <nav className="checkout-progress" aria-label="Checkout progress"><ol>{[
    { name:'Address', path:'address', icon:MapPinIcon }, { name:'Shipping', path:'shipping', icon:TruckIcon }, { name:'Payment', path:'payment', icon:CreditCardIcon },
  ].map(({ name, path, icon:Icon }, index) => {
    const content=<><span className="checkout-step-icon"><Icon size={19} weight="fill" /></span><span><small>Step {index + 1}</small><strong>{name}</strong>{index > current && <span className="sr-only">Upcoming step</span>}</span></>
    return <li key={name} aria-current={index===current?'step':undefined} className={index===current?'is-current':''}>{index<current?<Link className="checkout-step-content" to={`/checkout/${path}`}>{content}</Link>:<span className="checkout-step-content">{content}</span>}</li>
  })}</ol></nav>
}
