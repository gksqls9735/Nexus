import { AlertTriangle, Trash2 } from 'lucide-react'
import type { BranchDeleteModalState } from '../types/modal'

type BranchDeleteModalProps = {
  modal: BranchDeleteModalState
  onClose: () => void
  onConfirm: (branch: string, force: boolean) => void
}

export function BranchDeleteModal({ modal, onClose, onConfirm }: BranchDeleteModalProps) {
  if (!modal) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <section className="w-full max-w-md rounded-lg border border-red-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-red-100 px-4 py-3">
          <AlertTriangle size={18} className="text-red-600" />
          <h2 className="text-sm font-semibold text-slate-950">
            {modal.force ? 'Force Delete Branch' : 'Delete Branch'}
          </h2>
        </div>

        <div className="p-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-950">{modal.branch}</span> 브랜치를 삭제할까요?
          </p>
          {modal.force && (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              강제 삭제는 merge 되지 않은 커밋도 제거할 수 있습니다.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(modal.branch, modal.force)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 size={15} />
            {modal.force ? 'Force Delete' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  )
}
