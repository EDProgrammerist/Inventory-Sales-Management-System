import { useState, type FormEvent } from 'react'
import ImageUpload from '@/components/ui/image-upload'
import { useSaveRecord } from '@/components/context/use-save-record'
import SaveFeedback from '@/components/ui/save-feedback'
import { productCategories } from '@/data/inventory-demo'
import {
  validateSupplier,
  type Supplier,
  type SupplierInput,
  type SupplierErrors,
} from '@/data/suppliers-demo'

const fields: {
  name: Exclude<keyof SupplierInput, 'type'>
  label: string
  type: string
  placeholder: string
  helper: string
}[] = [
  {
    name: 'name',
    label: 'Supplier Name',
    type: 'text',
    placeholder: 'Enter supplier name',
    helper: 'Enter a supplier name of up to 100 characters.',
  },
  {
    name: 'product',
    label: 'Product',
    type: 'text',
    placeholder: 'Enter product',
    helper: 'Enter the product supplied by this contact.',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select product category',
    helper: 'Choose a product category.',
  },
  {
    name: 'price',
    label: 'Buying Price',
    type: 'number',
    placeholder: 'Enter buying price',
    helper: 'Price in PHP, greater than zero and with up to 2 decimal places.',
  },
  {
    name: 'phone',
    label: 'Contact Number',
    type: 'tel',
    placeholder: 'Enter supplier contact number',
    helper: 'Use 7–15 digits. A country prefix, spaces, parentheses, and hyphens are accepted.',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter supplier email',
    helper: 'Required to populate the Email column in the supplier list.',
  },
]
const inputClass =
  'h-11 min-w-0 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm text-[#606979] shadow-xs outline-none placeholder:text-[#99a1af] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500'

export default function SupplierForm({
  suppliers,
  onAdd,
  onDiscard,
}: {
  suppliers: Supplier[]
  onAdd: (supplier: Omit<Supplier, 'id'>) => void | Promise<void>
  onDiscard: () => void
}) {
  const [errors, setErrors] = useState<SupplierErrors>({})
  const { saving, saveError, run } = useSaveRecord()
  const [image, setImage] = useState<string | undefined>()
  const [readingImage, setReadingImage] = useState(false)
  const [type, setType] = useState('')
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (readingImage) return
    const form = event.currentTarget
    const data = new FormData(form)
    const input = {
      ...Object.fromEntries(
        fields.map((field) => [field.name, String(data.get(field.name) ?? '')]),
      ),
      type,
    } as SupplierInput
    const result = validateSupplier(input, suppliers)
    if (!result.valid) {
      setErrors(result.errors)
      const first = fields.find((field) => result.errors[field.name])?.name ?? 'type'
      form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${first}"]`)?.focus()
      return
    }
    void run(() => onAdd({ ...result.supplier, image }))
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <ImageUpload
        subject="supplier"
        round
        image={image}
        onChange={setImage}
        onBusyChange={setReadingImage}
      />
      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.name}
            className="grid items-start gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
          >
            <label
              htmlFor={`supplier-${field.name}`}
              className="text-sm font-medium text-[#555f6e] sm:pt-3"
            >
              {field.label}
              <span className="sr-only"> (required)</span>
            </label>
            <div className="min-w-0">
              {field.type === 'select' ? (
                <select
                  id={`supplier-${field.name}`}
                  name={field.name}
                  defaultValue=""
                  required
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`supplier-${field.name}-help${errors[field.name] ? ` supplier-${field.name}-error` : ''}`}
                  onChange={() => setErrors((current) => ({ ...current, [field.name]: undefined }))}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`supplier-${field.name}`}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  min={field.name === 'price' ? '0.01' : undefined}
                  max={field.name === 'price' ? '999999999.99' : undefined}
                  step={field.name === 'price' ? '0.01' : undefined}
                  maxLength={field.name === 'email' ? 254 : field.name === 'phone' ? 32 : 100}
                  autoComplete={
                    field.name === 'email'
                      ? 'email'
                      : field.name === 'phone'
                        ? 'tel'
                        : field.name === 'name'
                          ? 'name'
                          : 'off'
                  }
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`supplier-${field.name}-help${errors[field.name] ? ` supplier-${field.name}-error` : ''}`}
                  onChange={() => setErrors((current) => ({ ...current, [field.name]: undefined }))}
                  className={inputClass}
                />
              )}
              <p id={`supplier-${field.name}-help`} className="sr-only">
                {field.helper}
              </p>
              {errors[field.name] && (
                <p id={`supplier-${field.name}-error`} className="mt-1.5 text-xs text-red-700">
                  {errors[field.name]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <fieldset
        className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
        aria-describedby={errors.type ? 'supplier-type-error' : 'supplier-type-help'}
      >
        <legend className="sr-only">Type (required)</legend>
        <span aria-hidden="true" className="text-sm font-medium text-[#555f6e] sm:pt-3">
          Type
        </span>
        <div className="grid justify-items-start gap-3">
          {[
            { value: 'not-taking-return', label: 'Not taking return' },
            { value: 'taking-return', label: 'Taking return' },
          ].map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                required
                onChange={() => {
                  setType(option.value)
                  setErrors((current) => ({ ...current, type: undefined }))
                }}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-lg border border-[#d0d5dd] px-3 text-sm text-[#99a1af] shadow-xs peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500">
                {option.label}
              </span>
            </label>
          ))}
          <p id="supplier-type-help" className="sr-only">
            Choose whether the supplier accepts returns.
          </p>
          {errors.type && (
            <p id="supplier-type-error" className="text-xs text-red-700">
              {errors.type}
            </p>
          )}
        </div>
      </fieldset>
      {readingImage && (
        <p role="status" className="text-[10px] leading-4 text-slate-400">Reading image...</p>
      )}
      <SaveFeedback saving={saving} error={saveError} />
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onDiscard} className="inventory-button">
          Discard
        </button>
        <button
          type="submit"
          disabled={readingImage || saving}
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
        >
          Add Supplier
        </button>
      </div>
    </form>
  )
}
