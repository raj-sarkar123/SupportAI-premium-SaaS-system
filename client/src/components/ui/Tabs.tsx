import type { ReactNode } from "react"

export interface TabItem {
  id: string
  label: string
  count?: number
}

export interface TabsProps {
  tabs: (string | TabItem)[]
  activeTab: string
  onChange: (tab: string) => void
  variant?: "underline" | "composer"
  className?: string
  extra?: ReactNode
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
  extra,
}: TabsProps) {
  const containerClass =
    variant === "composer" ? "composer-tabs" : "tab-list"

  return (
    <div className={`${containerClass} ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === "string" ? tab : tab.id
        const label = typeof tab === "string" ? tab : tab.label
        const count = typeof tab === "string" ? undefined : tab.count
        const isActive = activeTab === id

        return (
          <button
            key={id}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => onChange(id)}
          >
            {label}
            {count !== undefined && <span className="tab-count"> ({count})</span>}
          </button>
        )
      })}
      {extra}
    </div>
  )
}
