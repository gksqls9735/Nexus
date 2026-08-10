import { useEffect } from 'react'
import type { ContextMenuState } from '../types/contextMenu'

type ContextMenuProps = {
  menu: ContextMenuState
  onClose: () => void
}

export function ContextMenu({ menu, onClose }: ContextMenuProps) {
  useEffect(() => {
    if (!menu) return

    window.addEventListener('click', onClose)
    window.addEventListener('blur', onClose)
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('click', onClose)
      window.removeEventListener('blur', onClose)
      window.removeEventListener('keydown', closeOnEscape)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
  }, [menu, onClose])

  if (!menu) {
    return null
  }

  return (
    <div
      className="fixed z-50 min-w-56 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-sm shadow-xl"
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => event.stopPropagation()}
    >
      {menu.items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          onClick={() => {
            item.onSelect()
            onClose()
          }}
          className={`flex h-9 w-full items-center gap-2 px-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${item.danger ? 'text-red-700 hover:bg-red-50' : 'text-slate-800 hover:bg-slate-100'}`}
        >
          <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}
