import {and,asc,desc,eq,inArray,isNull,sql} from 'drizzle-orm'
import {createHash} from 'node:crypto'
import {getDatabase} from '@/db'
import {catalogProducts,customerOrders,users} from '@/db/schema'
import {ApiError} from '@/lib/api-error'
import {quoteOrder,canTransition,type CheckoutInput} from '@/schema/customer-order.schema'

type Database=Pick<ReturnType<typeof getDatabase>,'transaction'>
export async function reserveOrder(userId:string,input:CheckoutInput,database:Database=getDatabase()) {
  const requestHash=createHash('sha256').update(JSON.stringify({...input,lines:[...input.lines].sort((a,b)=>a.productId.localeCompare(b.productId))})).digest('hex')
  return database.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${userId}:${input.idempotencyKey}`},0))`)
    const [existing]=await tx.select().from(customerOrders).where(and(eq(customerOrders.userId,userId),eq(customerOrders.idempotencyKey,input.idempotencyKey)))
    if(existing){if(existing.deletedAt)throw new ApiError(409,'This checkout attempt belongs to a deleted order. Start a new checkout.');if(existing.requestHash!==requestHash)throw new ApiError(409,'This checkout attempt already contains a different order.');return existing}
    const rows=await tx.select().from(catalogProducts).where(inArray(catalogProducts.id,input.lines.map(line=>line.productId))).orderBy(asc(catalogProducts.id)).for('update')
    const quote=quoteOrder(input,rows)
    for(const line of quote.items)if(line.stockReserved)await tx.update(catalogProducts).set({stockQuantity:sql`${catalogProducts.stockQuantity}-${line.quantity}`,version:sql`${catalogProducts.version}+1`}).where(eq(catalogProducts.id,line.productId))
    return (await tx.insert(customerOrders).values({userId,idempotencyKey:input.idempotencyKey,requestHash,items:quote.items,subtotal:quote.subtotal,address:input.address,shipping:input.shipping,paidAt:new Date().toISOString()}).returning())[0]
  })
}
export async function ownOrders(userId:string,database:Pick<ReturnType<typeof getDatabase>,'select'>=getDatabase()){return database.select().from(customerOrders).where(and(eq(customerOrders.userId,userId),isNull(customerOrders.deletedAt))).orderBy(desc(customerOrders.createdAt))}
export async function adminOrders(database:Pick<ReturnType<typeof getDatabase>,'select'>=getDatabase()){return database.select({order:customerOrders,customerName:users.name,customerEmail:users.email}).from(customerOrders).innerJoin(users,eq(customerOrders.userId,users.id)).where(isNull(customerOrders.deletedAt)).orderBy(desc(customerOrders.createdAt))}
export async function deleteCancelledOrder(id:string,database:Database=getDatabase()) {
  return database.transaction(async tx=>{
    const [order]=await tx.select().from(customerOrders).where(and(eq(customerOrders.id,id),isNull(customerOrders.deletedAt))).for('update')
    if(!order)throw new ApiError(404,'Order not found')
    if(order.status!=='cancelled'||order.stockReserved)throw new ApiError(409,'Only cancelled orders with released stock can be deleted. Active and delivered order history is protected.')
    await tx.update(customerOrders).set({deletedAt:new Date().toISOString()}).where(eq(customerOrders.id,id))
  })
}
export async function cancelDemoOrder(id:string,userId?:string,database:Database=getDatabase()) {
  return database.transaction(async tx=>{
    const [order]=await tx.select().from(customerOrders).where(userId?and(eq(customerOrders.id,id),eq(customerOrders.userId,userId)):eq(customerOrders.id,id)).for('update')
    if(!order||order.deletedAt)throw new ApiError(404,'Order not found')
    if(order.status==='cancelled')return order
    if(order.status==='shipped'||order.status==='delivered')throw new ApiError(409,'Shipped or delivered demo orders cannot be cancelled.')
    if(order.stockReserved){
      const reserved=order.items.filter(item=>item.stockReserved)
      if(reserved.length){
        await tx.select().from(catalogProducts).where(inArray(catalogProducts.id,reserved.map(item=>item.productId))).orderBy(asc(catalogProducts.id)).for('update')
        for(const item of reserved)await tx.update(catalogProducts).set({stockQuantity:sql`${catalogProducts.stockQuantity}+${item.quantity}`,version:sql`${catalogProducts.version}+1`}).where(eq(catalogProducts.id,item.productId))
      }
    }
    return (await tx.update(customerOrders).set({stockReserved:false,status:'cancelled',paymentState:'cancelled'}).where(eq(customerOrders.id,id)).returning())[0]
  })
}
export async function updateFulfillment(id:string,status:string,database:Database=getDatabase()) {
  return database.transaction(async tx=>{
    const [order]=await tx.select().from(customerOrders).where(eq(customerOrders.id,id)).for('update')
    if(!order||order.deletedAt)throw new ApiError(404,'Order not found')
    if(!canTransition(order.status,status,order.paymentState==='demo_paid'))throw new ApiError(409,'Choose the next fulfillment step for an active demo order.')
    return (await tx.update(customerOrders).set({status:status as typeof customerOrders.$inferSelect['status']}).where(eq(customerOrders.id,id)).returning())[0]
  })
}
