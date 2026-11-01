import { useEffect, useRef } from 'react'

// Each product arrives once. Content remains visible if motion or JS is unavailable.
export function useLandingMotion() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    if (!root || preference.matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('shop-revealed')
        observer.unobserve(entry.target)
      }
    }, { threshold: .08 })
    const observe = () => root.querySelectorAll<HTMLElement>('[data-reveal]:not(.shop-revealed)').forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`)
      observer.observe(element)
    })
    observe()
    const changes = new MutationObserver(observe)
    changes.observe(root, { childList: true, subtree: true })
    const stop = () => { if (preference.matches) observer.disconnect() }
    preference.addEventListener('change', stop)
    return () => { observer.disconnect(); changes.disconnect(); preference.removeEventListener('change', stop) }
  }, [])
  return ref
}
