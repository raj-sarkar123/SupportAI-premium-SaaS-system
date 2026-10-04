export interface AvatarProps {
  initials: string
  color?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Avatar({
  initials,
  color = "violet",
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <span
      className={`avatar avatar-${color} avatar-${size} ${className}`.trim()}
    >
      {initials}
    </span>
  )
}
