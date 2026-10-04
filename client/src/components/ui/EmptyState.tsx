import type { ComponentType } from "react"
import { Search } from "lucide-react"

export interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  className?: string
}

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      <span className="empty-icon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
