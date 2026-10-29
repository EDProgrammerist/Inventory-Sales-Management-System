import AuthLayout from '@/components/features/auth/auth-layout'
import LoginForm from '@/components/features/auth/login-form'

export default function HomePage() {
  return (
    <AuthLayout title="Log in to your account" description="Welcome back! Please enter your details.">
      <LoginForm />
    </AuthLayout>
  )
}
