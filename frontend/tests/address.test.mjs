import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('address validation and state preserve manual values and selection invariants', async () => {
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try {
    const { validateAddress }=await server.ssrLoadModule('/src/data/storefront-address.ts')
    const { addressReducer, emptyAddressState }=await server.ssrLoadModule('/src/components/context/storefront-address-state.ts')
    const draft={name:' My place ',type:'home',address:' 123 Test Street, Test City ',phone:'09171234567'}
    assert.equal(Object.keys(validateAddress(draft)).length,0)
    assert.ok(validateAddress({...draft,name:'',address:'',phone:'abc'}).phone)
    assert.ok(validateAddress({...draft,type:'invalid'}).type)
    assert.ok(validateAddress({...draft,name:'x'.repeat(81)}).name)
    let state=addressReducer(emptyAddressState,{type:'save',address:{...draft,id:'first'}})
    assert.equal(state.addresses[0].name,'My place')
    assert.equal(state.selectedId,'first')
    state=addressReducer(state,{type:'save',address:{...draft,id:'second',type:'office'}})
    assert.equal(state.selectedId,'second')
    state=addressReducer(state,{type:'select',id:'first'})
    assert.equal(state.selectedId,'first')
    const before=state
    assert.equal(addressReducer(state,{type:'select',id:'missing'}),before)
    assert.equal(addressReducer(state,{type:'save',address:{...draft,id:'bad',phone:'invalid'}}),before)
    state=addressReducer(state,{type:'save',address:{...draft,id:'first',name:'Updated place'}})
    assert.equal(state.addresses.length,2)
    assert.equal(state.addresses[0].name,'Updated place')
    state=addressReducer(state,{type:'remove',id:'first'})
    assert.equal(state.selectedId,'second')
    state=addressReducer(state,{type:'remove',id:'second'})
    assert.deepEqual(state,emptyAddressState)
    assert.equal(emptyAddressState.addresses.length,0)
  } finally {await server.close()}
})

test('address page starts empty and requires a selection before the next step', async () => {
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try {
    const {renderAddress}=await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const html=renderAddress()
    assert.ok(html.includes('Select Address'))
    assert.ok(html.includes('No addresses yet'))
    assert.ok(html.includes('Add New Address'))
    assert.ok(html.includes('Select an address to continue'))
    assert.ok(!/Thornridge|Headoffice|555-0104/.test(html))
    assert.ok(html.includes('href="/cart"'))
    assert.equal((html.match(/<h1[ >]/g)??[]).length,1)
  } finally {await server.close()}
})
