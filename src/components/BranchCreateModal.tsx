import { GitBranch } from 'lucide-react'
import { useState } from 'react'
import type { BranchCreateModalState } from '../types/modal'

type BranchCreateModalProps = {
  modal: BranchCreateModalState
  onClose: () => void
  onSubmit: (branchName: string, checkoutAfterCreate: boolean) => void
}

export function BranchCreateModal({ modal, onClose, onSubmit }: BranchCreateModalProps) {
  if (!modal) {
    return null
  }

  return <BranchCreateDialog modal={modal} onClose={onClose} onSubmit={onSubmit} />
}

type BranchCreateDialogProps = {
  modal: NonNullable<BranchCreateModalState>
  onClose: () => void
  onSubmit: (branchName: string, checkoutAfterCreate: boolean) => void
}

function BranchCreateDialog({ modal, onClose, onSubmit }: BranchCreateDialogProps) {
  const [branchName, setBranchName] = useState('')
  const checkoutAfterCreate = modal.mode === 'createAndCheckout'
  const trimmedBranchName = branchName.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <form
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmedBranchName) {
            onSubmit(trimmedBranchName, checkoutAfterCreate)
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <GitBranch size={18} className="text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-950">
            {checkoutAfterCreate ? 'Create Branch and Checkout' : 'Create Branch'}
          </h2>
        </div>

        <div className="p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="branch-name">
            Branch name
          </label>
          <input
            id="branch-name"
            autoFocus
            value={branchName}
            onChange={(event) => setBranchName(event.target.value)}
            placeholder="feature/my-branch"
            className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          {checkoutAfterCreate && (
            <p className="mt-2 text-xs text-slate-500">브랜치를 생성한 뒤 바로 checkout 합니다.</p>
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
            type="submit"
            disabled={!trimmedBranchName}
            className="h-9 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
