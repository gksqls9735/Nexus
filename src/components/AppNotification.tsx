import { X } from 'lucide-react'

type AppNotificationProps = {
  message: string
  error: string
  onClose: () => void
}

export function AppNotification({ message, error, onClose }: AppNotificationProps) {
  if (!message && !error) {
    return null
  }

  return (
    <div className="fixed left-1/2 top-14 z-40 w-[min(420px,calc(100vw-32px))] -translate-x-1/2 pt-3">
      <div className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
        <pre className="app-scrollbar max-h-28 overflow-auto whitespace-pre-wrap font-sans">{error || message}</pre>
        <button
          type="button"
          title="Close notification"
          aria-label="Close notification"
          onClick={onClose}
          className={`ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${error ? 'hover:bg-red-100' : 'hover:bg-emerald-100'}`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
