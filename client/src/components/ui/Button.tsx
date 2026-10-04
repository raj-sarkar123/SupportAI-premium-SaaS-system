import type { ComponentType, ReactNode } from "react"

export interface ButtonProps {
  children?: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  icon?: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  title?: string
}

export default function Button({
  children,
  variant = "secondary",
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  title,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      title={title}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </button>
  )
}
