import { listCatalog } from '@/repositories/catalog.repository'

export async function getCatalog() {
  return listCatalog()
}
