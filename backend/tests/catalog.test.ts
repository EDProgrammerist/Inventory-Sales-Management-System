import assert from 'node:assert/strict'
import { test } from 'node:test'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import express from 'express'
import { createCatalogRouter } from '@/routes/catalog.routes'

test('catalog reads are public, expose only catalog fields, and have no write route', async () => {
  const app = express()
  const row = { id:'iphone-purple', name:'iPhone 14 Pro Max', variant:'128GB · Deep Purple', category:'phones' as const, price:'45990.00', imageKey:'iphone-purple', description:'Approved product', featured:true, sortOrder:0, ownerId:'private-owner', createdAt:'private-time' }
  app.use('/api/catalog/v1', createCatalogRouter(async () => [{...row,image:null,published:true,stockQuantity:null,threshold:0,version:0}]))
  const server = app.listen(0, '127.0.0.1')
  try {
    if (!server.listening) await once(server, 'listening')
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/catalog/v1/products`
    const response = await fetch(url)
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.data.products[0].price, 45990)
    assert.equal(result.data.products[0].id, row.id)
    assert.deepEqual(Object.keys(result.data.products[0]).sort(), ['id','name','variant','category','price','imageKey','description','featured'].sort())
    for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await fetch(url, { method })).status, 404)
  } finally { await new Promise<void>(resolve => server.close(() => resolve())) }
})
