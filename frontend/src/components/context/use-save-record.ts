import { useRef, useState } from 'react'

// Shared form lifecycle: keep inputs on failure, prevent duplicate submissions,
// and let the caller close its dialog only after the server confirms the write.
export function useSaveRecord() {
  const active = useRef(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  async function run(action: () => void | Promise<void>) {
    if (active.current) return
    active.current = true
    setSaving(true)
    setSaveError('')
    try { await action() }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Unable to save. Please try again.') }
    finally { active.current = false; setSaving(false) }
  }
  return { saving, saveError, run }
}
