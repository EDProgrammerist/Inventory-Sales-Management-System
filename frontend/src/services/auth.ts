export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
}

export class AuthRequestError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

async function authRequest(path: string, options?: RequestInit) {
  if (!apiBaseUrl) throw new Error('Account services are currently unavailable. Please try again later.')
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/auth/v1/${path}`, {
      ...options,
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('We couldn’t reach the account service. Please try again shortly.')
  }
  if (!response.ok) {
    if (response.status === 401) throw new AuthRequestError(path === 'login' ? 'Your email or password is incorrect. Please try again.' : 'Your session has expired. Please sign in again.', 401)
    if (response.status === 429) throw new Error('Too many sign-in attempts. Please wait and try again.')
    if (response.status === 409) throw new Error('An account already exists with this email. Please log in instead.')
    if (response.status === 404 || response.status === 501) throw new Error('This account service is currently unavailable. Please try again later.')
    throw new Error('We couldn’t complete your request. Please try again shortly.')
  }
  return response.json()
}

export async function getCsrfToken(): Promise<string> {
  const result = await authRequest('csrf-token')
  const token: unknown = result.data?.csrfToken
  if (typeof token !== 'string' || !token) throw new Error('Unable to start a secure session. Please try again.')
  return token
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const csrfToken = await getCsrfToken()
  const result = await authRequest('login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ email, password }),
  })
  return readUser(result)
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  const csrfToken = await getCsrfToken()
  const result = await authRequest('signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ name, email, password }),
  })
  return readUser(result)
}

function readUser(result: unknown): AuthUser {
  const user = (result as { data?: { user?: unknown } } | null)?.data?.user
  if (!user || typeof user !== 'object') throw new Error('Invalid account response. Please try again.')
  const value = user as Record<string, unknown>
  if (typeof value.id !== 'string' || typeof value.email !== 'string' ||
      !(value.name === null || typeof value.name === 'string') ||
      !(value.role === 'ADMIN' || value.role === 'USER')) {
    throw new Error('Invalid account response. Please try again.')
  }
  return { id: value.id, email: value.email, name: value.name, role: value.role }
}

async function restoreSession(): Promise<AuthUser | null> {
  try {
    return readUser(await authRequest('session'))
  } catch (error) {
    if (!(error instanceof AuthRequestError && error.status === 401)) throw error
  }
  try {
    const csrfToken = await getCsrfToken()
    return readUser(await authRequest('refresh', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken },
    }))
  } catch (error) {
    if (error instanceof AuthRequestError && error.status === 401) return null
    throw error
  }
}

// Share the in-flight restoration across React StrictMode effect replays.
let sessionRequest: Promise<AuthUser | null> | undefined
export function getSession(): Promise<AuthUser | null> {
  sessionRequest ??= restoreSession().finally(() => { sessionRequest = undefined })
  return sessionRequest
}

export async function signOut(): Promise<void> {
  const csrfToken = await getCsrfToken()
  await authRequest('logout', { method: 'POST', headers: { 'x-csrf-token': csrfToken } })
}
