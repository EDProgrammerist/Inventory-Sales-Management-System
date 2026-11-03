import {useLayoutEffect,useRef,useState} from 'react'
import {formatMoney} from '@/data/currency'
import {statusLabels,type CustomerOrder} from '@/data/customer-orders'
import {shippingDescription} from '@/data/storefront-checkout'

export default function CustomerOrderDetails({order,onCancel}:{order:CustomerOrder;onCancel?:()=>Promise<void>}) {
  const [confirming,setConfirming]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('')
  const cancelButton=useRef<HTMLButtonElement>(null),keepButton=useRef<HTMLButtonElement>(null)
  const focusRequested=useRef(false)
  function changeConfirmation(next:boolean){focusRequested.current=true;setConfirming(next)}
  useLayoutEffect(()=>{
    if(!focusRequested.current)return
    const target=confirming?keepButton.current:cancelButton.current
    target?.focus()
    focusRequested.current=false
  },[confirming])
  async function cancel(){if(!onCancel||saving)return;setSaving(true);setError('');try{await onCancel();setConfirming(false)}catch(reason){setError(reason instanceof Error?reason.message:'Unable to cancel order.')}finally{setSaving(false)}}
  return <div className="grid gap-5 text-sm leading-7">
    <p><strong>{statusLabels[order.status]}</strong> · {order.paymentState==='demo_paid'?'Demo paid — no real charge':'Demo payment cancelled'}</p>
    <ul className="grid gap-3">{order.items.map(item=><li key={item.productId} className="flex flex-wrap justify-between gap-3 border-b border-divider pb-3"><span>{item.name} · {item.variant}<small className="block text-muted">Quantity {item.quantity} × {formatMoney(item.unitPrice)}{!item.stockReserved?' · Stock not recorded; demo purchase only':''}</small></span><strong className="tabular-nums">{formatMoney(item.total)}</strong></li>)}</ul>
    <p className="flex justify-between gap-3"><strong>Demo total</strong><strong className="tabular-nums">{formatMoney(order.subtotal)}</strong></p>
    <section><h3 className="font-medium">Delivery details</h3><p>{order.address.name}</p><p className="whitespace-pre-line break-words">{order.address.address}</p><p>{order.address.phone}</p><p className="mt-2 text-muted">{shippingDescription(order.shipping)} · No real delivery is booked.</p></section>
    {onCancel&&!['shipped','delivered','cancelled'].includes(order.status)&&<div>{confirming?<><p>Cancel this demo order? Any reserved stock will be restored.</p><div className="mt-3 flex flex-wrap gap-3"><button ref={keepButton} className="inventory-button" disabled={saving} onClick={()=>changeConfirmation(false)}>Keep order</button><button className="inventory-button" disabled={saving} onClick={cancel}>{saving?'Cancelling…':'Confirm cancellation'}</button></div></>:<button ref={cancelButton} className="inventory-button" onClick={()=>changeConfirmation(true)}>Cancel demo order</button>}</div>}
    {error&&<p role="alert">{error}</p>}
  </div>
}
