import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Bot,
  Sparkles,
  Sliders,
  Check,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import { Button, Card, Badge, StatusBadge } from "../components/ui"
import { useApp } from "../context/AppContext"

export default function NewAgentPage() {
  const navigate = useNavigate()
  const { notify, setCreatedAgents } = useApp()

  const [name, setName] = useState("")
  const [role, setRole] = useState("General Support")
  const [model, setModel] = useState("GPT-4o")
  const [tone, setTone] = useState("Helpful & Empathetic")
  const [instructions, setInstructions] = useState(
    "You are a helpful customer support agent for SupportAI. Answer user inquiries with friendly, accurate, and concise guidance.",
  )
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const roles = [
    "General Support",
    "Billing Specialist",
    "Technical Support",
    "Onboarding Concierge",
    "Sales Assistant",
  ]

  const models = ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"]
  const tones = [
    "Helpful & Empathetic",
    "Direct & Concise",
    "Technical & Thorough",
    "Casual & Conversational",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim() || "New AI Assistant"
    setSubmitting(true)
    setTimeout(() => {
      setCreatedAgents((prev) => [...prev, trimmedName])
      notify(`Agent "${trimmedName}" created successfully!`)
      navigate("/agents")
    }, 400)
  }

  return (
    <main className="content">
      <div className="page-intro" style={{ marginBottom: 20 }}>
        <div>
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/agents")}
            style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to AI Agents
          </button>
          <div className="eyebrow">AUTOMATION / NEW AGENT</div>
          <h1>Create New AI Agent</h1>
          <p>Configure a specialized autonomous agent to assist your customers 24/7.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Form Card */}
        <Card style={{ padding: "28px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#292d3a", marginBottom: 4 }}>Agent Profile</h2>
              <p style={{ fontSize: 12, color: "#959ba7" }}>Define your agent's identity and primary role.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 650, color: "#3a4050" }} htmlFor="agent-name">
                Agent Name
              </label>
              <input
                id="agent-name"
                type="text"
                placeholder="e.g. Atlas, Nova, or Beacon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  height: 40,
                  border: "1px solid #e1e4eb",
                  borderRadius: 8,
                  padding: "0 12px",
                  fontSize: 13,
                  color: "#333846",
                  background: "#fff",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 650, color: "#3a4050" }}>Primary Specialty</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: role === r ? "1.5px solid #6459d8" : "1px solid #e1e4eb",
                      background: role === r ? "#f0efff" : "#fff",
                      color: role === r ? "#5549c5" : "#555b6a",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#edf0f3" }} />

            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#292d3a", marginBottom: 4 }}>Model & Intelligence</h2>
              <p style={{ fontSize: 12, color: "#959ba7" }}>Select the underlying foundation model and style.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 650, color: "#3a4050" }}>Foundation Model</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {models.map((m) => (
                  <div
                    key={m}
                    onClick={() => setModel(m)}
                    style={{
                      padding: "12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: model === m ? "2px solid #6459d8" : "1px solid #e1e4eb",
                      background: model === m ? "#f7f6ff" : "#fff",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 12, color: "#2d3240" }}>{m}</strong>
                      {model === m && <Check size={14} color="#6459d8" strokeWidth={2.5} />}
                    </div>
                    <span style={{ fontSize: 10, color: "#959ba7" }}>
                      {m.includes("GPT") ? "OpenAI" : m.includes("Claude") ? "Anthropic" : "Google"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 650, color: "#3a4050" }}>Conversation Tone</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: tone === t ? "1.5px solid #6459d8" : "1px solid #e1e4eb",
                      background: tone === t ? "#f0efff" : "#fff",
                      color: tone === t ? "#5549c5" : "#606775",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 650, color: "#3a4050" }} htmlFor="agent-prompt">
                System Instructions & Behavior
              </label>
              <textarea
                id="agent-prompt"
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                style={{
                  border: "1px solid #e1e4eb",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#333846",
                  background: "#fff",
                  lineHeight: 1.5,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ height: 1, background: "#edf0f3" }} />

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#292d3a", marginBottom: 2 }}>
                    Connect Knowledge Base
                  </h2>
                  <p style={{ fontSize: 11, color: "#959ba7" }}>
                    Enable agent to reference your documentation, FAQs, and guides.
                  </p>
                </div>
                <button
                  type="button"
                  className={`switch ${useKnowledgeBase ? "on" : ""}`}
                  onClick={() => setUseKnowledgeBase(!useKnowledgeBase)}
                  aria-label="Toggle knowledge base connection"
                >
                  <span />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Creating agent..." : "Create AI Agent"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/agents")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>LIVE CARD PREVIEW</div>
          <Card className="agent-card" style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
            <div className="agent-card-top">
              <div className="agent-avatar agent-violet">
                <Bot size={26} />
              </div>
              <Badge tone="green" dot>
                Ready
              </Badge>
            </div>
            <div className="agent-name-row">
              <h3>{name.trim() || "Agent Preview"}</h3>
              <StatusBadge status="Draft" />
            </div>
            <span className="agent-role">{role}</span>
            <p>{instructions.slice(0, 110)}...</p>
            <div className="agent-stats">
              <div>
                <span>Conversations</span>
                <strong>0</strong>
              </div>
              <div>
                <span>Resolution rate</span>
                <strong>—</strong>
              </div>
            </div>
            <div className="agent-footer">
              <span>
                <span className="model-dot" />
                {model}
              </span>
              <span style={{ fontSize: 11, color: "#776be5", fontWeight: 650 }}>{tone}</span>
            </div>
          </Card>

          <Card style={{ padding: "18px", background: "#fbfbfe", border: "1px dashed #d5d3f5" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ padding: 6, borderRadius: 6, background: "#eceaff", color: "#6459d8" }}>
                <Sparkles size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 12, color: "#2d3240" }}>Autonomous Supervision</strong>
                <p style={{ fontSize: 11, color: "#79808d", marginTop: 4, lineHeight: 1.5 }}>
                  Once deployed, this agent will evaluate confidence thresholds and escalate edge cases directly to human team members.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
