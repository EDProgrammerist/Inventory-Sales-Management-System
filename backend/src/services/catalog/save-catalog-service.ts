import {adminCatalogInput} from '@/schema/catalog.schema'
import {writeCatalog} from '@/repositories/catalog.repository'
import {ApiError} from '@/lib/api-error'

export async function saveCatalog(ownerId:string,body:unknown,id?:string) {
  const input=adminCatalogInput.parse(body)
  if(id!==undefined&&id!==input.id)throw new ApiError(400,'The product ID cannot be changed')
  try {
    const row=await writeCatalog(ownerId,input,id!==undefined)
    if(!row)throw new ApiError(409,'This product changed or is unavailable. Close the editor and refresh products before editing again.')
    return row
  } catch(error) {
    const cause=error instanceof Error&&error.cause?error.cause:error
    if(typeof cause==='object'&&cause!==null&&'code' in cause&&cause.code==='23505')throw new ApiError(409,'This product ID already exists. Choose another ID.')
    throw error
  }
}
