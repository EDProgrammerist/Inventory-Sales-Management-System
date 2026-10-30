import { useAuth } from '@/components/context/use-auth'

export default function WorkspaceProfile() {
  const { user } = useAuth()
  if (!user) return <p className="text-sm text-muted">Account details are unavailable. Please sign in again.</p>
  return (
    <dl className="grid gap-5 text-sm">
      {([['Name', user.name || 'Not provided'], ['Email', user.email], ['Role', user.role === 'ADMIN' ? 'Administrator' : 'User']] as const).map(([label, value]) => (
        <div key={label} className="grid gap-1">
          <dt className="text-muted">{label}</dt>
          <dd className="break-words font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
