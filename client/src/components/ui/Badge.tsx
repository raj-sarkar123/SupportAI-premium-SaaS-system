import type { ReactNode } from "react"

export interface BadgeProps {
  children: ReactNode
  tone?: "green" | "blue" | "orange" | "neutral" | "rose" | string
  dot?: boolean
  className?: string
}

export default function Badge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge badge-${tone} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const tone =
    normalized === "resolved" ||
    normalized === "synced" ||
    normalized === "active" ||
    normalized === "ready" ||
    normalized === "ai handled"
      ? "green"
      : normalized === "failed" || normalized === "rose"
        ? "rose"
        : normalized === "escalated" || normalized === "high"
          ? "orange"
          : normalized === "open" ||
              normalized === "syncing" ||
              normalized === "processing"
            ? "blue"
            : "neutral"

  const display = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Badge tone={tone} dot>
      {display}
    </Badge>
  )
}
