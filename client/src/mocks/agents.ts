import type { Agent } from "./types"

export const agents: Agent[] = [
  {
    name: "Alex",
    role: "General Support",
    description:
      "Your first line of support. Answers common questions and guides customers to the right place.",
    model: "GPT-4o",
    conversations: "2,840",
    rate: "89.2%",
    status: "Active",
    color: "violet",
  },
  {
    name: "Morgan",
    role: "Billing Specialist",
    description:
      "Handles invoices, subscriptions, refunds, and all things related to payments.",
    model: "GPT-4o",
    conversations: "1,206",
    rate: "94.8%",
    status: "Active",
    color: "sky",
  },
  {
    name: "Taylor",
    role: "Technical Support",
    description:
      "Helps customers troubleshoot integrations, APIs, and technical workflows.",
    model: "Claude 3.5",
    conversations: "856",
    rate: "85.6%",
    status: "Active",
    color: "amber",
  },
]
