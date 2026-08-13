import { FileText, Info } from 'lucide-react'
import type { CommitChangedFile, CommitDetailsData } from '../types/git'
import { Panel } from './ui/Panel'
import { useState } from 'react'
import { CommitFileDiffModal } from './CommitFileDiffModal'

type CommitDetailsProps = {
  details?: CommitDetailsData
  loading: boolean
}

export function CommitDetails({ details, loading }: CommitDetailsProps) {
  const [selectedFile, setSelectedFile] = useState<{
    commitHash: string, 
    file: CommitChangedFile
  } | null>(null);

  const diffFile = selectedFile && selectedFile.commitHash === details?.hash
    ? selectedFile.file
    : null;

  return (
    <>
      <Panel title="Details" icon={<Info size={18} />}>
        <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden p-3 text-sm">
          {!details && !loading && (
            <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-500">
              커밋을 선택하면 커밋 메시지와 변경 파일이 표시됩니다.
            </div>
          )}

          {loading && (
            <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-500">
              커밋 상세를 불러오는 중입니다.
            </div>
          )}

          {details && (
            <>
              <section className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Commit message</h3>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm font-medium leading-5 text-slate-950">{details.message}</p>
              </section>

              <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-slate-200 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FileText size={15} />
                  Changed in this commit
                </div>
                <div className="app-scrollbar min-h-0 flex-1 overflow-auto p-1.5">
                  {details.files.map((file) => (
                    <div
                      key={`${file.status}-${file.path}`}
                      className="grid h-8 grid-cols-[42px_1fr] items-center gap-2 rounded px-2 text-sm hover:bg-slate-50"
                      onDoubleClick={() => setSelectedFile({ commitHash: details.hash, file })}
                    >
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-slate-600">
                        {file.status}
                      </span>
                      <span className="truncate text-[13px] text-slate-800" title={file.path}>
                        {file.path}
                      </span>
                    </div>
                  ))}
                  {details.files.length === 0 && (
                    <p className="px-2 py-6 text-center text-sm text-slate-500">표시할 변경 파일이 없습니다.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </Panel>
      <CommitFileDiffModal file={diffFile} onClose={() => setSelectedFile(null)} />
    </>
  );
}
