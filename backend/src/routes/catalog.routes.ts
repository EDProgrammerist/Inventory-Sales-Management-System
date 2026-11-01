import { Router,json } from 'express'
import { catalogController,adminList,adminSave } from '@/controllers/catalog.controller'
import { getCatalog } from '@/services/catalog/get-catalog-service'
import { requireAuth } from '@/middlewares/auth.middleware'
import { requireAdmin } from '@/middlewares/admin.middleware'
import { csrf } from '@/middlewares/csrf.middleware'

export function createCatalogRouter(read: typeof getCatalog = getCatalog) {
  const router = Router()
  router.get('/products', catalogController(read))
  router.use('/admin',requireAuth,requireAdmin,csrf)
  router.get('/admin/products',adminList)
  router.post('/admin/products',json({limit:'8mb'}),adminSave)
  router.put('/admin/products/:id',json({limit:'8mb'}),adminSave)
  return router
}
export const catalogRouter = createCatalogRouter()
