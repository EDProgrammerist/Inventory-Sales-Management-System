import { createContext } from 'react'
import type { AuthUser } from '@/services/auth'

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string
  retry: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
