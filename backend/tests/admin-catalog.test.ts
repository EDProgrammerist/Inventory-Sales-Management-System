import assert from 'node:assert/strict'
import {test} from 'node:test'
import {adminCatalogInput} from '@/schema/catalog.schema'

test('electronics catalog editing supports unknown stock, zero stock and explicit publication without expiry',()=>{
 const input={id:'manual-iphone',name:'iPhone',variant:'Manual configuration',category:'phones',price:100,imageKey:'iphone-black',description:'Manually entered',featured:false,published:true,stockQuantity:null,threshold:2}
 assert.equal(adminCatalogInput.parse(input).stockQuantity,null)
 assert.equal(adminCatalogInput.parse({...input,stockQuantity:0}).stockQuantity,0)
 for(const change of [{ownerId:'forged'},{stockQuantity:-1},{stockQuantity:1.5},{price:0},{category:'Groceries'},{imageKey:'../../secret'},{image:'https://tracking.test/x.png'}]) assert.equal(adminCatalogInput.safeParse({...input,...change}).success,false)
})
