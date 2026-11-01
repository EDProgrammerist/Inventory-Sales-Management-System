import {useState,type FormEvent} from 'react'
import {Link,useNavigate} from 'react-router'
import {SimCardIcon,ContactlessPaymentIcon,CreditCardIcon} from '@phosphor-icons/react'
import {useStorefront} from '@/components/context/storefront-context'
import {useAuth} from '@/components/context/use-auth'
import {validateDemoCard,buildDemoCheckout,type DemoCard} from '@/data/customer-orders'
import {checkoutPrerequisite,validateShipping} from '@/data/storefront-checkout'
import {cartSummary} from '@/data/storefront-cart'
import {placeDemoOrder} from '@/services/customer-orders'
import {checkoutAttempt} from '@/lib/checkout-attempt'

export default function PaymentOptions() {
  const store=useStorefront(),{user,loading}=useAuth(),navigate=useNavigate()
  const [card,setCard]=useState<DemoCard>({name:'',number:'',expiry:'',cvv:''})
  const [errors,setErrors]=useState<Partial<Record<keyof DemoCard,string>>>({}),[error,setError]=useState(''),[saving,setSaving]=useState(false)
  const address=store.addressState.addresses.find(item=>item.id===store.addressState.selectedId)
  const summary=cartSummary(store.bag,store.products)
  const missing=checkoutPrerequisite(summary.quantity,address)||validateShipping(store.shipping)
  function change(field:keyof DemoCard,value:string){setCard(current=>({...current,[field]:value}));setErrors(current=>({...current,[field]:undefined}))}
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(saving||!user||missing||!address)return
    const next=validateDemoCard(card);setErrors(next);setError('')
    const invalid=(Object.keys(next) as (keyof DemoCard)[])[0]
    if(invalid){document.getElementById(`demo-card-${invalid}`)?.focus();return}
    setSaving(true)
    try {
      const payload=buildDemoCheckout('',store.bag,store.products,address,store.shipping)
      const attempt=await checkoutAttempt(user.id,payload)
      payload.idempotencyKey=attempt.id
      const order=await placeDemoOrder(payload)
      store.completeOrder(order.id,Object.fromEntries(order.items.map(item=>[item.productId,item.quantity])))
      attempt.clear()
      store.reloadCatalog()
      setCard({name:'',number:'',expiry:'',cvv:''})
      navigate(`/account/orders?order=${order.id}`,{replace:true})
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to place your demo order.');setSaving(false)}
  }
  return <section className="payment-options" aria-labelledby="payment-title">
    <p className="checkout-description">Demo card payment. No real money is charged. Only the displayed test card is accepted; card details never leave this page.</p>
    <div className="payment-card-preview" aria-label="Demo card preview"><div className="payment-card-top"><SimCardIcon size={27} weight="fill"/><ContactlessPaymentIcon size={26}/><span>Demo only</span></div><p className="payment-card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 4242</p><div className="payment-card-bottom"><span>{card.name||'Demo cardholder'}</span><CreditCardIcon size={29}/></div></div>
    <p id="demo-card-help" className="checkout-description">Use <strong>4242 4242 4242 4242</strong>, a future expiry date, and CVV <strong>123</strong>. Do not enter a real card.</p>
    <form onSubmit={submit} aria-busy={saving}>
      <fieldset className="payment-card-fields" disabled={saving} aria-describedby="demo-card-help"><legend className="sr-only">Demo card details</legend>{(['name','number'] as const).map(field=><label key={field} htmlFor={`demo-card-${field}`}>{field==='name'?'Cardholder name':'Demo card number'}<input id={`demo-card-${field}`} value={card[field]} autoComplete="off" inputMode={field==='number'?'numeric':'text'} maxLength={field==='number'?19:80} placeholder={field==='name'?'Demo cardholder':'4242 4242 4242 4242'} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field]?`demo-error-${field}`:undefined} onChange={event=>change(field,event.target.value)}/>{errors[field]&&<span id={`demo-error-${field}`} role="alert">{errors[field]}</span>}</label>)}<div>{(['expiry','cvv'] as const).map(field=><label key={field} htmlFor={`demo-card-${field}`}>{field==='expiry'?'Expiration date':'Demo CVV'}<input id={`demo-card-${field}`} value={card[field]} autoComplete="off" inputMode="numeric" maxLength={field==='expiry'?5:3} placeholder={field==='expiry'?'MM/YY':'123'} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field]?`demo-error-${field}`:undefined} onChange={event=>change(field,event.target.value)}/>{errors[field]&&<span id={`demo-error-${field}`} role="alert">{errors[field]}</span>}</label>)}</div></fieldset>
      {!user&&!loading&&<p className="checkout-prerequisite mt-6"><Link to="/login" state={{from:'/checkout/payment'}}>Sign in</Link> or <Link to="/signup" state={{from:'/checkout/payment'}}>create an account</Link> to save your demo order.</p>}
      {error&&<p role="alert" className="checkout-prerequisite mt-6">{error} <Link to="/account/orders">Check My orders</Link> before retrying.</p>}
      <p id="demo-purchase-note" className="checkout-description mt-6">Placing an order saves a simulated payment and your order details. Shipping is a preference; no real delivery or charge is created.</p>
      <div className="address-navigation payment-navigation">{saving?<button type="button" className="shop-button" disabled>Back</button>:<Link className="shop-button" to="/checkout/shipping">Back</Link>}<button className="shop-button shop-button-solid" disabled={saving||loading||!user||Boolean(missing)} aria-describedby="demo-purchase-note">{saving?'Placing order…':'Place demo order'}</button></div>
    </form>
  </section>
}
