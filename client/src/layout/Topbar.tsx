import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
  Ticket,
  Sparkles,
  ArrowRight,
  Settings2,
  Users,
  LogOut,
} from "lucide-react"
import { Avatar, Badge } from "../components/ui"
import { useApp } from "../context/AppContext"
import { useAuth } from "../context/AuthContext"

export default function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setMobileOpen, setCommandOpen, notify } = useApp()
  const { user, logout } = useAuth()

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith("/inbox")) return "Inbox"
    if (path.startsWith("/agents")) return "AI Agents"
    if (path.startsWith("/knowledge")) return "Knowledge Base"
    if (path.startsWith("/tickets")) return "Tickets"
    if (path.startsWith("/customers")) return "Customers"
    if (path.startsWith("/analytics")) return "Analytics"
    if (path.startsWith("/settings")) return "Settings"
    return "Overview"
  }

  const page = getPageTitle()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="breadcrumb-root">Workspace</span>
        <ChevronRight size={15} className="breadcrumb-chevron" />
        <span className="breadcrumb-current">{page}</span>
      </div>
      <div className="topbar-right">
        <button
          className="search-trigger"
          onClick={() => setCommandOpen(true)}
        >
          <Search size={16} />
          <span>Search anything...</span>
          <kbd>⌘ K</kbd>
        </button>
        <button
          className="icon-button topbar-icon"
          title="Notifications"
          onClick={() => {
            setNotificationsOpen(!notificationsOpen)
            setProfileOpen(false)
          }}
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <div className="topbar-separator" />
        <button
          className="profile-trigger"
          onClick={() => {
            setProfileOpen(!profileOpen)
            setNotificationsOpen(false)
          }}
        >
          <Avatar initials={initials} color="dark" size="sm" />
          <span>{user?.name || "User"}</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {notificationsOpen && (
        <div className="popover notifications-popover">
          <div className="popover-head">
            <strong>Notifications</strong>
            <Badge tone="blue">2 new</Badge>
          </div>
          <div className="notification-item">
            <span className="notification-symbol orange">
              <Ticket size={16} />
            </span>
            <div>
              <strong>Ticket needs your attention</strong>
              <p>Liam Chen's issue was escalated by Alex.</p>
              <small>8 min ago</small>
            </div>
          </div>
          <div className="notification-item">
            <span className="notification-symbol violet">
              <Sparkles size={16} />
            </span>
            <div>
              <strong>Weekly report is ready</strong>
              <p>Your AI resolved 89% of conversations.</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <button
            className="popover-footer"
            onClick={() => {
              setNotificationsOpen(false)
              navigate("/inbox")
            }}
          >
            View inbox <ArrowRight size={14} />
          </button>
        </div>
      )}

      {profileOpen && (
        <div className="popover profile-popover">
          <div className="profile-popover-head">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.email || ""}</small>
          </div>
          <button
            onClick={() => {
              navigate("/settings/general")
              setProfileOpen(false)
            }}
          >
            <Settings2 size={16} /> Account settings
          </button>
          <button
            onClick={() => {
              setProfileOpen(false)
              notify("You're already in your workspace")
            }}
          >
            <Users size={16} /> Acme workspace
          </button>
          <button
            onClick={async () => {
              setProfileOpen(false)
              await logout()
              navigate("/login")
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
