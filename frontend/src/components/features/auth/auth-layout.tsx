import type { ReactNode } from 'react'
import shenbanLogo from '@/assets/shenban-logo.png'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  navigation?: ReactNode
}

export default function AuthLayout({ title, description, children, navigation }: AuthLayoutProps) {
  return (
    <main className={`relative mx-auto grid min-h-[100dvh] w-full max-w-[1920px] grid-cols-1 items-center px-6 pb-12 ${navigation ? 'pt-24 md:pt-28' : 'pt-12 md:pt-16'} md:grid-cols-2 md:px-12 md:pb-16 lg:px-20`}>
      <title>{`${title} · Shenban`}</title>
      {navigation && <nav aria-label="Page navigation" className="absolute top-4 left-6 md:top-6 md:left-12 lg:left-20">{navigation}</nav>}
      <aside aria-label="Shenban" className="hidden flex-col items-center justify-center pb-3 md:flex">
        <img src={shenbanLogo} alt="" className="w-[230px] lg:w-[280px] 2xl:w-[330px]" />
        <p className="mt-9 text-[46px] font-semibold tracking-[-0.035em] text-shenban lg:text-[52px] 2xl:text-[60px]">SHENBAN</p>
      </aside>
      <section aria-labelledby="auth-heading" className="mx-auto w-full max-w-[384px] xl:max-w-[420px] 2xl:max-w-[480px]">
        <header className="mb-9 text-center">
          <img src={shenbanLogo} alt="Shenban" className="mx-auto mb-7 h-12 w-12 object-contain" />
          <h1 id="auth-heading" className="text-[29px] leading-tight font-semibold tracking-[-0.035em] text-zinc-800 sm:text-[31px] 2xl:text-[36px]">{title}</h1>
          <p className="mt-3 text-[15px] leading-6 text-muted 2xl:text-lg">{description}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
