import { useEffect, useRef, useState } from 'react'
import { ImageIcon, UserCircleIcon, XIcon } from '@phosphor-icons/react'
import { imageFileError } from '@/data/image-validation'

export default function ImageUpload({
  image,
  onChange,
  onBusyChange,
  subject = 'product',
  round = false,
}: {
  image?: string
  onChange: (image: string | undefined) => void
  onBusyChange: (busy: boolean) => void
  subject?: 'product' | 'supplier'
  round?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const reader = useRef<FileReader | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  useEffect(
    () => () => {
      if (reader.current) {
        reader.current.onload = null
        reader.current.onerror = null
        reader.current.onabort = null
        reader.current.abort()
      }
    },
    [],
  )

  function chooseImage(file?: File) {
    if (!file) return
    const validationError = imageFileError(file)
    if (validationError) {
      setError(validationError)
      return
    }
    reader.current?.abort()
    const nextReader = new FileReader()
    reader.current = nextReader
    onBusyChange(true)
    setError('')
    nextReader.onload = () => {
      onChange(String(nextReader.result))
      onBusyChange(false)
    }
    nextReader.onerror = () => {
      setError('This image could not be read. Choose another file.')
      onBusyChange(false)
    }
    nextReader.onabort = () => {
      if (reader.current === nextReader) onBusyChange(false)
    }
    nextReader.readAsDataURL(file)
  }
  function removeImage() {
    reader.current?.abort()
    onChange(undefined)
    setError('')
    if (input.current) input.current.value = ''
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        chooseImage(event.dataTransfer.files[0])
      }}
      className={`rounded-lg px-2 py-1 ${dragging ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
    >
      <div className="flex items-center justify-center gap-5">
        <div
          className={`relative grid size-[84px] shrink-0 place-items-center border border-dashed border-[#b9bec6] bg-white ${round ? 'rounded-full' : 'rounded-xl'}`}
        >
          {image ? (
            <>
              <img
                src={image}
                alt={`Selected ${subject} preview`}
                onError={() => {
                  removeImage()
                  setError('The image is not valid. Choose a PNG, JPEG, or WebP image.')
                }}
                className={
                  round
                    ? 'size-[76px] rounded-full object-cover'
                    : 'size-[76px] rounded-lg object-contain'
                }
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label={`Remove ${subject} image`}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500"
              >
                <XIcon size={14} />
              </button>
            </>
          ) : round ? (
            <UserCircleIcon size={64} className="text-[#a5aab3]" weight="thin" aria-hidden="true" />
          ) : (
            <ImageIcon size={23} className="text-slate-300" weight="regular" aria-hidden="true" />
          )}
        </div>
        <div className="text-center text-sm leading-6 text-[#98a0ae]">
          <p>Drag image here</p>
          <p>or</p>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="rounded text-[#498cf0] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            Browse image
          </button>
        </div>
      </div>
      <input
        ref={input}
        id={`${subject}-image`}
        name={`${subject}-image`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => chooseImage(event.target.files?.[0])}
      />
      <p className="mt-2 text-center text-[10px] text-slate-400">
        Optional · PNG, JPEG or WebP · up to 5 MB
      </p>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
