import {
  LayoutDashboard,
  Inbox,
  Bot,
  BookOpen,
  Ticket,
  Users,
  BarChart3,
  Settings2,
} from "lucide-react"
import type { NavigationItem } from "./types"

export const navigation: NavigationItem[] = [
  { name: "Overview", path: "/overview", icon: LayoutDashboard },
  { name: "Inbox", path: "/inbox", icon: Inbox, count: 8 },
  { name: "AI Agents", path: "/agents", icon: Bot },
  { name: "Knowledge Base", path: "/knowledge", icon: BookOpen },
  { name: "Tickets", path: "/tickets", icon: Ticket, count: 3 },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Settings", path: "/settings/general", icon: Settings2 },
]
