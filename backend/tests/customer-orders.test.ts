import assert from 'node:assert/strict'
import {test} from 'node:test'
import {checkoutInput,quoteOrder,canTransition} from '@/schema/customer-order.schema'

test('demo checkout rejects price tampering, insufficient stock, duplicate lines and card data',()=>{
 const input={idempotencyKey:crypto.randomUUID(),paymentMethod:'demo-card',lines:[{productId:'iphone-purple',quantity:2,unitPrice:100}],address:{name:'Isolated address',address:'Isolated validation address',phone:'09170000000'},shipping:{method:'standard',date:''}}
 const parsed=checkoutInput.parse(input)
 const product={id:'iphone-purple',name:'iPhone',variant:'Manual',price:'100.00',published:true,stockQuantity:3}
 assert.equal(quoteOrder(parsed,[product]).subtotal,'200.00')
 for(const change of [{price:'101.00'},{stockQuantity:1},{published:false}])assert.throws(()=>quoteOrder(parsed,[{...product,...change}]))
 assert.equal(quoteOrder(parsed,[{...product,stockQuantity:null}]).items[0].stockReserved,false)
 assert.equal(checkoutInput.safeParse({...input,lines:[input.lines[0],input.lines[0]]}).success,false)
 assert.equal(checkoutInput.safeParse({...input,paid:true}).success,false)
 assert.equal(checkoutInput.safeParse({...input,cardNumber:'4242424242424242',cvv:'123'}).success,false)
 assert.equal(canTransition('pending','confirmed',true),true)
 assert.equal(canTransition('pending','confirmed',false),false)
 assert.equal(canTransition('delivered','pending',true),false)
})
