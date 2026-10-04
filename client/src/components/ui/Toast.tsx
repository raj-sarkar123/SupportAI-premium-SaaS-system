import { Check, X } from "lucide-react"

export interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="toast" role="status">
      <span>
        <Check size={15} />
      </span>
      {message}
      <button onClick={onClose} aria-label="Dismiss notification">
        <X size={14} />
      </button>
    </div>
  )
}
