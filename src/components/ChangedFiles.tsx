import { AlertTriangle, GitCommitHorizontal } from 'lucide-react'
import type { ChangedFile } from '../types/git'
import { Panel } from './ui/Panel'
import { useState } from 'react'
import { CommitSelectedFilesModal } from './CommitSelectedFilesModal'

type ChangedFilesProps = {
  files: ChangedFile[]
  busy: boolean
  onCommit: (filePaths: string[], message: string) => void
  onStage: (filePaths: string[]) => void
  onUnstage: (filePaths: string[]) => void
}

export function ChangedFiles({ files, busy, onCommit, onStage, onUnstage }: ChangedFilesProps) {
  const [commitModalOpen, setCommitModalOpen] = useState<boolean>(false);
  const stagedFiles = files.filter(isStagedFile);
  const unstagedFiles = files.filter((file) => !isStagedFile(file));
  const allStaged = files.length > 0 && unstagedFiles.length === 0;

  function toggleFile(file: ChangedFile) {
    if (isStagedFile(file)) {
      onUnstage([file.path]);
      return;
    }

    onStage([file.path]);
  };

  function toggleAll() {
    if (allStaged) {
      onUnstage(stagedFiles.map((file) => file.path))
      return
    }

    onStage(unstagedFiles.map((file) => file.path))
  };

  function submitCommit(message: string) {
    onCommit(stagedFiles.map((file) => file.path), message);
    setCommitModalOpen(false);
  };

  return (
    <>
      <Panel title="Changed files" icon={<AlertTriangle size={18} />}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3">
            <label className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={allStaged}
                disabled={files.length === 0 || busy}
                onChange={toggleAll}
                className="h-4 w-4 accent-slate-950"
              />
              <span className="truncate">Select all</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                {stagedFiles.length} staged
              </span>
              <button
                type="button"
                title="Stage selected files and commit staged changes"
                disabled={stagedFiles.length === 0 || busy}
                onClick={() => setCommitModalOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-950 px-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <GitCommitHorizontal size={14} />
                Commit
              </button>
            </div>
          </div>

          <div className="app-scrollbar grid h-full min-h-0 content-start gap-1.5 overflow-auto p-3">
            {files.map((file) => (
              <label
                key={`${file.path}-${file.index}-${file.workingTree}`}
                className="grid h-10 cursor-pointer grid-cols-[18px_64px_1fr] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm transition hover:border-slate-300 hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={isStagedFile(file)}
                  disabled={busy}
                  onChange={() => toggleFile(file)}
                  className="h-4 w-4 accent-slate-950"
                />
                <span className="rounded bg-white px-1.5 py-0.5 text-center font-mono text-[11px] text-slate-600">
                  {file.index || '-'} / {file.workingTree || '-'}
                </span>
                <span className="truncate text-[13px] font-medium text-slate-800" title={file.path}>
                  {file.path}
                </span>
              </label>
            ))}

            {files.length === 0 && (
              <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">
                변경 파일이 없습니다.
              </div>
            )}
          </div>
        </div>
      </Panel>

      <CommitSelectedFilesModal
        files={stagedFiles}
        open={commitModalOpen}
        onClose={() => setCommitModalOpen(false)}
        onSubmit={submitCommit}
      />
    </>
  );
};

function isStagedFile(file: ChangedFile) {
  return Boolean(file.index && file.index !== '?' && file.index !== ' ');
};