import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('original workspace screens start empty and preserve manual entry forms', {timeout:60000},async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'})
 try{
  const {renderInventoryRoute,renderProductForm,renderSupplierForm,renderOrderForm,renderReportChart}=await server.ssrLoadModule('/scripts/product-render-check.tsx')
  const cases=[['/inventory','No matching products'],['/reports','Best selling product'],['/suppliers','No matching suppliers'],['/orders','No matching orders'],['/manage-store','No matching stores']]
  for(const [path,label] of cases){
   const html=renderInventoryRoute(path)
   assert.ok(html.includes(label),`Missing original content at ${path}`)
   for(const name of ['Richard Martin','Ronald Martin','Lisy Store','Maggi'])assert.ok(!html.includes(name),`Seeded ${name} at ${path}`)
  }
  assert.ok(renderInventoryRoute('/inventory/missing-product').includes('Product not found'))
  const productForm=renderProductForm(),supplierForm=renderSupplierForm(),orderForm=renderOrderForm()
  for(const field of ['name','sku','category','price','quantity','unit','expiry','threshold'])assert.ok(productForm.includes(`id="product-${field}"`))
  for(const field of ['name','product','category','price','phone','email'])assert.ok(supplierForm.includes(`id="supplier-${field}"`))
  for(const field of ['product','productId','category','value','quantity','unit','buyingPrice','expected'])assert.ok(orderForm.includes(`id="order-${field}"`))
  for(const form of [productForm,supplierForm,orderForm])assert.ok(form.includes('Discard'))
  for(const period of ['monthly','quarterly']){const html=renderReportChart(period);assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Infinity'))}
 }finally{await server.close()}
})
