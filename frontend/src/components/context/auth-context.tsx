import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getSession, signIn, signOut, signUp, type AuthUser } from '@/services/auth'
import { AuthContext } from './auth-state'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const generation = useRef(0)

  useEffect(() => {
    let active = true
    const current = generation.current
    getSession().then((account) => {
      if (active && current === generation.current) setUser(account)
    }).catch((reason: unknown) => {
      if (active && current === generation.current) {
        setError(reason instanceof Error ? reason.message : 'Unable to restore your session.')
      }
    }).finally(() => {
      if (active && current === generation.current) setLoading(false)
    })
    return () => { active = false }
  }, [attempt])

  async function authenticate(request: () => Promise<AuthUser>) {
    const current = ++generation.current
    try {
      const account = await request()
      if (current === generation.current) {
        setUser(account)
        setError('')
      }
    } finally {
      if (current === generation.current) setLoading(false)
    }
  }

  async function logout() {
    await signOut()
    generation.current++
    setUser(null)
    setError('')
    setLoading(false)
  }

  function retry() {
    setError('')
    setLoading(true)
    setAttempt((value) => value + 1)
  }

  return (
    <AuthContext value={{ user, loading, error, retry,
      login: (email, password) => authenticate(() => signIn(email, password)),
      signup: (name, email, password) => authenticate(() => signUp(name, email, password)),
      logout,
    }}>
      {children}
    </AuthContext>
  )
}
