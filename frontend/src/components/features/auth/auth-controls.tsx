'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import LoadingSpinner from '@/components/ui/loading-spinner'

export const authLinkClass = 'rounded-sm font-medium text-[#1765d5] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1765d5]'
const fieldClass = 'h-12 w-full rounded-lg border border-[#d3d7de] bg-white px-3.5 text-[15px] text-zinc-800 shadow-[0_1px_2px_rgba(24,39,62,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-[#8b919e] focus:border-[#1765d5] focus:ring-3 focus:ring-[#1765d5]/10 aria-invalid:border-red-600 disabled:bg-zinc-50'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  helper: string
  visibleHelper?: boolean
}

export function AuthField({ id, label, error, helper, visibleHelper = false, type, ...props }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-[#414956]">{label}</label>
      <div className="relative">
        <input {...props} id={id} type={isPassword && showPassword ? 'text' : type} aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} className={`${fieldClass}${isPassword ? ' pr-12' : ''}`} />
        {isPassword && (
          <button type="button" disabled={props.disabled} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-[#8b919e] hover:text-[#1765d5] focus-visible:outline-2 focus-visible:outline-[#1765d5]">
            {showPassword ? <EyeSlashIcon size={19} weight="regular" /> : <EyeIcon size={19} weight="regular" />}
          </button>
        )}
      </div>
      <p id={`${id}-help`} className={visibleHelper ? 'text-[13px] leading-5 text-[#737b8b]' : 'sr-only'}>{helper}</p>
      {error && <p id={`${id}-error`} className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

export function AuthSubmit({ pending, complete, label, pendingLabel }: { pending: boolean; complete: boolean; label: string; pendingLabel: string }) {
  return (
    <button type="submit" disabled={pending || complete} className="relative mt-1 h-12 w-full overflow-hidden rounded-md bg-[#1765d5] text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(23,101,213,0.15)] transition-[background-color,transform] hover:bg-[#1258bd] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#1765d5] disabled:cursor-default disabled:opacity-70">
      <span className="relative inline-flex items-center justify-center gap-2" role={pending ? 'status' : undefined}>
        {pending && <LoadingSpinner className="size-4" />}
        {pending ? pendingLabel : complete ? 'Success' : label}
      </span>
    </button>
  )
}

export function GoogleButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#d3d7de] bg-white text-[15px] font-medium text-[#414956] shadow-[0_1px_2px_rgba(24,39,62,0.04)] transition-[background-color,transform] hover:bg-zinc-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1765d5]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.8-2.4l-3.3-2.6c-.9.6-2.1 1-3.5 1-2.6 0-4.8-1.8-5.6-4.1H3v2.7A10.2 10.2 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.4H3a10 10 0 0 0 0 9.2l3.4-2.7Z" />
        <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10.2 10.2 0 0 0-9 5.4l3.4 2.7C7.2 7.8 9.4 6 12 6Z" />
      </svg>
      {label}
    </button>
  )
}

export function AuthFeedback({ error, notice }: { error: string; notice: string }) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">{error}</p>}
      {notice && <p className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-5 text-[#515967]">{notice}</p>}
    </div>
  )
}
