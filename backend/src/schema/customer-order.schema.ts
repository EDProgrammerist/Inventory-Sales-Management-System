import {z} from 'zod'
import {ApiError} from '@/lib/api-error'
import type {OrderLine} from '@/models/customer-order.model'

const phone=z.string().trim().max(32).regex(/^\+?[\d\s()-]+$/).refine(value=>{const length=value.replace(/\D/g,'').length;return length>=7&&length<=15})
export const checkoutInput=z.object({
  idempotencyKey:z.uuid(),
  paymentMethod:z.literal('demo-card'),
  lines:z.array(z.object({productId:z.string().regex(/^[a-z0-9-]{1,80}$/),quantity:z.number().int().min(1).max(9),unitPrice:z.number().positive().max(9999999999.99)}).strict()).min(1).max(100),
  address:z.object({name:z.string().trim().min(2).max(80),address:z.string().trim().min(8).max(300),phone}).strict(),
  shipping:z.object({method:z.enum(['standard','express','scheduled']),date:z.string().max(10)}).strict(),
}).strict().superRefine((value,context)=>{
  if(new Set(value.lines.map(line=>line.productId)).size!==value.lines.length)context.addIssue({code:'custom',message:'Duplicate product lines'})
  if(value.shipping.method==='scheduled'){
    const valid=z.iso.date().safeParse(value.shipping.date)
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
    if(!valid.success||value.shipping.date<today)context.addIssue({code:'custom',path:['shipping','date'],message:'Choose today or a future preferred date (Philippine time).'})
  }
})
export type CheckoutInput=z.infer<typeof checkoutInput>
export interface QuotableProduct {id:string;name:string;variant:string;category?:'phones'|'computers'|'consoles';price:string;published:boolean;stockQuantity:number|null}
export function quoteOrder(input:CheckoutInput,products:QuotableProduct[]) {
  let cents=0
  const items:OrderLine[]=input.lines.map(line=>{
    const product=products.find(row=>row.id===line.productId)
    if(!product?.published)throw new ApiError(409,'A product is no longer available. Refresh your cart.')
    const unitCents=Math.round(Number(product.price)*100)
    if(!Number.isSafeInteger(unitCents)||unitCents!==Math.round(line.unitPrice*100))throw new ApiError(409,'A product price changed. Refresh your cart before paying.')
    if(product.stockQuantity!==null&&product.stockQuantity<line.quantity)throw new ApiError(409,`There is insufficient available stock for ${product.name}.`)
    const lineCents=unitCents*line.quantity;cents+=lineCents
    return {productId:product.id,name:product.name,variant:product.variant,category:product.category,quantity:line.quantity,unitPrice:unitCents/100,total:lineCents/100,stockReserved:product.stockQuantity!==null}
  })
  if(!Number.isSafeInteger(cents)||cents<=0)throw new ApiError(400,'Invalid order total')
  return {items,subtotal:(cents/100).toFixed(2)}
}
const next:Record<string,string[]>={pending:['confirmed'],confirmed:['processing'],processing:['shipped'],shipped:['delivered'],delivered:[],cancelled:[]}
export function canTransition(from:string,to:string,paid:boolean){return paid&&Boolean(next[from]?.includes(to))}
export const fulfillmentInput=z.object({status:z.enum(['confirmed','processing','shipped','delivered'])}).strict()
