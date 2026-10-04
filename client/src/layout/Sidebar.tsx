import { useNavigate, useLocation } from "react-router-dom"
import {
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronsUpDown,
  Settings2,
  CircleHelp,
  MoreHorizontal,
} from "lucide-react"
import { navigation } from "../mocks/navigation"
import { Avatar } from "../components/ui"
import { useApp } from "../context/AppContext"
import { useAuth } from "../context/AuthContext"

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, notify } = useApp()
  const { user } = useAuth()

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  const isItemActive = (path: string) => {
    if (path === "/overview") return location.pathname === "/overview" || location.pathname === "/"
    if (path === "/inbox") return location.pathname.startsWith("/inbox")
    if (path === "/agents") return location.pathname.startsWith("/agents")
    if (path === "/knowledge") return location.pathname.startsWith("/knowledge")
    if (path === "/tickets") return location.pathname.startsWith("/tickets")
    if (path === "/customers") return location.pathname.startsWith("/customers")
    if (path === "/analytics") return location.pathname.startsWith("/analytics")
    if (path === "/settings/general") return location.pathname.startsWith("/settings")
    return false
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand-row">
        <div className="brand-icon">
          <Sparkles size={19} fill="currentColor" strokeWidth={1.6} />
        </div>
        <span className="brand-name">
          Support<span>AI</span>
        </span>
        <button
          className="icon-button sidebar-toggle"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} />
          ) : (
            <PanelLeftClose size={17} />
          )}
        </button>
        <button
          className="icon-button mobile-close"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>
      <div
        className="workspace-switch"
        onClick={() => notify("You're in the Acme workspace")}
        role="button"
        tabIndex={0}
      >
        <span className="workspace-mark">A</span>
        <span className="workspace-info">
          <strong>Acme Inc.</strong>
          <small>Pro workspace</small>
        </span>
        <ChevronsUpDown size={15} className="workspace-chevron" />
      </div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav">
        {navigation.slice(0, 7).map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.path)
          return (
            <button
              key={item.name}
              title={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.85} />
              <span>{item.name}</span>
              {"count" in item && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-label">PREFERENCES</div>
        <button
          title="Settings"
          onClick={() => handleNavClick("/settings/general")}
          className={`nav-item ${location.pathname.startsWith("/settings") ? "active" : ""}`}
        >
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
        <button
          title="Help & support"
          onClick={() => notify("Need help? Email hello@supportai.com")}
          className="nav-item"
        >
          <CircleHelp size={18} />
          <span>Help & support</span>
        </button>
        <div className="sidebar-divider" />
        <div className="sidebar-user">
          <Avatar initials={initials} color="dark" size="sm" />
          <span className="sidebar-user-info">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.role === "admin" ? "Workspace admin" : "Agent"}</small>
          </span>
          <MoreHorizontal size={17} />
        </div>
      </div>
    </aside>
  )
}
