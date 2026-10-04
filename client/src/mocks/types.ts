import type { ComponentType } from "react"

export type Page =
  | "Overview"
  | "Inbox"
  | "AI Agents"
  | "Knowledge Base"
  | "Tickets"
  | "Customers"
  | "Analytics"
  | "Settings"

export type Message = {
  from: "customer" | "ai" | "agent"
  text: string
  time: string
}

export type Conversation = {
  id: number
  name: string
  initials: string
  color: string
  company: string
  subject: string
  preview: string
  time: string
  status: string
  channel: string
  assignee: string
  email: string
  messages: Message[]
}

export type TicketItem = {
  id: string
  customer: string
  initials: string
  color: string
  subject: string
  priority: string
  assignee: string
  status: string
  updated: string
}

export type DocumentSource = {
  title: string
  type: "Document" | "Website" | "FAQ"
  category: string
  status: string
  updated: string
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
}

export type Agent = {
  name: string
  role: string
  description: string
  model: string
  conversations: string
  rate: string
  status: string
  color: string
}

export type NavigationItem = {
  name: Page
  path: string
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  count?: number
}
