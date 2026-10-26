import type { HTMLAttributes } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
