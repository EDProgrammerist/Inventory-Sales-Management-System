import {z} from 'zod'
import {deleteCatalog} from '@/repositories/catalog.repository'

export async function removeCatalog(ownerId:string,id:unknown,body:unknown) {
  const productId=z.string().min(1).max(100).parse(id)
  const {expectedVersion}=z.object({expectedVersion:z.number().int().nonnegative()}).strict().parse(body)
  await deleteCatalog(ownerId,productId,expectedVersion)
}
