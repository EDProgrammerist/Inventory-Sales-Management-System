import LoadingSpinner from './loading-spinner'

export default function SaveFeedback({ saving, error }: { saving: boolean; error: string }) {
  if (error) return <p role="alert" className="text-sm text-red-700">{error}</p>
  if (saving) return <p role="status" className="flex items-center gap-2 text-sm text-loading-foreground"><LoadingSpinner className="text-brand" />Saving…</p>
  return null
}
