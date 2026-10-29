import { useState, type FormEvent } from 'react'
import {
  validateProduct,
  productCategories,
  type InventoryProduct,
  type ProductInput,
  type ProductErrors,
} from '@/data/inventory-demo'
import ImageUpload from '@/components/common/image-upload'

const fields: {
  name: keyof ProductInput
  label: string
  type: string
  placeholder: string
  helper: string
  step?: string
  min?: string
  max?: string
}[] = [
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    placeholder: 'Enter product name',
    helper: 'Use a unique product name of up to 100 characters.',
  },
  {
    name: 'sku',
    label: 'Product ID',
    type: 'text',
    placeholder: 'Enter product ID',
    helper: 'Use a unique ID with letters, numbers, hyphens or underscores.',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select product category',
    helper: 'Choose a category for this sample product.',
  },
  {
    name: 'price',
    label: 'Buying Price',
    type: 'number',
    placeholder: 'Enter buying price',
    min: '0.01',
    max: '999999999.99',
    step: '0.01',
    helper: 'Buying price in US dollars, with up to 2 decimal places.',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    placeholder: 'Enter product quantity',
    min: '0',
    max: '1000000',
    step: '1',
    helper: 'Enter a whole quantity from 0 to 1,000,000.',
  },
  {
    name: 'unit',
    label: 'Unit',
    type: 'text',
    placeholder: 'Enter product unit',
    helper: 'For example: Packets, Bottles, Pieces, or kg.',
  },
  {
    name: 'expiry',
    label: 'Expiry Date',
    type: 'date',
    placeholder: 'Enter expiry date',
    helper: 'Choose a valid expiry date. Historical dates are allowed in this sample.',
  },
  {
    name: 'threshold',
    label: 'Threshold Value',
    type: 'number',
    placeholder: 'Enter threshold value',
    min: '0',
    max: '1000000',
    step: '1',
    helper: 'Products at or below this quantity are marked low stock.',
  },
]
const inputClass =
  'h-11 min-w-0 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm text-[#606979] shadow-xs outline-none placeholder:text-[#99a1af] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500'

export default function ProductForm({
  products,
  onAdd,
  onCancel,
  initial,
}: {
  products: InventoryProduct[]
  onAdd: (product: Omit<InventoryProduct, 'id'>) => void
  onCancel: () => void
  initial?: InventoryProduct
}) {
  const [errors, setErrors] = useState<ProductErrors>({})
  const [image, setImage] = useState(initial?.image)
  const [readingImage, setReadingImage] = useState(false)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (readingImage) return
    const form = event.currentTarget
    const values = new FormData(form)
    const input = Object.fromEntries(
      fields.map((field) => [field.name, String(values.get(field.name) ?? '')]),
    ) as ProductInput
    const result = validateProduct(
      input,
      products.filter((product) => product.id !== initial?.id),
    )
    if (!result.valid) {
      setErrors(result.errors)
      const firstInvalid = fields.find((field) => result.errors[field.name])?.name
      form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    onAdd({ ...result.product, image })
  }
  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <ImageUpload image={image} onChange={setImage} onBusyChange={setReadingImage} />
      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.name}
            className="grid items-start gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
          >
            <label
              htmlFor={`product-${field.name}`}
              className="text-sm font-medium text-[#555f6e] sm:pt-3"
            >
              {field.label}
              <span className="sr-only"> (required)</span>
            </label>
            <div className="min-w-0">
              {field.type === 'select' ? (
                <select
                  id={`product-${field.name}`}
                  name={field.name}
                  defaultValue={initial?.category ?? ''}
                  required
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`product-${field.name}-help${errors[field.name] ? ` product-${field.name}-error` : ''}`}
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
                  id={`product-${field.name}`}
                  name={field.name}
                  type={field.type}
                  defaultValue={initial?.[field.name] ?? ''}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  maxLength={
                    field.name === 'name'
                      ? 100
                      : field.name === 'sku'
                        ? 40
                        : field.name === 'unit'
                          ? 30
                          : undefined
                  }
                  placeholder={field.placeholder}
                  required
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`product-${field.name}-help${errors[field.name] ? ` product-${field.name}-error` : ''}`}
                  onChange={() => setErrors((current) => ({ ...current, [field.name]: undefined }))}
                  className={inputClass}
                />
              )}
              <p id={`product-${field.name}-help`} className="sr-only">
                {field.helper}
              </p>
              {errors[field.name] && (
                <p id={`product-${field.name}-error`} className="mt-1.5 text-xs text-red-700">
                  {errors[field.name]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p aria-live="polite" className="text-[10px] leading-4 text-slate-400">
        {readingImage
          ? 'Reading image…'
          : 'Sample inventory · changes last until this page is reloaded.'}
      </p>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className="inventory-button">
          Discard
        </button>
        <button
          type="submit"
          disabled={readingImage}
          className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
        >
          {initial ? 'Save changes' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}
