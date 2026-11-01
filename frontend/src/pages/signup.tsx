import AuthLayout from '@/components/features/auth/auth-layout'
import SignupForm from '@/components/features/auth/signup-form'

export default function SignupPage() {
  return (
    <AuthLayout title="Create an account" description="Create your Shenban customer account.">
      <SignupForm />
    </AuthLayout>
  )
}
