import type { ComponentType, ReactNode } from "react"
import { X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  icon?: ComponentType<{ size?: number; className?: string }>
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  maxWidth,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="form-modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || Icon) && (
          <div className="modal-title">
            <div>
              {Icon && (
                <span className="modal-icon">
                  <Icon size={21} />
                </span>
              )}
              {title && <h2>{title}</h2>}
              {description && <p>{description}</p>}
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close modal">
              <X size={19} />
            </button>
          </div>
        )}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
