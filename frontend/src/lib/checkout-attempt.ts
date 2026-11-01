import type {buildDemoCheckout} from '@/data/customer-orders'

type AttemptStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>
const memory=new Map<string,string>()
export async function checkoutAttempt(userId:string,payload:ReturnType<typeof buildDemoCheckout>,provided?:AttemptStorage|null) {
  // Only an opaque digest and UUID are persisted, never the address or card input.
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({...payload,idempotencyKey:''})))
  const hash=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
  const key=`shenban-demo-attempt:${userId}:${hash}`
  let storage:AttemptStorage|null=null,id=memory.get(key)
  try{storage=provided===undefined?window.sessionStorage:provided;id??=storage?.getItem(key)??undefined}catch{/* Memory still protects navigation when browser storage is disabled. */}
  if(!id||!/^[a-f0-9-]{36}$/i.test(id))id=crypto.randomUUID()
  memory.set(key,id)
  try{storage?.setItem(key,id)}catch{/* Checkout remains usable without browser storage. */}
  return {id,clear:()=>{memory.delete(key);try{storage?.removeItem(key)}catch{/* Opaque old attempts expire with the tab. */}}}
}
