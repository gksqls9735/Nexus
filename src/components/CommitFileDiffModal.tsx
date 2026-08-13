import type { CommitChangedFile } from "../types/git";
import { FileDiff, X } from 'lucide-react'

export function CommitFileDiffModal({
  file,
  onClose,
}: {
  file: CommitChangedFile | null;
  onClose: () => void;
}) {
  if (!file) return null;

  const lines = file.patch.trimEnd().split(/\r?\n/);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-5 py-6">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileDiff size={18} className="shrink-0 text-sky-600" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-950" title={file.path}>
                {file.path}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Changed file diff</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close diff"
          >
            <X size={17} />
          </button>
        </div>

        <div className="app-scrollbar min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
          {file.patch.trim() ? (
            <pre className="min-w-max whitespace-pre-wrap font-mono text-xs leading-5 text-slate-100">
              {lines.map((line, index) => (
                <DiffLine key={`${index}-${line}`} line={line} />
              ))}
            </pre>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-slate-700 text-sm text-slate-400">
              이 파일의 텍스트 변경 내용을 표시할 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function DiffLine({ line }: { line: string }) {
  const className = getDiffLineClassName(line);

  return (
    <span className={`${className} block whitespace-pre font-mono`}>
      {line || ' '}
    </span>
  );
};

function getDiffLineClassName(line: string) {
  if (line.startsWith('+++') || line.startsWith('---')) return 'text-slate-300';

  if (line.startsWith('+')) return 'bg-emerald-500/10 text-emerald-200';

  if (line.startsWith('-')) return 'bg-rose-500/10 text-rose-200';

  if (line.startsWith('@@')) return 'bg-sky-500/10 text-sky-200';

  if (line.startsWith('diff --git') || line.startsWith('index ')) return 'text-slate-400';

  return 'text-slate-200';
};