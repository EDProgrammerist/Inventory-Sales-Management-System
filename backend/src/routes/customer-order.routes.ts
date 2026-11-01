import {Router,json} from 'express'
import {requireAuth} from '@/middlewares/auth.middleware'
import {requireAdmin} from '@/middlewares/admin.middleware'
import {csrf} from '@/middlewares/csrf.middleware'
import * as controller from '@/controllers/customer-order.controller'

export const customerOrderRouter=Router()
customerOrderRouter.use(requireAuth,csrf)
customerOrderRouter.get('/mine',controller.mine)
customerOrderRouter.post('/',json({limit:'32kb'}),controller.create)
customerOrderRouter.post('/:id/cancel',controller.cancel)
customerOrderRouter.get('/admin',requireAdmin,controller.list)
customerOrderRouter.put('/admin/:id',requireAdmin,json({limit:'4kb'}),controller.update)
