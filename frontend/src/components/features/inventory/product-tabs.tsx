import { useRef, type KeyboardEvent } from 'react'

export type ProductTab = 'overview' | 'purchases' | 'adjustments' | 'history'
const tabs: ProductTab[] = ['overview', 'purchases', 'adjustments', 'history']

export default function ProductTabs({
  active,
  onChange,
  prefix,
}: {
  active: ProductTab
  onChange: (tab: ProductTab) => void
  prefix: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onChange(tabs[next])
    refs.current[next]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label="Product information"
      className="mt-5 flex overflow-x-auto border-b border-[#edf0f3]"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          ref={(element) => {
            refs.current[index] = element
          }}
          id={`${prefix}-${tab}-tab`}
          role="tab"
          aria-selected={active === tab}
          aria-controls={`${prefix}-${tab}-panel`}
          tabIndex={active === tab ? 0 : -1}
          onClick={() => onChange(tab)}
          onKeyDown={(event) => handleKey(event, index)}
          className={`shrink-0 border-b-2 px-1 py-3 text-sm capitalize outline-none focus-visible:bg-blue-50 sm:mr-10 sm:px-2 ${active === tab ? 'border-[#2474ed] text-[#515b6b]' : 'border-transparent text-[#7d8697] hover:text-blue-600'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
