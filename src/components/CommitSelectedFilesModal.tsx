import { useState } from "react"
import type { ChangedFile } from "../types/git"
import { CheckSquare } from "lucide-react"

type CommitSelectedFilesModalProps = {
  files: ChangedFile[]
  open: boolean
  onClose: () => void
  onSubmit: (message: string) => void
}

export function CommitSelectedFilesModal({
  files,
  open,
  onClose,
  onSubmit,
}: CommitSelectedFilesModalProps) {
  const [commitMessage, setCommitMessage] = useState<string>('');
  const  trimmedMessage = commitMessage.trim();
  if (!open) return null;
  
  function close() {
    setCommitMessage('');
    onClose();
  }

  function submit(message: string) {
    setCommitMessage('');
    onSubmit(message);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <form
        className="flex max-h-[82vh] w-full max-w-2xl flex-col rounded-lg border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmedMessage && files.length > 0) submit(trimmedMessage);
        }}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <CheckSquare size={18} className="text-sky-600"/>
          <h2 className="text-sm font-semibold text-slate-950">Commit Staged Changes</h2>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <div className="rounded-md border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Files to stage
            </div>

            <div className="app-scrollbar max-h-48 overflow-auto p-1.5">
              {files.map((file) => (
                <div
                  key={`${file.path}-${file.index}-${file.workingTree}`}
                  className="grid h-8 grid-cols-[58px_1fr] items-center gap-2 rounded px-2 text-sm"
                >   
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-center font-mono text-[11px] text-slate-600">
                    {file.index ||'-'} / {file.workingTree || '-'}
                  </span>
                  <span className="truncate text-[13px] text-slate-800" title={file.path}>
                    {file.path}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor="commit-message"
            >
              Commit message
            </label>
            <textarea 
              id="commit-message"
              autoFocus
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="staged 변경사항에 대한 커밋 메시지를 입력하세요"
              rows={5}
              className="mt-2 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm leading-5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>
      
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
					<button
						type="button"
						onClick={close}
						className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!trimmedMessage || files.length === 0}
						className="h-9 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Commit
					</button>
        </div>
      </form>
    </div>
  );
};