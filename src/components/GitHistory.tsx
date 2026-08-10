import { GitCommitHorizontal } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { GitHistoryItem } from '../types/git'
import { formatCommitDate } from '../utils/dateFormat'
import { Panel } from './ui/Panel'

type GitHistoryProps = {
  commits: GitHistoryItem[]
  selectedCommit: string
  onSelectCommit: (commitHash: string) => void
  onCommitContextMenu: (event: MouseEvent, commit: GitHistoryItem) => void
}

export function GitHistory({ commits, selectedCommit, onSelectCommit, onCommitContextMenu }: GitHistoryProps) {
  return (
    <Panel title="History" icon={<GitCommitHorizontal size={18} />}>
      <div className="h-full min-h-0 overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-16 border-b border-slate-200 px-3 py-2">Graph</th>
              <th className="border-b border-slate-200 px-3 py-2">Message</th>
              <th className="w-36 border-b border-slate-200 px-3 py-2">Hash</th>
              <th className="w-44 border-b border-slate-200 px-3 py-2">Author</th>
              <th className="w-40 border-b border-slate-200 px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {commits.map((commit, index) => (
              <tr
                key={commit.hash}
                onClick={() => onSelectCommit(commit.hash)}
                onContextMenu={(event) => onCommitContextMenu(event, commit)}
                className={`cursor-default transition hover:bg-slate-50 ${selectedCommit === commit.hash ? 'bg-sky-50' : ''}`}
              >
                <td className="border-b border-slate-100 px-3 py-0">
                  <GraphCell
                    isFirst={index === 0}
                    isLast={index === commits.length - 1}
                    syncStatus={commit.syncStatus}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-1.5 text-slate-900">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{commit.message}</span>
                    {commit.syncStatus === 'unpushed' && (
                      <span className="shrink-0 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">unpushed</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500">{commit.hash.slice(0, 10)}</td>
                <td className="truncate border-b border-slate-100 px-3 py-1.5 text-slate-600">{commit.author}</td>
                <td className="whitespace-nowrap border-b border-slate-100 px-3 py-1.5 text-slate-600" title={commit.date}>
                  {formatCommitDate(commit.date)}
                </td>
              </tr>
            ))}
            {commits.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-slate-500">
                  저장소를 선택하면 최근 커밋이 표시됩니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function GraphCell({
  isFirst,
  isLast,
  syncStatus,
}: {
  isFirst: boolean
  isLast: boolean
  syncStatus: GitHistoryItem['syncStatus']
}) {
  const colorClass = syncStatus === 'unpushed' ? 'border-amber-500 bg-amber-50' : 'border-sky-500 bg-white'
  const lineClass = syncStatus === 'unpushed' ? 'bg-amber-300' : 'bg-slate-300'

  return (
    <div className="relative flex h-12 items-center justify-center">
      <span
        className={`absolute left-1/2 w-px -translate-x-1/2 ${lineClass} ${isFirst ? 'top-1/2' : 'top-0'} ${isLast ? 'bottom-1/2' : 'bottom-0'}`}
      />
      <span className={`relative h-3 w-3 rounded-full border-2 ${colorClass}`} />
    </div>
  )
}
