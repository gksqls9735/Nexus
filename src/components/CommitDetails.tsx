import { Info } from 'lucide-react'
import type { GitHistoryItem } from '../types/git'
import { formatCommitDate } from '../utils/dateFormat'
import { Panel } from './ui/Panel'

type CommitDetailsProps = {
  commit?: GitHistoryItem
  message: string
  error: string
}

export function CommitDetails({ commit, message, error }: CommitDetailsProps) {
  return (
    <Panel title="Details" icon={<Info size={18} />}>
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto p-3 text-sm">
        {commit ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="font-medium text-slate-950">{commit.message}</p>
            <dl className="mt-3 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Hash</dt>
              <dd className="font-mono text-slate-700">{commit.hash}</dd>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Author</dt>
              <dd className="text-slate-700">{commit.author}</dd>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Date</dt>
              <dd className="text-slate-700" title={commit.date}>{formatCommitDate(commit.date)}</dd>
            </dl>
          </div>
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-500">
            커밋을 선택하면 상세 정보가 표시됩니다.
          </div>
        )}

        {(message || error) && (
          <div className={`rounded-md border p-3 ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            <pre className="whitespace-pre-wrap font-sans">{error || message}</pre>
          </div>
        )}
      </div>
    </Panel>
  )
}
