import { Link } from 'lucide-react'
import { useState } from 'react'
import type { RemoteConnectModalState } from '../types/modal'

type RemoteConnectModalProps = {
  modal: RemoteConnectModalState
  onClose: () => void
  onSubmit: (remoteUrl: string) => void
}

export function RemoteConnectModal({ modal, onClose, onSubmit }: RemoteConnectModalProps) {
  if (!modal) {
    return null
  }

  return <RemoteConnectDialog modal={modal} onClose={onClose} onSubmit={onSubmit} />
}

function RemoteConnectDialog({
  modal,
  onClose,
  onSubmit,
}: {
  modal: NonNullable<RemoteConnectModalState>
  onClose: () => void
  onSubmit: (remoteUrl: string) => void
}) {
  const [remoteUrl, setRemoteUrl] = useState(modal.remoteUrl)
  const trimmedRemoteUrl = remoteUrl.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <form
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmedRemoteUrl) {
            onSubmit(trimmedRemoteUrl)
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Link size={18} className="text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-950">Connect Remote Repository</h2>
        </div>

        <div className="p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="remote-url">
            Origin URL
          </label>
          <input
            id="remote-url"
            autoFocus
            value={remoteUrl}
            onChange={(event) => setRemoteUrl(event.target.value)}
            placeholder="https://github.com/user/repository.git"
            className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            origin remote가 없으면 추가하고, 이미 있으면 URL을 교체합니다.
          </p>
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
            disabled={!trimmedRemoteUrl}
            className="h-9 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      </form>
    </div>
  )
}
