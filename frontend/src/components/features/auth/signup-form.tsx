'use client'

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthField, AuthSubmit, GoogleButton, AuthFeedback, authLinkClass } from './auth-controls'
import { emailError } from '@/lib/auth-validation'
import { useAuth } from '@/components/context/use-auth'

type FieldErrors = { name?: string; email?: string; password?: string }

export default function SignupForm() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [notice, setNotice] = useState('')
  const disabled = pending || complete || loading

  function clearError(field: keyof FieldErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    const email = String(values.get('email') ?? '').trim()
    const password = String(values.get('password') ?? '')
    const nextErrors: FieldErrors = {
      name: name ? undefined : 'Enter your name.',
      email: emailError(email),
      password: password.length >= 8 ? undefined : 'Use at least 8 characters for your password.',
    }
    setErrors(nextErrors)
    setRequestError('')
    setNotice('')
    const firstInvalid = (Object.keys(nextErrors) as (keyof FieldErrors)[]).find((field) => nextErrors[field])
    if (firstInvalid) {
      form.querySelector<HTMLInputElement>(`#${firstInvalid}`)?.focus()
      return
    }
    setPending(true)
    try {
      await signup(name, email, password)
      form.reset()
      setComplete(true)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to create your account. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} aria-busy={pending} className="space-y-5">
        <AuthField id="name" name="name" label="Name*" type="text" autoComplete="name" placeholder="Enter your name" required maxLength={100} disabled={disabled} error={errors.name} helper="Enter the name you want to use for your account." onChange={() => clearError('name')} />
        <AuthField id="email" name="email" label="Email*" type="email" autoComplete="email" placeholder="Enter your email" required maxLength={254} disabled={disabled} error={errors.email} helper="Use an email you can access." onChange={() => clearError('email')} />
        <AuthField id="password" name="password" label="Password*" type="password" autoComplete="new-password" placeholder="Create a password" required minLength={8} disabled={disabled} error={errors.password} helper="Must be at least 8 characters." visibleHelper onChange={() => clearError('password')} />
        <AuthSubmit pending={pending || loading} complete={complete} label="Get started" pendingLabel="Creating your account…" />
      </form>
      <GoogleButton label="Sign up with Google" disabled={disabled} onClick={() => { setRequestError(''); setNotice('Google sign-up is currently unavailable. Please create an account with your email.') }} />
      <p className="mt-8 text-center text-[13px] text-[#737b8b]">Already have an account? <Link to="/login" className={`${authLinkClass} ml-1`}>Log in</Link></p>
      <AuthFeedback error={requestError} notice={notice} />
    </>
  )
}
