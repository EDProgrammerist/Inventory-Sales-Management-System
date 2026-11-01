import { and, asc, eq, max, sql } from 'drizzle-orm'
import { getDatabase } from '@/db'
import { catalogProducts } from '@/db/schema'
import {ApiError} from '@/lib/api-error'

export async function listCatalog() {
  return getDatabase().select().from(catalogProducts).where(eq(catalogProducts.published,true)).orderBy(asc(catalogProducts.sortOrder), asc(catalogProducts.id))
}

export async function listAdminCatalog(ownerId:string) {
  return getDatabase().select().from(catalogProducts).where(eq(catalogProducts.ownerId,ownerId)).orderBy(asc(catalogProducts.sortOrder),asc(catalogProducts.id))
}

export async function writeCatalog(ownerId:string,input:import('zod').infer<typeof import('@/schema/catalog.schema').adminCatalogInput>,updating:boolean,database:Pick<ReturnType<typeof getDatabase>,'select'|'update'|'transaction'>=getDatabase()) {
  const {expectedVersion,...fields}=input
  const values={...fields,image:input.image??null,price:input.price.toFixed(2)}
  if(updating){
    if(expectedVersion===undefined)throw new ApiError(400,'Reload this product before editing.')
    return (await database.update(catalogProducts).set({...values,version:sql`${catalogProducts.version}+1`}).where(and(eq(catalogProducts.ownerId,ownerId),eq(catalogProducts.id,input.id),eq(catalogProducts.version,expectedVersion))).returning())[0]
  }
  return database.transaction(async tx=>{
    const [order]=await tx.select({maximum:max(catalogProducts.sortOrder)}).from(catalogProducts)
    return (await tx.insert(catalogProducts).values({...values,ownerId,sortOrder:(order.maximum??-1)+1}).returning())[0]
  })
}
