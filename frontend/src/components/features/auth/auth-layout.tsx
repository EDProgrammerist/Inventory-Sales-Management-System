import type { ReactNode } from 'react'
import kanbanLogo from '@/assets/kanban-logo.svg'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="mx-auto grid min-h-[100dvh] w-full max-w-[1920px] grid-cols-1 items-center px-6 py-12 md:grid-cols-2 md:px-12 md:py-16 lg:px-20">
      <title>{`${title} · Kanban`}</title>
      <aside aria-label="Kanban" className="hidden flex-col items-center justify-center pb-3 md:flex">
        <img src={kanbanLogo} alt="" className="w-[230px] lg:w-[280px] 2xl:w-[330px]" />
        <p className="mt-9 text-[46px] font-semibold tracking-[-0.035em] text-[#009ed8] lg:text-[52px] 2xl:text-[60px]">KANBAN</p>
      </aside>
      <section aria-labelledby="auth-heading" className="mx-auto w-full max-w-[384px] xl:max-w-[420px] 2xl:max-w-[480px]">
        <header className="mb-9 text-center">
          <img src={kanbanLogo} alt="Kanban" className="mx-auto mb-7 h-12 w-12" />
          <h1 id="auth-heading" className="text-[29px] leading-tight font-semibold tracking-[-0.035em] text-zinc-800 sm:text-[31px] 2xl:text-[36px]">{title}</h1>
          <p className="mt-3 text-[15px] leading-6 text-[#737b8b] 2xl:text-lg">{description}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
