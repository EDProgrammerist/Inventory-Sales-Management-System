import {checkoutInput} from '@/schema/customer-order.schema'
import {reserveOrder} from '@/repositories/customer-order.repository'

export async function createOrder(userId:string,body:unknown){return reserveOrder(userId,checkoutInput.parse(body))}
