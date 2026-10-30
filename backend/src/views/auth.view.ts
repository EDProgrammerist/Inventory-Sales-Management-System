import type { Account } from '@/models/auth.model'
export function userView(user: Account) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}
