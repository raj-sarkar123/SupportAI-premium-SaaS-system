import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowRight, MessageSquare } from "lucide-react"
import { navigation } from "../mocks/navigation"
import { conversations } from "../mocks/conversations"
import { useApp } from "../context/AppContext"

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandOpen, setCommandOpen, setSelectedConversation } = useApp()
  const [commandQuery, setCommandQuery] = useState("")

  if (!commandOpen) return null

  const handleClose = () => {
    setCommandOpen(false)
    setCommandQuery("")
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id)
    navigate("/inbox")
    handleClose()
  }

  const matchedNavigation = navigation.filter((item) =>
    item.name.toLowerCase().includes(commandQuery.toLowerCase()),
  )

  const matchedConversations = commandQuery
    ? conversations.filter((c) =>
        `${c.name} ${c.subject}`
          .toLowerCase()
          .includes(commandQuery.toLowerCase()),
      )
    : []

  const hasResults = matchedNavigation.length > 0 || matchedConversations.length > 0

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="command-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="command-input">
          <Search size={19} />
          <input
            autoFocus
            placeholder="Search pages, conversations, and more..."
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="command-results">
          <span className="command-label">QUICK NAVIGATION</span>
          {matchedNavigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={17} />
                <span>{item.name}</span>
                <ArrowRight size={15} />
              </button>
            )
          })}
          {matchedConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectConversation(c.id)}
            >
              <MessageSquare size={17} />
              <span>
                {c.name} · {c.subject}
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
          {commandQuery && !hasResults && (
            <div className="command-empty">
              No results found for “{commandQuery}”
            </div>
          )}
        </div>
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate
          </span>
          <span>
            <kbd>↵</kbd> to select
          </span>
        </div>
      </div>
    </div>
  )
}
