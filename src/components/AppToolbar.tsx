import { FolderOpen, GitBranch, Link, RefreshCw, RotateCw, Send } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GitAction, RepoSnapshot } from '../types/git'

type AppToolbarProps = {
  snapshot: RepoSnapshot
  busyAction: GitAction | 'select' | 'refresh' | ''
  onSelectRepository: () => void
  onRefresh: () => void
  onConnectRemote: () => void
  onPull: () => void
  onPush: () => void
}

export function AppToolbar({
  snapshot,
  busyAction,
  onSelectRepository,
  onRefresh,
  onConnectRemote,
  onPull,
  onPush,
}: AppToolbarProps) {
  const hasRepo = Boolean(snapshot.repoPath)
  const busy = Boolean(busyAction)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2">
        <ToolbarButton label="Open" icon={<FolderOpen size={16} />} disabled={busy} onClick={onSelectRepository} />
        <ToolbarButton label="Refresh" icon={<RefreshCw size={16} className={busyAction === 'refresh' ? 'animate-spin' : ''} />} disabled={!hasRepo || busy} onClick={onRefresh} />
        <ToolbarButton label="Remote" icon={<Link size={16} />} disabled={!hasRepo || busy} onClick={onConnectRemote} />
        <div className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Pull" icon={<RotateCw size={16} />} disabled={!hasRepo || busy} onClick={onPull} />
        <ToolbarButton label="Push" icon={<Send size={16} />} disabled={!hasRepo || busy} onClick={onPush} />
      </div>

      <div className="flex min-w-0 items-center gap-3 text-sm">
        <div className="hidden min-w-0 max-w-[520px] truncate text-slate-500 md:block" title={snapshot.repoPath}>
          {snapshot.repoPath || '저장소를 선택하세요'}
        </div>
        <div className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 font-medium text-slate-700">
          <GitBranch size={15} />
          <span className="max-w-44 truncate">{snapshot.currentBranch || '-'}</span>
        </div>
        <StatusPill label="ahead" value={snapshot.ahead} />
        <StatusPill label="behind" value={snapshot.behind} warn={snapshot.behind > 0} />
        <span className={`rounded px-2 py-1 text-xs font-semibold ${snapshot.isClean ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {snapshot.isClean ? 'clean' : 'dirty'}
        </span>
      </div>
    </header>
  )
}

function ToolbarButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  )
}

function StatusPill({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${warn ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
      {label} {value}
    </span>
  )
}
