import { useState, type FormEvent } from 'react'
import { useSaveRecord } from '@/components/context/use-save-record'
import SaveFeedback from './save-feedback'

export interface RecordField {
  name: string
  label: string
  type?: string
  placeholder?: string
  maxLength?: number
}
export default function RecordForm({
  fields,
  initial = {},
  validate,
  onSave,
  onCancel,
  submitLabel,
}: {
  fields: RecordField[]
  initial?: Record<string, string>
  validate: (input: Record<string, string>) => Record<string, string>
  onSave: (input: Record<string, string>) => void | Promise<void>
  onCancel: () => void
  submitLabel: string
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { saving, saveError, run } = useSaveRecord()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >
    const next = validate(input)
    setErrors(next)
    const first = fields.find((field) => next[field.name])
    if (first) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${first.name}"]`)?.focus()
      return
    }
    void run(() => onSave(input))
  }
  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="grid gap-2">
          <label htmlFor={`record-${field.name}`} className="text-sm font-medium">
            {field.label}
            <span className="sr-only"> (required)</span>
          </label>
          <input
            id={`record-${field.name}`}
            name={field.name}
            type={field.type ?? 'text'}
            defaultValue={initial[field.name] ?? ''}
            placeholder={field.placeholder}
            required
            maxLength={field.maxLength ?? 200}
            step={field.type === 'number' ? 'any' : undefined}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `record-${field.name}-error` : undefined}
            onChange={() => setErrors((current) => ({ ...current, [field.name]: '' }))}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500"
          />
          {errors[field.name] && (
            <p id={`record-${field.name}-error`} className="text-xs text-red-700">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      <SaveFeedback saving={saving} error={saveError} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="inventory-button" onClick={onCancel}>
          Discard
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
