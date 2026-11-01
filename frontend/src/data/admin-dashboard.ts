import type {AdminCatalogProduct} from './admin-catalog'
import {isActiveDemoOrder,type CustomerOrder} from './customer-orders'

export function dashboardStock(products:AdminCatalogProduct[],orders:CustomerOrder[]) {
 const known=products.filter(product=>product.stockQuantity!==null)
 const ranked=new Map<string,{id:string;name:string;variant:string;sold:number;stockQuantity:number|null;price:number}>()
 for(const order of orders.filter(isActiveDemoOrder))for(const line of order.items){
  const existing=ranked.get(line.productId)
  if(existing){existing.sold+=line.quantity;continue}
  const product=products.find(item=>item.id===line.productId)
  ranked.set(line.productId,{id:line.productId,name:product?.name??line.name,variant:product?.variant??line.variant,sold:line.quantity,stockQuantity:product?.stockQuantity??null,price:product?.price??line.unitPrice})
 }
 return {knownUnits:known.reduce((sum,product)=>sum+(product.stockQuantity??0),0),knownProducts:known.length,unknown:products.length-known.length,low:known.filter(product=>(product.stockQuantity??0)<=product.threshold),top:[...ranked.values()].sort((a,b)=>b.sold-a.sold||a.name.localeCompare(b.name))}
}

export function orderTrend(orders:CustomerOrder[],year:number) {
 const eligible=orders.filter(isActiveDemoOrder).filter(order=>new Date(order.createdAt).getFullYear()===year)
 return Array.from({length:12},(_,month)=>{
  const rows=eligible.filter(order=>new Date(order.createdAt).getMonth()===month)
  const units=(items:CustomerOrder[])=>items.reduce((sum,order)=>sum+order.items.reduce((total,item)=>total+item.quantity,0),0)
  return {month:new Intl.DateTimeFormat('en',{month:'short'}).format(new Date(year,month,1)),ordered:units(rows),delivered:units(rows.filter(order=>order.status==='delivered'))}
 })
}
