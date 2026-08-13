import { AlertTriangle, GitCommitHorizontal } from 'lucide-react'
import type { ChangedFile } from '../types/git'
import { Panel } from './ui/Panel'
import { useMemo, useState } from 'react'
import { CommitSelectedFilesModal } from './CommitSelectedFilesModal'

type ChangedFilesProps = {
  files: ChangedFile[]
  busy: boolean
  onCommit: (filePaths: string[], message: string) => void
}

export function ChangedFiles({ files, busy, onCommit }: ChangedFilesProps) {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [commitModalOpen, setCommitModalOpen] = useState<boolean>(false);
  const filePaths = useMemo(() => files.map((file) => file.path), [files]);
  const selectedFiles = files.filter((file) => selectedPaths.has(file.path));
  const allSelected = filePaths.length > 0 && filePaths.every((filePath) => selectedPaths.has(filePath));

  function toggleFile(filePath: string) {
    setSelectedPaths((current) => {
      const next = new Set(current);

      if (next.has(filePath)) next.delete(filePath)
      else next.add(filePath);

      return next;
    });
  };

  function toggleAll() {
    setSelectedPaths(allSelected ? new Set() : new Set(filePaths));
  };

  function submitCommit(message: string) {
    onCommit(selectedFiles.map((file) => file.path), message);
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
                checked={allSelected}
                disabled={files.length === 0 || busy}
                onChange={toggleAll}
                className="h-4 w-4 accent-slate-950"
              />
              <span className="truncate">Select all</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                {selectedFiles.length} selected
              </span>
              <button
                type="button"
                title="Stage selected files and commit staged changes"
                disabled={selectedFiles.length === 0 || busy}
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
                  checked={selectedPaths.has(file.path)}
                  disabled={busy}
                  onChange={() => toggleFile(file.path)}
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
        files={selectedFiles}
        open={commitModalOpen}
        onClose={() => setCommitModalOpen(false)}
        onSubmit={submitCommit}
      />
    </>
  );
};
