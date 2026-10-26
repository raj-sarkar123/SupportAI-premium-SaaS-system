import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Mail,
  Building,
  Calendar,
  MessageSquare,
  Ticket,
  Star,
  Plus,
  ShieldCheck,
  Phone,
} from "lucide-react"
import { Button, Card, Badge, Avatar, StatusBadge } from "../components/ui"
import { conversations } from "../mocks/conversations"
import { tickets } from "../mocks/tickets"
import { useApp } from "../context/AppContext"

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useApp()

  const numId = Number(id)
  const customer = conversations.find((c) => c.id === numId) || {
    id: numId || 1,
    name: "Olivia Rhye",
    initials: "OR",
    color: "peach" as const,
    company: "Layers Design Studio",
    subject: "Billing & Enterprise Inquiries",
    preview: "Active enterprise customer",
    time: "2m",
    status: "Active",
    channel: "Chat",
    assignee: "Support AI",
    email: "olivia@layers.design",
    messages: [
      {
        from: "customer",
        text: "Hi! I'm trying to understand when my next billing cycle starts.",
        time: "10:42 AM",
      },
      {
        from: "ai",
        text: "Hi Olivia! When you upgrade mid-cycle, you're only charged the prorated difference.",
        time: "10:42 AM",
      },
    ],
  }

  const customerTickets = tickets.filter(
    (t) => t.customer.toLowerCase() === customer.name.toLowerCase(),
  )

  const [activeTab, setActiveTab] = useState<"conversations" | "tickets" | "notes">("conversations")
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState<string[]>([
    "Customer requested invoice breakdown for annual billing on Oct 14.",
    "VIP account tier with SLA priority 1.",
  ])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setNotes((prev) => [noteText.trim(), ...prev])
    notify("Customer note saved")
    setNoteText("")
  }

  return (
    <main className="content">
      <div className="page-intro" style={{ marginBottom: 20 }}>
        <div>
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/customers")}
            style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Customers
          </button>
          <div className="eyebrow">YOUR PEOPLE / CUSTOMER #{customer.id}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Avatar initials={customer.initials} color={customer.color} size="lg" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1>{customer.name}</h1>
                <Badge tone="green" dot>
                  Active Customer
                </Badge>
              </div>
              <p style={{ margin: "4px 0 0" }}>
                {customer.company} · {customer.email}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="primary"
            icon={MessageSquare}
            onClick={() => {
              notify(`Opening chat thread with ${customer.name}`)
              navigate("/inbox")
            }}
          >
            Message Customer
          </Button>
          <Button
            icon={Plus}
            onClick={() => notify(`New ticket initiated for ${customer.name}`)}
          >
            Create Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards for Customer */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}>
        <Card style={{ padding: "16px" }}>
          <span style={{ fontSize: 11, color: "#8a929f" }}>Lifetime CSAT</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ color: "#e5a13b", fontSize: 18 }}>★</span>
            <strong style={{ fontSize: 22, color: "#292d3a" }}>4.9</strong>
            <span style={{ fontSize: 10, color: "#8a929f" }}>/ 5.0</span>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <span style={{ fontSize: 11, color: "#8a929f" }}>Total Conversations</span>
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 22, color: "#292d3a" }}>18</strong>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <span style={{ fontSize: 11, color: "#8a929f" }}>Active Tickets</span>
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 22, color: "#292d3a" }}>
              {customerTickets.length > 0 ? customerTickets.length : 1}
            </strong>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <span style={{ fontSize: 11, color: "#8a929f" }}>Customer Tier</span>
          <div style={{ marginTop: 8 }}>
            <Badge tone="blue">Enterprise Plus</Badge>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Main Content with Tabs */}
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setActiveTab("conversations")}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 650,
                border: activeTab === "conversations" ? "1.5px solid #6459d8" : "1px solid #e1e4eb",
                background: activeTab === "conversations" ? "#f0efff" : "#fff",
                color: activeTab === "conversations" ? "#5549c5" : "#606775",
                cursor: "pointer",
              }}
            >
              Recent Conversations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 650,
                border: activeTab === "tickets" ? "1.5px solid #6459d8" : "1px solid #e1e4eb",
                background: activeTab === "tickets" ? "#f0efff" : "#fff",
                color: activeTab === "tickets" ? "#5549c5" : "#606775",
                cursor: "pointer",
              }}
            >
              Tickets ({customerTickets.length > 0 ? customerTickets.length : 1})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 650,
                border: activeTab === "notes" ? "1.5px solid #6459d8" : "1px solid #e1e4eb",
                background: activeTab === "notes" ? "#f0efff" : "#fff",
                color: activeTab === "notes" ? "#5549c5" : "#606775",
                cursor: "pointer",
              }}
            >
              Team Notes ({notes.length})
            </button>
          </div>

          {activeTab === "conversations" && (
            <Card style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <strong style={{ fontSize: 13, color: "#2d3240" }}>{customer.subject}</strong>
                <span style={{ fontSize: 11, color: "#8a929f" }}>Last active: {customer.time} ago</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {customer.messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: m.from === "customer" ? "#fafbfc" : "#f7f6ff",
                      border: "1px solid #edf0f4",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong style={{ fontSize: 11.5, color: "#333846" }}>
                        {m.from === "customer" ? customer.name : "Support AI"}
                      </strong>
                      <span style={{ fontSize: 10, color: "#9ca2ad" }}>{m.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#484f5d", margin: 0, lineHeight: 1.5 }}>{m.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "tickets" && (
            <Card style={{ padding: "20px" }}>
              {(customerTickets.length > 0 ? customerTickets : [
                {
                  id: "#TK-1042",
                  customer: customer.name,
                  subject: customer.subject,
                  priority: "High",
                  assignee: "Sarah Miller",
                  status: "Open",
                  updated: "8 min ago",
                },
              ]).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id.replace("#", "")}`)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px",
                    borderBottom: "1px solid #f0f1f4",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12.5, color: "#292d3a", display: "block" }}>{t.subject}</strong>
                    <span style={{ fontSize: 11, color: "#8a929f" }}>{t.id} · Assignee: {t.assignee}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {activeTab === "notes" && (
            <Card style={{ padding: "20px" }}>
              <form onSubmit={handleAddNote} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add an internal note about this customer..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    style={{
                      flex: 1,
                      height: 38,
                      border: "1px solid #e1e4eb",
                      borderRadius: 7,
                      padding: "0 12px",
                      fontSize: 12,
                    }}
                  />
                  <Button type="submit" variant="primary">
                    Save Note
                  </Button>
                </div>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notes.map((n, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      background: "#fafbfc",
                      border: "1px solid #edf0f4",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#3a414f",
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Customer Sidebar Profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#292d3a", marginBottom: 14 }}>
              Account & Company
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 11.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Building size={15} color="#8a929f" />
                <span style={{ color: "#3a414f" }}>{customer.company}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={15} color="#8a929f" />
                <span style={{ color: "#3a414f" }}>{customer.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={15} color="#8a929f" />
                <span style={{ color: "#3a414f" }}>+1 (555) 234-8901</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Calendar size={15} color="#8a929f" />
                <span style={{ color: "#3a414f" }}>Customer since Jan 2024</span>
              </div>
            </div>
          </Card>

          <Card style={{ padding: "18px", background: "#fbfbfe", border: "1px dashed #d5d3f5" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <ShieldCheck size={16} color="#6459d8" />
              <strong style={{ fontSize: 12, color: "#2d3240" }}>Enterprise SLA</strong>
            </div>
            <p style={{ fontSize: 11, color: "#79808d", margin: 0, lineHeight: 1.5 }}>
              Guaranteed 15-minute response time. Dedicated account representative assigned.
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}
