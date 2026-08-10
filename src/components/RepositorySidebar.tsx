import { GitBranch, GitFork, Radio } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { ReactNode } from 'react'
import type { RepoSnapshot } from '../types/git'

type RepositorySidebarProps = {
  snapshot: RepoSnapshot
  onBranchContextMenu: (event: MouseEvent, branch: string) => void
}

export function RepositorySidebar({ snapshot, onBranchContextMenu }: RepositorySidebarProps) {
  return (
    <aside className="flex min-h-0 w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 bg-white p-3">
        <h1 className="text-base font-semibold text-slate-950">Local Git Desk</h1>
        <p className="mt-1 truncate text-xs text-slate-500" title={snapshot.remoteUrl || 'remote 없음'}>
          {snapshot.remoteUrl || 'remote 없음'}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        <BranchSection
          title="Local Branches"
          icon={<GitBranch size={15} />}
          branches={snapshot.localBranches}
          current={snapshot.currentBranch}
          onBranchContextMenu={onBranchContextMenu}
        />
        <BranchSection
          title="Remote Branches"
          icon={<Radio size={15} />}
          branches={snapshot.remoteBranches}
          onBranchContextMenu={onBranchContextMenu}
        />
      </div>
    </aside>
  )
}

function BranchSection({
  title,
  icon,
  branches,
  current,
  onBranchContextMenu,
}: {
  title: string
  icon: ReactNode
  branches: string[]
  current?: string
  onBranchContextMenu: (event: MouseEvent, branch: string) => void
}) {
  return (
    <section className="mb-4">
      <div className="mb-1 flex h-7 items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </div>
      <div className="space-y-0.5">
        {branches.map((branch) => (
          <button
            key={branch}
            type="button"
            onContextMenu={(event) => onBranchContextMenu(event, branch)}
            className={`flex h-8 w-full items-center gap-2 rounded px-2 text-left text-sm transition hover:bg-slate-200 ${branch === current ? 'bg-sky-100 font-semibold text-sky-800' : 'text-slate-700'}`}
          >
            <GitFork size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{branch}</span>
          </button>
        ))}
        {branches.length === 0 && <p className="px-2 py-1 text-sm text-slate-400">표시할 브랜치가 없습니다.</p>}
      </div>
    </section>
  )
}
