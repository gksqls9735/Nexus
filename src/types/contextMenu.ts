import type { ReactNode } from 'react'

export type ContextMenuItem = {
  id: string
  label: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
}

export type ContextMenuState = {
  x: number
  y: number
  items: ContextMenuItem[]
} | null
