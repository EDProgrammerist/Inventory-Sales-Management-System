import { z } from 'zod'
const password = z
  .string()
  .min(8)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must be at most 72 UTF-8 bytes',
  )
export const credentialsSchema = z
  .object({ email: z.string().trim().toLowerCase().pipe(z.email()), password })
  .strict()
export const signupSchema = credentialsSchema.extend({ name: z.string().trim().min(1).max(100) })
