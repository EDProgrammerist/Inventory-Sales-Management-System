import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('current commerce screens render empty states and preserve electronics and supplier entry forms', {timeout:60000},async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'})
 try{
  const {renderProductForm,renderSupplierForm}=await server.ssrLoadModule('/scripts/product-render-check.tsx')
  const {renderCommerceRoute}=await server.ssrLoadModule('/scripts/commerce-render-check.tsx')
  const cases=[['/inventory','Add your first iPhone'],['/reports','Demo sales'],['/suppliers','No suppliers yet'],['/orders','No customer orders yet'],['/manage-store','No stores yet']]
  for(const [path,label] of cases){
   const html=renderCommerceRoute(path,true)
   assert.ok(html.includes(label),`Missing current content at ${path}`)
   assert.ok(!html.includes('NaN')&&!html.includes('Infinity'))
   for(const name of ['Richard Martin','Ronald Martin','Lisy Store','Maggi'])assert.ok(!html.includes(name),`Seeded ${name} at ${path}`)
  }
  assert.ok(renderCommerceRoute('/inventory/missing-product',true).includes('Product not found'))
  const productForm=renderProductForm(),supplierForm=renderSupplierForm()
  for(const field of ['id','name','variant','category','price','stockQuantity','threshold','published'])assert.ok(productForm.includes(`name="${field}"`))
  assert.ok(!productForm.includes('name="expiry"'))
  for(const field of ['name','product','category','price','phone','email'])assert.ok(supplierForm.includes(`id="supplier-${field}"`))
  assert.ok(productForm.includes('Cancel'))
  assert.ok(supplierForm.includes('Discard'))
  for(const path of ['/suppliers','/manage-store']){
   assert.ok(renderCommerceRoute(path,false,true).includes('Notifications: 1 stock alerts'),`${path} must use current catalog stock`)
   assert.ok(renderCommerceRoute(path,false).includes('Notifications: 0 stock alerts'),'Unknown stock must not trigger an alert')
  }
 }finally{await server.close()}
})
