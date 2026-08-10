import { AlertTriangle } from 'lucide-react'
import type { ChangedFile } from '../types/git'
import { Panel } from './ui/Panel'

type ChangedFilesProps = {
  files: ChangedFile[]
}

export function ChangedFiles({ files }: ChangedFilesProps) {
  return (
    <Panel title="Changed files" icon={<AlertTriangle size={18} />}>
      <div className="grid h-full min-h-0 content-start gap-2 overflow-auto p-3">
        {files.map((file) => (
          <div
            key={`${file.path}-${file.index}-${file.workingTree}`}
            className="grid grid-cols-[72px_1fr] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <span className="rounded bg-white px-2 py-1 text-center font-mono text-xs text-slate-600">
              {file.index || '-'} / {file.workingTree || '-'}
            </span>
            <span className="truncate font-medium text-slate-800" title={file.path}>
              {file.path}
            </span>
          </div>
        ))}
        {files.length === 0 && (
          <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">
            변경 파일이 없습니다.
          </div>
        )}
      </div>
    </Panel>
  )
}
