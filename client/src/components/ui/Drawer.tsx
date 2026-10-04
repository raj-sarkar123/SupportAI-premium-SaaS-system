import type { ReactNode } from "react"
import { X } from "lucide-react"

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: DrawerProps) {
  if (!isOpen) return null

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-top">
          <span>{title}</span>
          <button className="icon-button" onClick={onClose} aria-label="Close drawer">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
