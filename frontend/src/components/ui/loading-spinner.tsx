import { cn } from '@/lib/cn'

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none', className)}
    />
  )
}
