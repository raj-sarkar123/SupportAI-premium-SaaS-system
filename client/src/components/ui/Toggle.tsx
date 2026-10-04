import { useState } from "react"

export interface ToggleProps {
  title: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export default function Toggle({
  title,
  description,
  checked: controlledChecked,
  defaultChecked = true,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = controlledChecked !== undefined
  const isOn = isControlled ? controlledChecked : internalChecked

  const handleToggle = () => {
    if (disabled) return
    const next = !isOn
    if (!isControlled) {
      setInternalChecked(next)
    }
    onChange?.(next)
  }

  return (
    <div className={`setting-toggle ${className}`.trim()}>
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      <button
        type="button"
        className={`switch ${isOn ? "on" : ""}`}
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={handleToggle}
      >
        <span />
      </button>
    </div>
  )
}
