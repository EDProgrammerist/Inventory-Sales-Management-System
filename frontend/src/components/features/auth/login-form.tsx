'use client'

import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/components/context/use-auth'
import { emailError } from '@/lib/auth-validation'
import { AuthField, AuthSubmit, AuthFeedback, GoogleButton, authLinkClass } from './auth-controls'

const rememberedEmailKey = 'kanban-remembered-email'

function readRememberedEmail(): string {
  try {
    const saved = JSON.parse(localStorage.getItem(rememberedEmailKey) ?? 'null')
    return typeof saved?.email === 'string' && saved.expiresAt > Date.now() ? saved.email : ''
  } catch {
    return ''
  }
}

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState(readRememberedEmail)
  const [remember, setRemember] = useState(() => Boolean(readRememberedEmail()))
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [requestError, setRequestError] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const disabled = pending || signedIn || loading

  function showNotice(message: string) {
    setRequestError('')
    setNotice(message)
  }

  function toggleRemember(checked: boolean) {
    setRemember(checked)
    if (!checked) {
      try { localStorage.removeItem(rememberedEmailKey) } catch { /* Browser storage may be disabled. */ }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    const form = event.currentTarget
    const password = String(new FormData(form).get('password') ?? '')
    const cleanEmail = email.trim()
    const nextErrors = {
      email: emailError(cleanEmail),
      password: password ? undefined : 'Enter your password.',
    }
    setErrors(nextErrors)
    setNotice('')
    setRequestError('')
    if (nextErrors.email || nextErrors.password) {
      form.querySelector<HTMLInputElement>(nextErrors.email ? '#email' : '#password')?.focus()
      return
    }
    setPending(true)
    try {
      await login(cleanEmail, password)
      try {
        if (remember) localStorage.setItem(rememberedEmailKey, JSON.stringify({ email: cleanEmail, expiresAt: Date.now() + 30 * 86400000 }))
        else localStorage.removeItem(rememberedEmailKey)
      } catch { /* Sign-in can proceed when browser storage is unavailable. */ }
      form.reset()
      setSignedIn(true)
      setNotice('You’re signed in successfully.')
      const from: unknown = location.state?.from
      const destination = typeof from === 'string' && /^\/(dashboard|inventory|reports|suppliers|orders|manage-store)(?:[/?#]|$)/.test(from) ? from : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} aria-busy={pending} className="space-y-5">
        <AuthField id="email" name="email" label="Email" type="email" autoComplete="username" placeholder="Enter your email" value={email} disabled={disabled} error={errors.email} helper="Use the email associated with your Shenban account." onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }} />
        <AuthField id="password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="••••••••" disabled={disabled} error={errors.password} helper="Your password is case sensitive." onChange={() => setErrors((current) => ({ ...current, password: undefined }))} />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2.5 text-[#515967]">
            <input type="checkbox" name="remember" checked={remember} onChange={(event) => toggleRemember(event.target.checked)} disabled={disabled} aria-describedby="remember-help" className="h-4 w-4 cursor-pointer accent-[#1765d5]" />
            Remember my email
          </label>
          <span id="remember-help" className="sr-only">Save only your email on this device for 30 days.</span>
          <button type="button" disabled={pending} onClick={() => showNotice('Password recovery is currently unavailable. Please contact your workspace administrator for help.')} className={authLinkClass}>Forgot password</button>
        </div>
        <AuthSubmit pending={pending || loading} complete={signedIn} label="Sign in" pendingLabel={loading ? 'Checking session…' : 'Signing in…'} />
      </form>
      <GoogleButton label="Sign in with Google" disabled={disabled} onClick={() => showNotice('Google sign-in is currently unavailable. Please use your email and password.')} />
      <p className="mt-8 text-center text-[13px] text-[#737b8b]">Don’t have an account? <Link to="/signup" className={`${authLinkClass} ml-1`}>Sign up</Link></p>
      <AuthFeedback error={requestError} notice={notice} />
    </>
  )
}
