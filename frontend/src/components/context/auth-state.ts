import { createContext } from 'react'
import type { AuthUser } from '@/services/auth'

export interface AuthState {
  // Successful explicit logout returns home; missing/expired sessions still require login.
  signedOut?: boolean
  user: AuthUser | null
  loading: boolean
  error: string
  retry: () => void
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
