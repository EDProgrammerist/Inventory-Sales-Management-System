import type {RequestHandler} from 'express'
import {z} from 'zod'
import {createOrder} from '@/services/customer-orders/create-order-service'
import {ownOrders,adminOrders,updateFulfillment,cancelDemoOrder} from '@/repositories/customer-order.repository'
import {orderView} from '@/views/customer-order.view'
import {fulfillmentInput} from '@/schema/customer-order.schema'

export const create:RequestHandler=async(request,response)=>{const order=await createOrder(response.locals.user.id,request.body);response.status(201).json({status:'success',data:{order:orderView(order)}})}
export const mine:RequestHandler=async(_request,response)=>{response.set('Cache-Control','no-store').json({status:'success',data:{orders:(await ownOrders(response.locals.user.id)).map(orderView)}})}
export const list:RequestHandler=async(_request,response)=>{response.set('Cache-Control','no-store').json({status:'success',data:{orders:(await adminOrders()).map(row=>({...orderView(row.order),customerName:row.customerName,customerEmail:row.customerEmail}))}})}
export const update:RequestHandler=async(request,response)=>{const id=z.uuid().parse(request.params.id),input=fulfillmentInput.parse(request.body);response.json({status:'success',data:{order:orderView(await updateFulfillment(id,input.status))}})}
export const cancel:RequestHandler=async(request,response)=>{const id=z.uuid().parse(request.params.id);response.json({status:'success',data:{order:orderView(await cancelDemoOrder(id,response.locals.user.role==='ADMIN'?undefined:response.locals.user.id))}})}
