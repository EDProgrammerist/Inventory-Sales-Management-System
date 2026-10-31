import { useState, type FormEvent } from 'react'
import { productCategories } from '@/data/inventory-demo'
import { validateNewOrder } from '@/data/orders-demo'
import { useSaveRecord } from '@/components/context/use-save-record'
import SaveFeedback from '@/components/ui/save-feedback'

const fields = [
  {
    name: 'product',
    label: 'Product Name',
    placeholder: 'Enter product name',
    type: 'text',
    maxLength: 100,
    helper: 'Enter the name of the product being ordered.',
  },
  {
    name: 'productId',
    label: 'Product ID',
    placeholder: 'Enter product ID',
    type: 'text',
    maxLength: 100,
    helper: 'Letters, numbers, hyphens and underscores. The order ID is generated separately.',
  },
  {
    name: 'category',
    label: 'Category',
    placeholder: 'Select product category',
    type: 'select',
    helper: 'Choose a product category.',
  },
  {
    name: 'value',
    label: 'Order Value',
    placeholder: 'Enter order value',
    type: 'number',
    step: '0.01',
    max: '999999999.99',
    helper: 'Total order value in PHP, greater than zero, with up to two decimal places.',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    placeholder: 'Enter product quantity',
    type: 'number',
    step: '1',
    max: '999999999',
    helper: 'Enter a whole quantity from 1 to 999999999.',
  },
  {
    name: 'unit',
    label: 'Unit',
    placeholder: 'Enter product unit',
    type: 'text',
    maxLength: 30,
    helper: 'For example: Packets, Bottles, Pieces, or kg.',
  },
  {
    name: 'buyingPrice',
    label: 'Buying Price',
    placeholder: 'Enter buying price',
    type: 'number',
    step: '0.01',
    max: '999999999.99',
    helper: 'Buying price in PHP, greater than zero, with up to two decimal places.',
  },
  {
    name: 'expected',
    label: 'Date of Delivery',
    placeholder: 'Enter date of delivery',
    type: 'date',
    helper: 'Choose a valid delivery date.',
  },
]
const inputClass =
  'h-11 min-w-0 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm text-[#606979] shadow-xs outline-none placeholder:text-[#99a1af] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500'

export default function OrderForm({
  onAdd,
  onDiscard,
}: {
  onAdd: (input: Record<string, string>) => void | Promise<void>
  onDiscard: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { saving, saveError, run } = useSaveRecord()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = Object.fromEntries(new FormData(form)) as Record<string, string>
    const next = validateNewOrder(input)
    setErrors(next)
    const first = fields.find((field) => next[field.name])
    if (first) {
      form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${first.name}"]`)?.focus()
      return
    }
    void run(() => onAdd(input))
  }
  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <div className="space-y-5">
        {fields.map((field) => (
          <div
            key={field.name}
            className="grid items-start gap-2 sm:grid-cols-[145px_minmax(0,1fr)] sm:gap-4"
          >
            <label
              htmlFor={`order-${field.name}`}
              className="text-sm font-medium text-[#555f6e] sm:pt-3"
            >
              {field.label}
              <span className="sr-only"> (required)</span>
            </label>
            <div className="min-w-0">
              {field.type === 'select' ? (
                <select
                  id={`order-${field.name}`}
                  name={field.name}
                  defaultValue=""
                  required
                  className={inputClass}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`order-${field.name}-help${errors[field.name] ? ` order-${field.name}-error` : ''}`}
                  onChange={() => setErrors((current) => ({ ...current, [field.name]: '' }))}
                >
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                  {productCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`order-${field.name}`}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  maxLength={field.maxLength}
                  step={field.step}
                  min={
                    field.type === 'number' ? (field.name === 'quantity' ? '1' : '0.01') : undefined
                  }
                  max={field.max}
                  className={inputClass}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`order-${field.name}-help${errors[field.name] ? ` order-${field.name}-error` : ''}`}
                  onChange={() => setErrors((current) => ({ ...current, [field.name]: '' }))}
                />
              )}
              <p id={`order-${field.name}-help`} className="sr-only">
                {field.helper}
              </p>
              {errors[field.name] && (
                <p id={`order-${field.name}-error`} className="mt-1.5 text-xs text-red-700">
                  {errors[field.name]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#929aa8]">
          <input
            type="checkbox"
            name="notifyOnDelivery"
            defaultChecked
            aria-describedby="order-notification-help"
            className="size-4 shrink-0 accent-blue-600"
          />
          Notify on the date of delivery
        </label>
        <p id="order-notification-help" className="mt-2 text-[10px] leading-4 text-slate-400">
          Notification preference only; no notification is scheduled.
        </p>
      </div>
      <SaveFeedback saving={saving} error={saveError} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="inventory-button" onClick={onDiscard}>
          Discard
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
        >
          Add Order
        </button>
      </div>
    </form>
  )
}
