export function SparkSketch({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 70 70" fill="none" aria-hidden="true">
    <path d="m35 4 5 23 25 7-25 7-6 25-7-25-23-6 24-8L35 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
  </svg>
}

export function PaperNote({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 85 85" fill="none" aria-hidden="true">
    <path d="m14 17 49-7 9 53-50 9-8-55Z" fill="var(--landing-paper)" stroke="var(--landing-navy)" strokeWidth="2.5" />
    <path d="m22 32 7-5 8 3 8-5 9 2m-30 17 8-5 8 3 8-5 9 2" stroke="var(--landing-navy)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function PetalMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
    <path d="M48 39C17-10 5 19 35 47-12 35-1 69 38 58 10 91 44 104 50 65c20 49 45 24 13-10 48 5 42-28-1-16C84 6 53-5 48 39Z" />
  </svg>
}

export function Scribble({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 260 36" fill="none" aria-hidden="true"><path d="M4 23C62 7 147 3 157 10c1 4-27 8-28 12 25-6 75-10 126-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}

export function LoopMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 280 240" fill="none" aria-hidden="true">
    <path d="M35 165C-8 123 48 60 93 48c59-16 58-62 23-42-35 19-45 92-34 161 14 83 70 52 60-1-11-59-70-81-91-45-23 39 16 83 58 62 46-23 75-126 113-108 44 21 46 121 7 130-36 8-31-68 5-97 20-16 37-14 43-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
}
