import { useEffect, useRef } from 'react'

// Content is visible without this enhancement; only intersecting elements animate once.
export function useLandingMotion() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!root || preference.matches || typeof IntersectionObserver === 'undefined') return
    const groups: [string, string, number][] = [
      ['.landing-brand, .nav-action, .process-note', 'ink', 0],
      ['.landing-hero h1 > span', 'headline', 90],
      ['.hero-description, .hero-look', 'rise', 60],
      ['.count-widget', 'stamp', 0],
      ['.hero-stock, .hero-note, .hero-petal', 'float', 90],
      ['.feature-copy h2, .feature-copy > p, .feature-copy > a', 'rise', 65],
      ['.inventory-illustration-stage', 'scene-open', 0],
      ['.workflow-illustration-stage', 'rise', 0],
      ['.landing-story .landing-scene-art', 'scene-left', 0],
      ['.landing-feature .landing-scene-art', 'scene-right', 0],
      ['.section-heading h2, .section-heading p, .capability-grid', 'ink', 80],
      ['.story-copy h2, .story-copy > p, .story-copy li, .story-copy > a', 'rise', 65],
      ['.landing-project > h2, .project-paper', 'ink', 70],
      ['.closing-invitation > p, .landing-close > a, .closing-stock', 'rise', 60],
      ['.landing-footer', 'ink', 0],
    ]
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('landing-motion-entered')
        observer.unobserve(entry.target)
      }
    }, { threshold: .12 })
    for (const [selector, motion, stagger] of groups) {
      root.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
        element.dataset.motion = motion
        element.style.setProperty('--landing-delay', `${Math.min(index * stagger, 240)}ms`)
        observer.observe(element)
      })
    }
    const stop = () => {
      if (preference.matches) {
        observer.disconnect()
        root.querySelectorAll<HTMLElement>('[data-motion]').forEach(element => element.classList.remove('landing-motion-entered'))
      }
    }
    preference.addEventListener('change', stop)
    return () => { observer.disconnect(); preference.removeEventListener('change', stop) }
  }, [])
  return ref
}
