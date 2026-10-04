import { FileText, MessageCircle, Globe2 } from "lucide-react"
import type { DocumentSource } from "./types"

export const documents: DocumentSource[] = [
  {
    title: "Getting started with your workspace",
    type: "Document",
    category: "Onboarding",
    status: "Synced",
    updated: "2 hours ago",
    icon: FileText,
  },
  {
    title: "Billing and subscription FAQs",
    type: "FAQ",
    category: "Billing",
    status: "Synced",
    updated: "Yesterday",
    icon: MessageCircle,
  },
  {
    title: "help.supportai.com",
    type: "Website",
    category: "Help Center",
    status: "Synced",
    updated: "Yesterday",
    icon: Globe2,
  },
  {
    title: "API documentation",
    type: "Website",
    category: "Developers",
    status: "Syncing",
    updated: "2 days ago",
    icon: Globe2,
  },
  {
    title: "Privacy and security policy",
    type: "Document",
    category: "Policies",
    status: "Synced",
    updated: "3 days ago",
    icon: FileText,
  },
]
