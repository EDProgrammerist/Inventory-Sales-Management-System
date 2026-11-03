import AuthLayout from '@/components/features/auth/auth-layout'
import LoginForm from '@/components/features/auth/login-form'
import { Link } from 'react-router'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { authLinkClass } from '@/components/features/auth/auth-controls'

export default function HomePage() {
  return (
    <AuthLayout title="Log in to your account" description="Welcome back! Please enter your details." navigation={<Link to="/" className={`${authLinkClass} inline-flex min-h-11 items-center gap-2 text-sm`}><ArrowLeftIcon size={18} aria-hidden="true" />Back to homepage</Link>}>
      <LoginForm />
    </AuthLayout>
  )
}
