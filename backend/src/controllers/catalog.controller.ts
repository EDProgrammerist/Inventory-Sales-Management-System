import type { RequestHandler } from 'express'
import { getCatalog } from '@/services/catalog/get-catalog-service'
import { catalogView } from '@/views/catalog.view'
import { adminCatalogView } from '@/views/catalog.view'
import { listAdminCatalog } from '@/repositories/catalog.repository'
import { saveCatalog } from '@/services/catalog/save-catalog-service'
import { removeCatalog } from '@/services/catalog/delete-catalog-service'

export const adminDelete:RequestHandler=async(request,response)=>{
  await removeCatalog(response.locals.user.id,request.params.id,request.body)
  response.json({status:'success',data:{deleted:true}})
}

export function catalogController(read: typeof getCatalog = getCatalog): RequestHandler {
  return async (_request, response) => {
    response.set('Cache-Control','no-store').json({status:'success',data:catalogView(await read())})
  }
}

export const adminList:RequestHandler=async(_request,response)=>{
  response.set('Cache-Control','no-store').json({status:'success',data:adminCatalogView(await listAdminCatalog(response.locals.user.id))})
}
export const adminSave:RequestHandler=async(request,response)=>{
  const id=request.method==='PUT'?String(request.params.id):undefined
  const row=await saveCatalog(response.locals.user.id,request.body,id)
  response.status(id===undefined?201:200).json({status:'success',data:{product:adminCatalogView([row]).products[0]}})
}
