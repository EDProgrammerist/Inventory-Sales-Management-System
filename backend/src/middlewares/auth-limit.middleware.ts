import type { RequestHandler } from 'express'
const attempts = new Map<string, { count: number; until: number }>()
export const authLimit: RequestHandler = (req, res, next) => {
  const now = Date.now(),
    key = req.ip ?? 'unknown'
  for (const [ip, value] of attempts) if (value.until < now) attempts.delete(ip)
  const value = attempts.get(key) ?? { count: 0, until: now + 15 * 60000 }
  value.count++
  attempts.set(key, value)
  if (value.count > 30) {
    res.set('Retry-After', String(Math.ceil((value.until - now) / 1000)))
    res.status(429).json({ message: 'Too many attempts. Try again later.' })
    return
  }
  next()
}
