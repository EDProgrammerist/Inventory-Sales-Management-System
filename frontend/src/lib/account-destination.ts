import type { AuthUser } from '@/services/auth'

export function accountDestination(role: AuthUser['role'], from: unknown) {
  const publicReturn = typeof from === 'string' && /^\/(cart|checkout\/(address|shipping|payment)|account\/orders)(?:[/?#]|$)/.test(from)
  if (publicReturn) return from as string
  if (role !== 'ADMIN') return '/'
  return typeof from === 'string' && /^\/(dashboard|inventory|reports|suppliers|orders|manage-store)(?:[/?#]|$)/.test(from) ? from : '/dashboard'
}
