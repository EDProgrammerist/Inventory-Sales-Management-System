import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('workspace action names describe information or available preferences on each route',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {renderCommerceRoute}=await server.ssrLoadModule('/scripts/commerce-render-check.tsx')
    for(const path of ['/dashboard','/inventory','/reports','/orders','/suppliers','/manage-store']){
      const html=renderCommerceRoute(path)
      const label=['/suppliers','/manage-store'].includes(path)?'View preferences':'Store information'
      assert.equal((html.match(new RegExp(`>${label}</button>`,'g'))??[]).length,2,`${path}: desktop and mobile controls must both name their actual task`)
      assert.ok(!html.includes('>Settings</button>'),`${path}: no information-only action should promise Settings`)
    }
  }finally{await server.close()}
})
