import { useEffect, useState, type ReactNode } from 'react'
import { WorkspaceContext } from './workspace-context'
import { useAuth } from './use-auth'
import { emptyWorkspace, loadWorkspace, saveWorkspaceRecord, type WorkspaceRecords, type WorkspaceSnapshot } from '@/services/workspace'

function WorkspaceSession({ userId, children }: { userId?: string; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(emptyWorkspace)
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    loadWorkspace(controller.signal).then((data) => {
      if (!controller.signal.aborted) { setSnapshot(data); setError(''); setLoading(false) }
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : 'Unable to load your records.'); setLoading(false) }
    })
    return () => controller.abort()
  }, [userId, attempt])

  async function save<K extends keyof WorkspaceRecords>(kind: K, record: WorkspaceRecords[K], updating = false) {
    if (!userId) throw new Error('Please sign in before saving records.')
    const result = await saveWorkspaceRecord(kind, record, updating)
    setSnapshot((current) => ({
      ...current,
      [kind]: updating ? current[kind].map((row) => row.id === result.record.id ? result.record : row) : [...current[kind], result.record],
      events: kind === 'products' ? [...current.events.filter((event) => event.productId !== record.id), ...result.events] : current.events,
    }))
  }
  return (
    <WorkspaceContext value={{
      orders: snapshot.orders, suppliers: snapshot.suppliers, stores: snapshot.stores,
      saveOrder: (record) => save('orders', record),
      saveSupplier: (record) => save('suppliers', record),
      saveStore: (record, updating) => save('stores', record, updating),
      loading, error, retry: () => { setError(''); setLoading(true); setAttempt((value) => value + 1) },
    }}>
      {children}
    </WorkspaceContext>
  )
}

export default function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const adminId = user?.role === 'ADMIN' ? user.id : undefined
  return <WorkspaceSession key={adminId ?? 'anonymous'} userId={adminId}>{children}</WorkspaceSession>
}
