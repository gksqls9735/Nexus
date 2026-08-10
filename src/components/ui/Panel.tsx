import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  icon: ReactNode
  children: ReactNode
}

export function Panel({ title, icon, children }: PanelProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-12 items-center gap-2 border-b border-slate-200 px-4 text-sm font-semibold text-slate-950">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  )
}
