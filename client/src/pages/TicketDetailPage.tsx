import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react"
import { Button, Card, Badge, Avatar, StatusBadge } from "../components/ui"
import { tickets } from "../mocks/tickets"
import { useApp } from "../context/AppContext"

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useApp()

  const cleanId = (id || "").replace("#", "")
  const ticket = tickets.find(
    (t) => t.id.replace("#", "").toLowerCase() === cleanId.toLowerCase(),
  ) || {
    id: `#${cleanId || "TK-1042"}`,
    customer: "Liam Chen",
    initials: "LC",
    color: "lavender" as const,
    subject: "Customer Issue & Inquiry",
    priority: "High" as const,
    assignee: "Sarah Miller",
    status: "Open" as const,
    updated: "Just now",
  }

  const [replyText, setReplyText] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: ticket.customer,
      role: "customer",
      initials: ticket.initials,
      color: ticket.color,
      text: `Hello, I'm reaching out regarding "${ticket.subject}". We ran into an issue while performing this operation on our production instance earlier today. Could your team please investigate?`,
      time: ticket.updated || "10:30 AM",
    },
    {
      id: 2,
      sender: "SupportAI Assistant",
      role: "ai",
      initials: "AI",
      color: "peach" as const,
      text: "Thanks for reaching out! We've automatically verified your account settings and checked recent platform logs. A member of our support team has been assigned to assist you with next steps.",
      time: "10:32 AM",
    },
  ])

  const [currentStatus, setCurrentStatus] = useState<string>(ticket.status)

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You (Agent)",
        role: "agent",
        initials: "ME",
        color: "blue" as const,
        text: replyText.trim(),
        time: "Just now",
      },
    ])
    notify("Reply posted to ticket thread")
    setReplyText("")
  }

  const handleResolve = () => {
    setCurrentStatus("Resolved")
    notify(`Ticket ${ticket.id} marked as resolved`)
  }

  return (
    <main className="content">
      <div className="page-intro" style={{ marginBottom: 20 }}>
        <div>
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/tickets")}
            style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Tickets
          </button>
          <div className="eyebrow">ISSUE TRACKING / {ticket.id}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1>{ticket.subject}</h1>
            <StatusBadge status={currentStatus} />
            <Badge
              tone={
                ticket.priority === "High"
                  ? "orange"
                  : ticket.priority === "Medium"
                    ? "blue"
                    : "neutral"
              }
            >
              {ticket.priority} Priority
            </Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {currentStatus !== "Resolved" && (
            <Button variant="primary" icon={CheckCircle2} onClick={handleResolve}>
              Mark Resolved
            </Button>
          )}
          <Button
            icon={ShieldAlert}
            onClick={() => notify("Ticket escalated to tier 2 engineering")}
          >
            Escalate
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.2fr) minmax(300px, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Main Conversation & Activity Thread */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <MessageSquare size={16} color="#6459d8" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#292d3a" }}>Ticket Thread & Activity</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 16,
                    borderRadius: 10,
                    background: m.role === "customer" ? "#fafbfc" : m.role === "ai" ? "#f7f6ff" : "#fff",
                    border: m.role === "agent" ? "1px solid #e1e4eb" : "1px solid #edf0f4",
                  }}
                >
                  <Avatar initials={m.initials} color={m.color} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <strong style={{ fontSize: 12, color: "#2d3240" }}>{m.sender}</strong>
                      <span style={{ fontSize: 10, color: "#9ca2ad" }}>{m.time}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#474d5b", lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} style={{ marginTop: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea
                  rows={3}
                  placeholder="Type your response to the customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    border: "1px solid #e1e4eb",
                    borderRadius: 8,
                    padding: "12px",
                    fontSize: 12,
                    color: "#333846",
                    background: "#fff",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="submit" variant="primary" icon={Send} disabled={!replyText.trim()}>
                    Send Reply
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Ticket Metadata Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#292d3a", marginBottom: 14 }}>
              Customer Information
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avatar initials={ticket.initials} color={ticket.color} size="md" />
              <div>
                <strong style={{ fontSize: 13, color: "#292d3a", display: "block" }}>{ticket.customer}</strong>
                <span style={{ fontSize: 11, color: "#8a929f" }}>customer@company.com</span>
              </div>
            </div>
            <div style={{ height: 1, background: "#edf0f4", margin: "14px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8a929f" }}>Ticket ID</span>
                <strong style={{ color: "#2d3240" }}>{ticket.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8a929f" }}>Assignee</span>
                <strong style={{ color: "#2d3240" }}>{ticket.assignee}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8a929f" }}>Channel</span>
                <strong style={{ color: "#2d3240" }}>Web Portal</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8a929f" }}>Last Activity</span>
                <strong style={{ color: "#2d3240" }}>{ticket.updated}</strong>
              </div>
            </div>
          </Card>

          <Card style={{ padding: "18px", background: "#fbfbfe", border: "1px dashed #d5d3f5" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <Clock size={16} color="#6459d8" />
              <strong style={{ fontSize: 12, color: "#2d3240" }}>SLA Response Target</strong>
            </div>
            <p style={{ fontSize: 11, color: "#79808d", margin: 0 }}>
              First response SLA is met. Resolution window expires in 4 hours.
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}
