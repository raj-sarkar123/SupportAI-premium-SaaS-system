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
  const tone =
    status === "Resolved" ||
    status === "Synced" ||
    status === "Active" ||
    status === "AI handled"
      ? "green"
      : status === "Escalated" || status === "High"
        ? "orange"
        : status === "Open" || status === "Syncing"
          ? "blue"
          : "neutral"

  return (
    <Badge tone={tone} dot>
      {status}
    </Badge>
  )
}
