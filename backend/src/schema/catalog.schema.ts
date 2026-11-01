import { z } from 'zod'

export const catalogProductInput = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.string().trim().min(1).max(150),
  variant: z.string().trim().min(1).max(150),
  category: z.enum(['phones','computers','consoles']),
  price: z.number().positive().max(9999999999.99).refine(value => Math.abs(value*100-Math.round(value*100))<0.0001),
  imageKey: z.enum(['iphone-purple','iphone-gold','iphone-silver','iphone-black','rtx-5090','rtx-5080','ps5']),
  description: z.string().trim().min(1).max(2000),
  featured: z.boolean(),
}).strict()

export const catalogImport = z.array(catalogProductInput).length(8).superRefine((rows, context) => {
  if (new Set(rows.map(row => row.id)).size !== rows.length) context.addIssue({ code:'custom',message:'Duplicate product IDs' })
})

export const adminCatalogInput = catalogProductInput.extend({
  published:z.boolean(),
  stockQuantity:z.number().int().min(0).max(1_000_000).nullable(),
  threshold:z.number().int().min(0).max(1_000_000),
  expectedVersion:z.number().int().min(0).optional(),
  image:z.string().max(7_000_000).regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/).nullable().optional(),
}).strict()
