import type {CatalogProduct} from './storefront-catalog'
import type {ShippingSelection} from './storefront-checkout'
import {cartSummary} from './storefront-cart'

export type FulfillmentStatus='pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'
export interface OrderAddress {name:string;address:string;phone:string}
export interface CustomerOrder {
  id:string
  items:{productId:string;name:string;variant:string;category?:'phones'|'computers'|'consoles';quantity:number;unitPrice:number;total:number;stockReserved:boolean}[]
  address:OrderAddress
  shipping:ShippingSelection
  subtotal:number
  status:FulfillmentStatus
  paymentState:'demo_paid'|'cancelled'
  paymentMode:'demo'
  paidAt:string|null
  createdAt:string
  customerName?:string|null
  customerEmail?:string
}
export const statusLabels:Record<FulfillmentStatus,string>={pending:'Pending confirmation',confirmed:'Confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'}
export const nextStatus:Partial<Record<FulfillmentStatus,FulfillmentStatus>>={pending:'confirmed',confirmed:'processing',processing:'shipped',shipped:'delivered'}
export interface DemoCard {name:string;number:string;expiry:string;cvv:string}
export function validateDemoCard(card:DemoCard,now=new Date()) {
  const errors:Partial<Record<keyof DemoCard,string>>={}
  if(!card.name.trim()||card.name.trim().length>80)errors.name='Enter a demo cardholder name of up to 80 characters.'
  if(card.number.replace(/\s/g,'')!=='4242424242424242')errors.number='Use only the demo number 4242 4242 4242 4242.'
  const match=/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(card.expiry)
  if(!match||2000+Number(match[2])<now.getFullYear()||(2000+Number(match[2])===now.getFullYear()&&Number(match[1])<now.getMonth()+1))errors.expiry='Enter a current or future month as MM/YY.'
  if(card.cvv!=='123')errors.cvv='Use demo CVV 123.'
  return errors
}
export function buildDemoCheckout(idempotencyKey:string,bag:Record<string,number>,products:CatalogProduct[],address:OrderAddress,shipping:ShippingSelection) {
  return {idempotencyKey,paymentMethod:'demo-card' as const,lines:cartSummary(bag,products).items.map(({product,quantity})=>({productId:product.id,quantity,unitPrice:product.price})),address:{name:address.name,address:address.address,phone:address.phone},shipping}
}
export function decodeOrders(data:unknown):CustomerOrder[] {
  const invalid=()=>new Error('The order service returned invalid data. Please try again.')
  if(!data||typeof data!=='object'||!('orders' in data)||!Array.isArray(data.orders))throw invalid()
  return data.orders.map((value:unknown)=>{
    if(!value||typeof value!=='object')throw invalid()
    const row=value as CustomerOrder
    if(typeof row.id!=='string'||!row.id||!Array.isArray(row.items)||!row.items.length||!Object.hasOwn(statusLabels,row.status)||!['demo_paid','cancelled'].includes(row.paymentState)||row.paymentMode!=='demo'||typeof row.subtotal!=='number'||!Number.isFinite(row.subtotal)||typeof row.createdAt!=='string'||!Number.isFinite(Date.parse(row.createdAt)))throw invalid()
    if(!row.address||!['name','address','phone'].every(key=>typeof row.address[key as keyof OrderAddress]==='string')||!row.shipping||!['standard','express','scheduled'].includes(row.shipping.method))throw invalid()
    let cents=0
    for(const item of row.items){if(typeof item.productId!=='string'||typeof item.name!=='string'||typeof item.variant!=='string'||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>9||typeof item.unitPrice!=='number'||!Number.isFinite(item.unitPrice)||item.unitPrice<=0||Math.round(item.total*100)!==Math.round(item.unitPrice*100)*item.quantity)throw invalid();cents+=Math.round(item.total*100)}
    if(cents!==Math.round(row.subtotal*100))throw invalid()
    return row
  })
}
export function commerceMetrics(products:Pick<CatalogProduct,'id'>[],orders:Pick<CustomerOrder,'paymentMode'|'paymentState'|'status'|'subtotal'>[]) {
  const sales=orders.filter(order=>order.paymentMode==='demo'&&order.paymentState==='demo_paid'&&order.status!=='cancelled')
  return {products:products.length,demoSales:sales.reduce((total,order)=>total+Math.round(order.subtotal*100),0)/100,demoOrders:sales.length,pending:orders.filter(order=>order.status==='pending').length,cancelled:orders.filter(order=>order.status==='cancelled').length}
}
export function monthlyDemoSales(orders:CustomerOrder[],year=new Date().getFullYear()) {
  return Array.from({length:12},(_,month)=>({label:new Intl.DateTimeFormat('en',{month:'short'}).format(new Date(year,month,1)),value:orders.filter(order=>order.paymentMode==='demo'&&order.paymentState==='demo_paid'&&order.status!=='cancelled'&&order.paidAt&&new Date(order.paidAt).getFullYear()===year&&new Date(order.paidAt).getMonth()===month).reduce((total,order)=>total+Math.round(order.subtotal*100),0)/100}))
}
