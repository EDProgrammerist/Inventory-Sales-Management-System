import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Request, Response, NextFunction } from 'express'
import { requireAdmin } from '@/middlewares/admin.middleware'
import {app} from '@/app'
import {once} from 'node:events'
import type {AddressInfo} from 'node:net'

test('commerce management and saved orders reject anonymous HTTP access',async()=>{
  const server=app.listen(0,'127.0.0.1')
  try{
    if(!server.listening)await once(server,'listening')
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
    for(const [path,method] of [['/catalog/v1/admin/products','GET'],['/catalog/v1/admin/products','POST'],['/orders/v1/admin','GET'],['/orders/v1/mine','GET'],['/orders/v1','POST'],['/orders/v1/admin/invalid','PUT']])assert.equal((await fetch(base+path,{method})).status,401)
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()))}
})

test('only the authenticated ADMIN role can pass the workspace boundary', () => {
  for (const role of [undefined,'USER','admin','UNKNOWN']) {
    assert.throws(() => requireAdmin({} as Request, {locals:{user:role?{role}:undefined}} as unknown as Response, (()=>{throw new Error('must not continue')}) as NextFunction), error=>typeof error==='object'&&error!==null&&'status' in error&&error.status===403)
  }
  let continued=false
  requireAdmin({} as Request,{locals:{user:{role:'ADMIN'}}} as unknown as Response,(()=>{continued=true}) as NextFunction)
  assert.ok(continued)
})
